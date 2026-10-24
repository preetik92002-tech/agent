/*
 * data.js — the ONE place employee profiles and demo seed data live.
 * Phase 2: replace/extend this with profiles loaded from the Python backend.
 */
window.AEO = window.AEO || {};

AEO.STATUSES = ['Pending', 'In Progress', 'Needs Review', 'Completed'];
AEO.PRIORITIES = ['High', 'Medium', 'Low'];

AEO.EMPLOYEES = [
  {
    id: 'anne', name: 'Anne', role: 'Central AI Operator', color: '#a78bfa', face: '#d9d4ea',
    keywords: [],
    idleLine: 'Standing by to coordinate the team.',
    bio: 'The team\'s main operator. In a future phase Anne will assign tasks, coordinate replies, manage speaking turns and compile reports.',
    duties: ['Receive and triage new tasks', 'Assign work to the right specialist', 'Keep track of team progress', 'Compile summary reports (Phase 2)']
  },
  {
    id: 'tim', name: 'Tim', role: 'Research Analyst', color: '#38bdf8', face: '#cfe3ee',
    keywords: ['research', 'competitor', 'market', 'trend', 'analysis', 'analyze', 'survey', 'study', 'benchmark'],
    idleLine: 'Waiting for the next research request.',
    bio: 'Digs into markets, competitors and trends, and turns findings into short, usable briefs.',
    duties: ['Competitor and market research', 'Trend summaries', 'Fact-checking claims', 'Briefing the other employees']
  },
  {
    id: 'dwayne', name: 'Dwayne', role: 'Marketing Specialist', color: '#f472b6', face: '#e4e0f1',
    keywords: ['marketing', 'campaign', 'social', 'email', 'newsletter', 'blog', 'brand', 'ad ', 'ads', 'launch', 'content', 'seo'],
    idleLine: 'Brainstorming campaign ideas.',
    bio: 'Plans campaigns and writes the words and visuals that tell the product\'s story.',
    duties: ['Campaign planning', 'Social media and email copy', 'Brand messaging', 'Launch announcements']
  },
  {
    id: 'bryan', name: 'Bryan', role: 'Sales Specialist', color: '#fb923c', face: '#f1ddc9',
    keywords: ['sales', 'lead', 'client', 'customer', 'prospect', 'pitch', 'deal', 'call', 'outreach', 'quote', 'follow up', 'follow-up'],
    idleLine: 'Looking over the lead list.',
    bio: 'Works leads and prospects, prepares pitches and keeps the sales pipeline moving.',
    duties: ['Lead follow-ups', 'Pitch and call scripts', 'Pipeline tracking', 'Customer outreach']
  },
  {
    id: 'kelvin', name: 'Kelvin', role: 'Operations Manager', color: '#34d399', face: '#d2e8dc',
    keywords: ['operations', 'schedule', 'vendor', 'supplier', 'inventory', 'process', 'logistics', 'onboarding', 'checklist', 'workflow', 'shipping'],
    idleLine: 'All operations tasks are up to date.',
    bio: 'Keeps day-to-day work running: schedules, vendors, processes and checklists.',
    duties: ['Scheduling and logistics', 'Vendor coordination', 'Process improvement', 'Checklists and onboarding']
  },
  {
    id: 'kelsey', name: 'Kelsey', role: 'Finance Analyst', color: '#facc15', face: '#f3d9e2',
    keywords: ['finance', 'budget', 'cost', 'invoice', 'expense', 'revenue', 'forecast', 'pricing', 'price', 'payment', 'profit'],
    idleLine: 'Reviewing the latest numbers.',
    bio: 'Estimates budgets, tracks spending and flags financial risks early.',
    duties: ['Budget estimates', 'Expense tracking', 'Revenue forecasts', 'Flagging financial risks']
  }
];

AEO.employeeById = function (id) {
  return AEO.EMPLOYEES.find(function (e) { return e.id === id; });
};

/*
 * DEMO ONLY: Anne's "routing" is a plain keyword match, not AI.
 * Phase 2: replace this function with a call to the real orchestrator.
 */
AEO.demoRoute = function (title) {
  var text = ' ' + title.toLowerCase() + ' ';
  for (var i = 0; i < AEO.EMPLOYEES.length; i++) {
    var emp = AEO.EMPLOYEES[i];
    for (var k = 0; k < emp.keywords.length; k++) {
      if (text.indexOf(emp.keywords[k]) !== -1) {
        return { empId: emp.id, reason: 'keyword “' + emp.keywords[k].trim() + '”' };
      }
    }
  }
  return { empId: 'anne', reason: 'no keyword matched, so Anne keeps it' };
};

/* Sample data. `now` is passed in so timestamps are relative to first load / reset. */
AEO.makeSeed = function (now) {
  var min = 60000;
  var tasks = [
    { id: 1, title: 'Competitor pricing research', assignee: 'tim', priority: 'High', status: 'In Progress', createdAt: now - 50 * min },
    { id: 2, title: 'Summarize Q4 market trends', assignee: 'tim', priority: 'Medium', status: 'Pending', createdAt: now - 45 * min },
    { id: 3, title: 'Draft product launch email', assignee: 'dwayne', priority: 'Medium', status: 'Pending', createdAt: now - 20 * min },
    { id: 4, title: 'Plan social media calendar', assignee: 'dwayne', priority: 'Low', status: 'Needs Review', createdAt: now - 130 * min },
    { id: 5, title: 'Follow up with warm leads', assignee: 'bryan', priority: 'High', status: 'In Progress', createdAt: now - 80 * min },
    { id: 6, title: 'Prepare sales call script', assignee: 'bryan', priority: 'Medium', status: 'Completed', createdAt: now - 300 * min },
    { id: 7, title: 'Update vendor schedule', assignee: 'kelvin', priority: 'Low', status: 'Completed', createdAt: now - 200 * min },
    { id: 8, title: 'Streamline onboarding checklist', assignee: 'kelvin', priority: 'Medium', status: 'Completed', createdAt: now - 400 * min },
    { id: 9, title: 'Budget estimate for Q4 campaign', assignee: 'kelsey', priority: 'High', status: 'Needs Review', createdAt: now - 60 * min },
    { id: 10, title: 'Compile weekly team summary', assignee: 'anne', priority: 'Medium', status: 'In Progress', createdAt: now - 30 * min }
  ];
  var activity = [
    { id: 1, empId: 'kelsey', text: 'submitted a budget estimate for review', ts: now - 2 * min },
    { id: 2, empId: 'kelvin', text: 'marked “Update vendor schedule” complete', ts: now - 9 * min },
    { id: 3, empId: 'dwayne', text: 'received a marketing task: “Draft product launch email”', ts: now - 18 * min },
    { id: 4, empId: 'tim', text: 'started competitor research', ts: now - 31 * min },
    { id: 5, empId: 'anne', text: 'created a research task', ts: now - 47 * min },
    { id: 6, empId: 'bryan', text: 'started following up with warm leads', ts: now - 75 * min },
    { id: 7, empId: 'dwayne', text: 'submitted the social media calendar for review', ts: now - 120 * min }
  ];
  return { version: 1, nextTaskId: 11, nextActivityId: 8, tasks: tasks, activity: activity, settings: { reduceMotion: false } };
};
