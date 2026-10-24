/*
 * store.js — all demo state, persistence (localStorage) and actions.
 * The UI never edits state directly; it calls these functions.
 * Phase 2: swap the bodies for calls to the FastAPI backend; the UI stays the same.
 */
window.AEO = window.AEO || {};

(function () {
  var KEY = 'aeo.state.v1';
  var state;
  var listeners = [];
  var storageOk = true;

  function isValid(s) {
    return s && s.version === 1 && Array.isArray(s.tasks) && Array.isArray(s.activity) &&
      typeof s.nextTaskId === 'number' && typeof s.nextActivityId === 'number' &&
      s.tasks.every(function (t) {
        return t && typeof t.title === 'string' && AEO.employeeById(t.assignee) &&
          AEO.STATUSES.indexOf(t.status) !== -1 && AEO.PRIORITIES.indexOf(t.priority) !== -1;
      }) &&
      s.activity.every(function (a) { return a && typeof a.text === 'string' && AEO.employeeById(a.empId); });
  }

  function load() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!isValid(parsed)) return null;
      parsed.settings = parsed.settings || { reduceMotion: false };
      return parsed;
    } catch (e) { storageOk = false; return null; }
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); }
    catch (e) { storageOk = false; }
  }

  function emit() { save(); listeners.forEach(function (fn) { fn(state); }); }

  function log(empId, text, tsOffset) {
    state.activity.unshift({ id: state.nextActivityId++, empId: empId, text: text, ts: Date.now() + (tsOffset || 0) });
    if (state.activity.length > 100) state.activity.length = 100;
  }

  function nameOf(id) { return AEO.employeeById(id).name; }
  function findTask(id) { return state.tasks.find(function (t) { return t.id === id; }); }

  var store = {
    init: function () { state = load() || AEO.makeSeed(Date.now()); save(); },
    get: function () { return state; },
    isPersistent: function () { return storageOk; },
    subscribe: function (fn) { listeners.push(fn); },

    /* Returns { ok:true, task } or { ok:false, error } */
    createTask: function (opts) {
      var title = (opts.title || '').replace(/\s+/g, ' ').trim();
      if (title.length < 3) return { ok: false, error: 'Please enter a task title of at least 3 characters.' };
      if (title.length > 120) return { ok: false, error: 'Task titles can be at most 120 characters.' };
      if (!AEO.employeeById(opts.assignee)) return { ok: false, error: 'Please choose an employee.' };
      var priority = AEO.PRIORITIES.indexOf(opts.priority) !== -1 ? opts.priority : 'Medium';
      var task = { id: state.nextTaskId++, title: title, assignee: opts.assignee, priority: priority, status: 'Pending', createdAt: Date.now() };
      state.tasks.push(task);
      if (opts.viaAnne) log('anne', 'routed “' + title + '” to ' + nameOf(task.assignee) + ' (demo keyword routing)', -1);
      log(task.assignee, 'received a new task: “' + title + '”');
      emit();
      return { ok: true, task: task };
    },

    setStatus: function (taskId, status) {
      var t = findTask(taskId);
      if (!t || AEO.STATUSES.indexOf(status) === -1 || t.status === status) return;
      t.status = status;
      var q = '“' + t.title + '”';
      var text = {
        'Pending': 'moved ' + q + ' back to Pending',
        'In Progress': 'started ' + q,
        'Needs Review': 'submitted ' + q + ' for review',
        'Completed': 'marked ' + q + ' complete'
      }[status];
      log(t.assignee, text);
      emit();
    },

    reassign: function (taskId, empId) {
      var t = findTask(taskId);
      if (!t || !AEO.employeeById(empId) || t.assignee === empId) return;
      var from = nameOf(t.assignee);
      t.assignee = empId;
      log(empId, 'received “' + t.title + '” (reassigned from ' + from + ')');
      emit();
    },

    deleteTask: function (taskId) {
      var t = findTask(taskId);
      if (!t) return;
      state.tasks = state.tasks.filter(function (x) { return x.id !== taskId; });
      log(t.assignee, 'had “' + t.title + '” removed from their list');
      emit();
    },

    setSetting: function (key, value) { state.settings[key] = value; emit(); },

    reset: function () { state = AEO.makeSeed(Date.now()); emit(); },

    /* ---- derived data ---- */
    tasksFor: function (empId) { return state.tasks.filter(function (t) { return t.assignee === empId; }); },
    activityFor: function (empId) { return state.activity.filter(function (a) { return a.empId === empId; }); },

    /* Employee status is derived from their tasks, so it can never go out of sync. */
    statusFor: function (empId) {
      var mine = store.tasksFor(empId);
      var has = function (s) { return mine.some(function (t) { return t.status === s; }); };
      if (has('In Progress')) return 'working';
      if (has('Needs Review')) return 'reviewing';
      if (has('Pending')) return 'online';
      return 'idle';
    },

    currentLineFor: function (empId) {
      var mine = store.tasksFor(empId);
      var order = ['In Progress', 'Needs Review', 'Pending'];
      for (var i = 0; i < order.length; i++) {
        var t = mine.find(function (x) { return x.status === order[i]; });
        if (t) return { text: t.title, kind: order[i] };
      }
      return { text: AEO.employeeById(empId).idleLine, kind: null };
    },

    stats: function () {
      var c = function (s) { return state.tasks.filter(function (t) { return t.status === s; }).length; };
      return {
        employees: AEO.EMPLOYEES.length,
        active: c('Pending') + c('In Progress') + c('Needs Review'),
        completed: c('Completed'),
        approvals: c('Needs Review')
      };
    }
  };

  AEO.store = store;
})();
