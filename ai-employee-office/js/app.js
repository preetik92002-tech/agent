/*
 * app.js — rendering and event handling only. Data lives in data.js, state in store.js.
 */
(function () {
  var store = AEO.store;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var TITLES = { overview: 'Overview', employees: 'Employees', tasks: 'Tasks', activity: 'Team Activity', settings: 'Settings' };
  var STATUS_LABEL = { working: 'Working', reviewing: 'Reviewing', online: 'Online', idle: 'Idle' };

  var currentView = 'overview';
  var openEmpId = null;
  var query = '';

  /* ---------- helpers ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function relTime(ts) {
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 45) return 'just now';
    var m = Math.round(s / 60);
    if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60);
    if (h < 24) return h + ' h ago';
    var d = Math.round(h / 24);
    return d + ' d ago';
  }

  function toast(msg) {
    var el = $('#toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { el.classList.remove('show'); }, 2600);
  }

  function matchesEmp(e) {
    if (!query) return true;
    return (e.name + ' ' + e.role).toLowerCase().indexOf(query) !== -1;
  }
  function matchesTask(t) {
    if (!query) return true;
    var e = AEO.employeeById(t.assignee);
    return (t.title + ' ' + e.name + ' ' + t.priority + ' ' + t.status).toLowerCase().indexOf(query) !== -1;
  }
  function matchesAct(a) {
    if (!query) return true;
    return (AEO.employeeById(a.empId).name + ' ' + a.text).toLowerCase().indexOf(query) !== -1;
  }

  function empty(msg) { return '<div class="empty">' + msg + '</div>'; }
  function noMatch(what) { return empty('No ' + what + ' match “' + esc(query) + '”. <button class="link" type="button" data-action="clear-search">Clear search</button>'); }

  function options(list, selected, labelFn) {
    return list.map(function (x) {
      var v = typeof x === 'string' ? x : x.id;
      var l = labelFn ? labelFn(x) : v;
      return '<option value="' + esc(v) + '"' + (v === selected ? ' selected' : '') + '>' + esc(l) + '</option>';
    }).join('');
  }

  /* ---------- renderers ---------- */
  function renderStats() {
    var s = store.stats();
    var items = [
      ['Total employees', s.employees, 'AI teammates in the office'],
      ['Active tasks', s.active, 'Pending, in progress or in review'],
      ['Completed tasks', s.completed, 'Finished so far'],
      ['Pending approvals', s.approvals, 'Waiting in “Needs Review”']
    ];
    $('#stats').innerHTML = items.map(function (i) {
      return '<div class="stat"><span class="stat-label">' + i[0] + '</span><span class="stat-num">' + i[1] + '</span><span class="stat-sub">' + i[2] + '</span></div>';
    }).join('');
  }

  function empCard(e) {
    var st = store.statusFor(e.id);
    var cur = store.currentLineFor(e.id);
    var kind = cur.kind ? '<span class="doing-kind">' + esc(cur.kind) + '</span>' : '<span class="doing-kind">Free</span>';
    return '<article class="emp-card st-' + st + '" data-emp="' + e.id + '" style="--c:' + e.color + '">' +
      AEO.avatarHtml(e, st) +
      '<div class="emp-info">' +
        '<div class="emp-name"><h3>' + e.name + '</h3><span class="status st-' + st + '"><i></i>' + STATUS_LABEL[st] + '</span></div>' +
        '<p class="role">' + e.role + '</p>' +
        '<p class="doing">' + kind + ' ' + esc(cur.text) + '</p>' +
        '<button class="btn small" type="button" data-action="open-emp" data-id="' + e.id + '">View details<span class="sr-only"> for ' + e.name + '</span></button>' +
      '</div></article>';
  }

  function renderGrid(target) {
    var list = AEO.EMPLOYEES.filter(matchesEmp);
    $(target).innerHTML = list.length ? list.map(empCard).join('') : noMatch('employees');
  }

  function feedItem(a) {
    var e = AEO.employeeById(a.empId);
    return '<li class="feed-item"><span class="dot" style="--c:' + e.color + '" aria-hidden="true">' + e.name[0] + '</span>' +
      '<div><p><strong>' + e.name + '</strong> ' + esc(a.text) + '</p>' +
      '<time datetime="' + new Date(a.ts).toISOString() + '" title="' + esc(new Date(a.ts).toLocaleString()) + '">' + relTime(a.ts) + '</time></div></li>';
  }

  function renderFeed(target, limit, list) {
    var items = (list || store.get().activity).filter(matchesAct);
    if (limit) items = items.slice(0, limit);
    $(target).innerHTML = items.length ? items.map(feedItem).join('') :
      '<li>' + (query ? noMatch('events') : empty('No activity yet. Create or move a task and it will show up here.')) + '</li>';
  }

  function renderAnne() {
    var anne = AEO.employeeById('anne');
    var st = store.statusFor('anne');
    $('#anneAvatar').innerHTML = AEO.avatarHtml(anne, st);
    $('#anneStatus').innerHTML = '<span class="status st-' + st + '"><i></i>' + STATUS_LABEL[st] + '</span> <span class="muted">' + esc(store.currentLineFor('anne').text) + '</span>';
    $('#anneSummary').innerHTML = AEO.EMPLOYEES.filter(function (e) { return e.id !== 'anne'; }).map(function (e) {
      var mine = store.tasksFor(e.id);
      var open = mine.filter(function (t) { return t.status !== 'Completed'; }).length;
      return '<button type="button" class="sum-chip" style="--c:' + e.color + '" data-action="open-emp" data-id="' + e.id + '" aria-label="' + e.name + ': ' + open + ' open tasks. Open details">' +
        '<b>' + e.name + '</b><span>' + open + ' open</span></button>';
    }).join('');
  }

  function taskCard(t) {
    var e = AEO.employeeById(t.assignee);
    return '<article class="task prio-' + t.priority.toLowerCase() + '" style="--c:' + e.color + '">' +
      '<div class="task-top"><h4>' + esc(t.title) + '</h4>' +
      '<button class="icon-btn tiny" type="button" data-action="delete-task" data-id="' + t.id + '" aria-label="Delete task: ' + esc(t.title) + '"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="task-meta"><span class="chip prio">' + t.priority + ' priority</span><span class="chip who"><i></i>' + e.name + '</span></div>' +
      '<div class="task-ctl">' +
        '<label><span>Status</span><select data-action="status" data-id="' + t.id + '" data-fk="s' + t.id + '">' + options(AEO.STATUSES, t.status) + '</select></label>' +
        '<label><span>Assignee</span><select data-action="reassign" data-id="' + t.id + '" data-fk="a' + t.id + '">' + options(AEO.EMPLOYEES, t.assignee, function (x) { return x.name; }) + '</select></label>' +
      '</div></article>';
  }

  function renderBoard() {
    var tasks = store.get().tasks;
    var shown = tasks.filter(matchesTask);
    if (!tasks.length) {
      $('#board').innerHTML = empty('No tasks yet. Add one above to get started.');
      return;
    }
    if (!shown.length) { $('#board').innerHTML = noMatch('tasks'); return; }
    $('#board').innerHTML = AEO.STATUSES.map(function (s) {
      var col = shown.filter(function (t) { return t.status === s; });
      return '<section class="col" aria-label="' + s + ', ' + col.length + ' tasks"><h3>' + s + ' <span class="count">' + col.length + '</span></h3>' +
        (col.length ? col.map(taskCard).join('') : '<div class="empty small">Nothing here</div>') + '</section>';
    }).join('');
  }

  function renderDialog() {
    var dlg = $('#empDialog');
    if (!openEmpId) return;
    var e = AEO.employeeById(openEmpId);
    var st = store.statusFor(e.id);
    var tasks = store.tasksFor(e.id);
    var acts = store.activityFor(e.id).slice(0, 6);
    dlg.innerHTML =
      '<div class="dlg-head" style="--c:' + e.color + '">' + AEO.avatarHtml(e, st) +
        '<div><h2 id="dlgName">' + e.name + '</h2><p class="role">' + e.role + '</p>' +
        '<span class="status st-' + st + '"><i></i>' + STATUS_LABEL[st] + '</span></div>' +
        '<button class="icon-btn close" type="button" data-action="close-emp" aria-label="Close details"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="dlg-body">' +
        '<section><h3>About</h3><p>' + e.bio + '</p><h3>Responsibilities</h3><ul class="plain">' + e.duties.map(function (d) { return '<li>' + d + '</li>'; }).join('') + '</ul></section>' +
        '<section><h3>Assigned tasks <span class="count">' + tasks.length + '</span></h3>' +
          (tasks.length ? tasks.map(function (t) {
            return '<div class="mini-task"><span>' + esc(t.title) + '<small>' + t.priority + ' priority</small></span>' +
              '<label><span class="sr-only">Status for ' + esc(t.title) + '</span><select data-action="status" data-id="' + t.id + '" data-fk="d' + t.id + '">' + options(AEO.STATUSES, t.status) + '</select></label></div>';
          }).join('') : empty('No tasks assigned to ' + e.name + ' yet.')) + '</section>' +
        '<section><h3>Recent activity</h3>' +
          (acts.length ? '<ul class="feed compact">' + acts.map(feedItem).join('') + '</ul>' : empty('No activity for ' + e.name + ' yet.')) + '</section>' +
        '<section class="comm"><h3>Communication <span class="tag">Phase 2</span></h3>' +
          '<p class="muted">Agent communication will be connected in Phase 2.</p>' +
          '<div class="row"><label class="sr-only" for="commInput">Message to ' + e.name + ' (not available yet)</label>' +
          '<input id="commInput" type="text" placeholder="Messaging is not available in Phase 1" disabled>' +
          '<button class="btn" type="button" disabled>Send</button></div></section>' +
      '</div>';
  }

  function renderNotifications() {
    var pend = store.get().tasks.filter(function (t) { return t.status === 'Needs Review'; });
    var badge = $('#bellCount');
    badge.hidden = pend.length === 0;
    badge.textContent = pend.length;
    $('#bellBtn').setAttribute('aria-label', 'Notifications: ' + pend.length + ' item' + (pend.length === 1 ? '' : 's') + ' waiting for review');
    $('#notifPanel').innerHTML = '<h2>Waiting for review</h2>' + (pend.length ?
      '<ul>' + pend.map(function (t) { return '<li><strong>' + esc(t.title) + '</strong><span class="muted"> · ' + AEO.employeeById(t.assignee).name + '</span></li>'; }).join('') + '</ul>' :
      '<p class="muted">Nothing is waiting for review.</p>') +
      '<a class="btn small" href="#tasks" data-action="close-notif">Open task board</a>';
  }

  function renderSearchNote() {
    var n = $('#searchNote');
    if (!query) { n.hidden = true; return; }
    n.hidden = false;
    n.innerHTML = 'Filtering by “' + esc(query) + '” <button class="link" type="button" data-action="clear-search">Clear</button>';
  }

  function render() {
    var fk = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.fk : null;
    renderStats();
    renderAnne();
    renderGrid('#gridOverview');
    renderGrid('#gridEmployees');
    renderFeed('#feedOverview', 6);
    renderFeed('#feedFull');
    renderBoard();
    renderNotifications();
    renderSearchNote();
    renderDialog();
    if (fk) { var el = document.querySelector('[data-fk="' + fk + '"]'); if (el) el.focus(); }
  }

  /* ---------- navigation ---------- */
  function showView(view) {
    if (!TITLES[view]) view = 'overview';
    currentView = view;
    $$('.view').forEach(function (s) { s.hidden = s.dataset.view !== view; });
    $$('.nav-link').forEach(function (a) {
      var on = a.dataset.view === view;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#pageTitle').textContent = TITLES[view];
    document.title = TITLES[view] + ' · AI Employee Office';
  }

  function onHash() { showView(location.hash.replace('#', '')); }

  /* ---------- clock ---------- */
  function tickClock() {
    var d = new Date();
    $('#clock').textContent = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) + ' · ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  /* ---------- dialogs ---------- */
  function openEmp(id) {
    if (!AEO.employeeById(id)) return;
    openEmpId = id;
    renderDialog();
    var dlg = $('#empDialog');
    if (!dlg.open) dlg.showModal();
  }
  function closeEmp() { var d = $('#empDialog'); if (d.open) d.close(); }

  function confirmReset() {
    var dlg = $('#confirmDialog');
    dlg.returnValue = '';
    dlg.showModal();
  }

  /* ---------- events ---------- */
  function bindEvents() {
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-action]');
      if (btn) {
        var a = btn.dataset.action;
        if (a === 'open-emp') return openEmp(btn.dataset.id);
        if (a === 'close-emp') return closeEmp();
        if (a === 'clear-search') { $('#search').value = ''; query = ''; render(); return; }
        if (a === 'close-notif') { toggleNotif(false); return; }
        if (a === 'delete-task') {
          var id = Number(btn.dataset.id);
          var t = store.get().tasks.find(function (x) { return x.id === id; });
          store.deleteTask(id);
          if (t) toast('Deleted “' + t.title + '”');
          return;
        }
      }
      var card = ev.target.closest('.emp-card');
      if (card && !btn) return openEmp(card.dataset.emp);
      if (!ev.target.closest('.notif')) toggleNotif(false);
    });

    document.addEventListener('change', function (ev) {
      var el = ev.target.closest('select[data-action]');
      if (!el) return;
      var id = Number(el.dataset.id);
      if (el.dataset.action === 'status') store.setStatus(id, el.value);
      if (el.dataset.action === 'reassign') store.reassign(id, el.value);
    });

    $('#empDialog').addEventListener('click', function (ev) { if (ev.target === ev.currentTarget) closeEmp(); });
    $('#empDialog').addEventListener('close', function () { openEmpId = null; });

    $('#search').addEventListener('input', function (ev) { query = ev.target.value.trim().toLowerCase(); render(); });

    $('#bellBtn').addEventListener('click', function (ev) { ev.stopPropagation(); toggleNotif($('#notifPanel').hidden); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') toggleNotif(false); });

    $('#anneForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = $('#anneInput'), msg = $('#anneResult');
      var title = input.value;
      if (title.replace(/\s+/g, ' ').trim().length < 3) {
        msg.className = 'form-msg error';
        msg.textContent = 'Please describe the task (at least 3 characters).';
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      var route = AEO.demoRoute(title);
      var res = store.createTask({ title: title, assignee: route.empId, priority: 'Medium', viaAnne: true });
      if (!res.ok) { msg.className = 'form-msg error'; msg.textContent = res.error; return; }
      var who = AEO.employeeById(route.empId).name;
      msg.className = 'form-msg ok';
      msg.textContent = 'Demo routing: assigned to ' + who + ' (' + route.reason + '). This is keyword matching, not AI.';
      input.value = '';
      toast('Task assigned to ' + who);
    });

    $('#taskForm').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var input = $('#taskTitle'), msg = $('#taskMsg');
      var res = store.createTask({ title: input.value, assignee: $('#taskAssignee').value, priority: $('#taskPriority').value });
      if (!res.ok) {
        msg.className = 'form-msg full error';
        msg.textContent = res.error;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      msg.className = 'form-msg full ok';
      msg.textContent = 'Added “' + res.task.title + '” for ' + AEO.employeeById(res.task.assignee).name + '.';
      input.value = '';
      input.focus();
    });

    $('#resetBtn').addEventListener('click', confirmReset);
    $('#confirmDialog').addEventListener('close', function () {
      if (this.returnValue === 'ok') {
        store.reset();
        query = ''; $('#search').value = '';
        $('#anneResult').textContent = ''; $('#taskMsg').textContent = '';
        toast('Demo data restored');
      }
    });

    $('#reduceMotion').addEventListener('change', function (ev) { store.setSetting('reduceMotion', ev.target.checked); });
  }

  function toggleNotif(open) {
    var p = $('#notifPanel');
    p.hidden = !open;
    $('#bellBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function applySettings(s) {
    document.documentElement.classList.toggle('reduce-motion', !!(s.settings && s.settings.reduceMotion));
    $('#reduceMotion').checked = !!(s.settings && s.settings.reduceMotion);
  }

  /* ---------- start ---------- */
  function init() {
    store.init();
    $('#taskAssignee').innerHTML = options(AEO.EMPLOYEES, 'tim', function (e) { return e.name + ' — ' + e.role; });
    $('#taskPriority').innerHTML = options(AEO.PRIORITIES, 'Medium');
    $('#storageNote').textContent = store.isPersistent() ?
      'Your demo data is saved in this browser (localStorage).' :
      'Your browser is blocking storage, so changes will be lost on refresh.';
    store.subscribe(function (s) { applySettings(s); render(); });
    bindEvents();
    window.addEventListener('hashchange', onHash);
    onHash();
    applySettings(store.get());
    render();
    tickClock();
    setInterval(function () { tickClock(); renderFeed('#feedOverview', 6); renderFeed('#feedFull'); }, 30000);
  }

  init();
})();
