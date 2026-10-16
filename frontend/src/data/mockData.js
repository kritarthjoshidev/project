// ─── Mock Data for Task Management App ───────────────────────────────────────

export const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
export const STATUSES = ['Todo', 'In Progress', 'Review', 'Done'];
export const CATEGORIES = ['Frontend', 'Backend', 'Design', 'DevOps', 'Testing', 'Documentation'];

export const TEAM_MEMBERS = [
  { id: 1, name: 'Rahul Sharma',   initials: 'RS', color: '#6366f1' },
  { id: 2, name: 'Priya Mehta',    initials: 'PM', color: '#0ea5e9' },
  { id: 3, name: 'Arjun Singh',    initials: 'AS', color: '#8b5cf6' },
  { id: 4, name: 'Neha Gupta',     initials: 'NG', color: '#10b981' },
  { id: 5, name: 'Dev Kumar',      initials: 'DK', color: '#f59e0b' },
];

export const INITIAL_TASKS = [
  {
    id: 1,
    title: 'Design System Setup',
    description: 'Create reusable component library with design tokens, color palette, and typography system.',
    priority: 'High',
    status: 'Done',
    category: 'Design',
    assignee: TEAM_MEMBERS[1],
    dueDate: '2026-10-10',
    progress: 100,
    createdAt: '2026-10-01',
  },
  {
    id: 2,
    title: 'User Authentication Flow',
    description: 'Implement JWT-based login, signup, and session management with refresh tokens.',
    priority: 'Critical',
    status: 'In Progress',
    category: 'Backend',
    assignee: TEAM_MEMBERS[0],
    dueDate: '2026-10-18',
    progress: 65,
    createdAt: '2026-10-03',
  },
  {
    id: 3,
    title: 'Dashboard Analytics Charts',
    description: 'Integrate Recharts for task completion graphs, burndown chart, and team velocity.',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Frontend',
    assignee: TEAM_MEMBERS[2],
    dueDate: '2026-10-20',
    progress: 40,
    createdAt: '2026-10-05',
  },
  {
    id: 4,
    title: 'REST API Documentation',
    description: 'Write Swagger/OpenAPI docs for all task management endpoints.',
    priority: 'Low',
    status: 'Todo',
    category: 'Documentation',
    assignee: TEAM_MEMBERS[4],
    dueDate: '2026-10-25',
    progress: 0,
    createdAt: '2026-10-06',
  },
  {
    id: 5,
    title: 'CI/CD Pipeline Setup',
    description: 'Configure GitHub Actions for automated testing, linting, and deployment to production.',
    priority: 'High',
    status: 'Review',
    category: 'DevOps',
    assignee: TEAM_MEMBERS[3],
    dueDate: '2026-10-16',
    progress: 85,
    createdAt: '2026-10-07',
  },
  {
    id: 6,
    title: 'Task CRUD API Endpoints',
    description: 'Build Express routes for creating, reading, updating, and deleting tasks with validation.',
    priority: 'Critical',
    status: 'Done',
    category: 'Backend',
    assignee: TEAM_MEMBERS[0],
    dueDate: '2026-10-12',
    progress: 100,
    createdAt: '2026-10-04',
  },
  {
    id: 7,
    title: 'Mobile Responsive UI',
    description: 'Ensure all pages work flawlessly on mobile, tablet, and desktop breakpoints.',
    priority: 'Medium',
    status: 'Todo',
    category: 'Frontend',
    assignee: TEAM_MEMBERS[2],
    dueDate: '2026-10-28',
    progress: 10,
    createdAt: '2026-10-08',
  },
  {
    id: 8,
    title: 'Unit & Integration Tests',
    description: 'Write Jest tests for all utility functions and Supertest integration tests for APIs.',
    priority: 'High',
    status: 'Todo',
    category: 'Testing',
    assignee: TEAM_MEMBERS[4],
    dueDate: '2026-10-30',
    progress: 0,
    createdAt: '2026-10-09',
  },
];

// ─── Helper Utilities ─────────────────────────────────────────────────────────

export const getDueDateStatus = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  return 'upcoming';
};

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const getPriorityClass = (priority) => {
  const map = { Critical: 'critical', High: 'high', Medium: 'medium', Low: 'low' };
  return map[priority] || 'low';
};

export const getStatusClass = (status) => {
  const map = { Todo: 'todo', 'In Progress': 'inprogress', Review: 'review', Done: 'done' };
  return map[status] || 'todo';
};

export const getProgressColor = (progress) => {
  if (progress === 100) return '#10b981';
  if (progress >= 60) return '#6366f1';
  if (progress >= 30) return '#f59e0b';
  return '#ef4444';
};

// Collision-safe ID: timestamp base + random suffix avoids resets on page refresh
export const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
