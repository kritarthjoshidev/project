const mongoose = require('mongoose');
const Task = require('../models/Task');

// ─── Helper: Format Mongoose Validation Errors ────────────────────────────────
const formatValidationErrors = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return { error: 'Validation failed', details: errors };
};

// ─── Helper: Strict User Isolation Filter ────────────────────────────────────
// Ensures users can ONLY see, edit, or delete tasks belonging to them
const getOwnerFilter = (userId) => {
  if (!userId) return {};
  return { owner: userId };
};

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
// Query params: status, priority, category, search, page, limit, sortBy, sortOrder
const getAllTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Strict bounds validation and clamping for pagination
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    const safePage = (!Number.isInteger(parsedPage) || parsedPage < 1) ? 1 : parsedPage;
    const safeLimit = (!Number.isInteger(parsedLimit) || parsedLimit < 1)
      ? 50
      : Math.min(parsedLimit, 100); // clamp limit to maximum 100 per page

    // Build filter strictly isolated to the authenticated user
    const filter = { ...getOwnerFilter(req.user?.id) };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (search && typeof search === 'string' && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Pagination
    const skip = (safePage - 1) * safeLimit;
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const allowedSortFields = ['title', 'priority', 'status', 'dueDate', 'createdAt', 'progress'];
    const resolvedSort = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .sort({ [resolvedSort]: sortDir })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Task.countDocuments(filter),
    ]);

    res.json({
      tasks,
      pagination: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
const getTaskById = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, ...getOwnerFilter(req.user?.id) };
    const task = await Task.findOne(filter).lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid task ID format' });
    next(err);
  }
};

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
const createTask = async (req, res, next) => {
  try {
    const taskData = { ...req.body };
    if (req.user?.id) {
      taskData.owner = req.user.id;
    }
    const task = new Task(taskData);
    const saved = await task.save();
    res.status(201).json(saved.toJSON());
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(422).json(formatValidationErrors(err));
    next(err);
  }
};

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
const updateTask = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, ...getOwnerFilter(req.user?.id) };
    const task = await Task.findOne(filter);
    if (!task) return res.status(404).json({ error: 'Task not found or access denied' });

    // Merge fields selectively
    const allowedFields = ['title', 'description', 'priority', 'status', 'category', 'assignee', 'dueDate', 'progress'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    const updated = await task.save();
    res.json(updated.toJSON());
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid task ID format' });
    if (err.name === 'ValidationError') return res.status(422).json(formatValidationErrors(err));
    next(err);
  }
};

// ─── PATCH /api/tasks/:id/status ─────────────────────────────────────────────
const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Todo', 'In Progress', 'Review', 'Done'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        validValues: validStatuses,
      });
    }

    const filter = { _id: req.params.id, ...getOwnerFilter(req.user?.id) };
    const task = await Task.findOne(filter);
    if (!task) return res.status(404).json({ error: 'Task not found or access denied' });

    task.status = status;
    const updated = await task.save();
    res.json(updated.toJSON());
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid task ID format' });
    next(err);
  }
};

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
const deleteTask = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id, ...getOwnerFilter(req.user?.id) };
    const task = await Task.findOneAndDelete(filter);
    if (!task) return res.status(404).json({ error: 'Task not found or access denied' });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid task ID format' });
    next(err);
  }
};

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────────
const getTaskStats = async (req, res, next) => {
  try {
    const ownerFilter = getOwnerFilter(req.user?.id);

    const matchStage = {};
    if (req.user?.id) {
      matchStage.owner = new mongoose.Types.ObjectId(req.user.id);
    }

    const [statusCounts, priorityCounts, total] = await Promise.all([
      Task.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: matchStage },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      Task.countDocuments(ownerFilter),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdue = await Task.countDocuments({
      ...ownerFilter,
      dueDate: { $lt: today },
      status: { $ne: 'Done' },
    });

    const byStatus = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));
    const byPriority = Object.fromEntries(priorityCounts.map((p) => [p._id, p.count]));
    const done = byStatus['Done'] || 0;

    res.json({
      total,
      overdue,
      done,
      inProgress: byStatus['In Progress'] || 0,
      todo: byStatus['Todo'] || 0,
      review: byStatus['Review'] || 0,
      completionRate: total ? Math.round((done / total) * 100) : 0,
      byStatus,
      byPriority,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/tasks/seed-demo ────────────────────────────────────────────────
// Explicit on-demand action: Creates demo tasks owned strictly by current user.
// Prevents duplicate seeding if user already has tasks.
const seedDemoTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const existingCount = await Task.countDocuments({ owner: userId });
    if (existingCount > 0) {
      return res.status(400).json({
        error: 'Your workspace already has tasks. Cannot load duplicate demo data.',
        count: existingCount,
      });
    }

    const sampleTasks = [
      {
        title: 'Design System Setup',
        description: 'Create reusable component library with design tokens, color palette, and typography system.',
        priority: 'High',
        status: 'Done',
        category: 'Design',
        assignee: { id: 2, name: 'Priya Mehta', initials: 'PM', color: '#0ea5e9' },
        dueDate: new Date(Date.now() + 86400000 * 2),
        progress: 100,
        owner: userId,
      },
      {
        title: 'User Authentication Flow',
        description: 'Implement JWT-based login, signup, and session management with refresh tokens.',
        priority: 'Critical',
        status: 'In Progress',
        category: 'Backend',
        assignee: { id: 1, name: 'Rahul Sharma', initials: 'RS', color: '#6366f1' },
        dueDate: new Date(Date.now() + 86400000 * 5),
        progress: 65,
        owner: userId,
      },
      {
        title: 'Dashboard Analytics Charts',
        description: 'Integrate charts for task completion metrics, burndown rate, and team velocity.',
        priority: 'Medium',
        status: 'In Progress',
        category: 'Frontend',
        assignee: { id: 3, name: 'Arjun Singh', initials: 'AS', color: '#8b5cf6' },
        dueDate: new Date(Date.now() + 86400000 * 7),
        progress: 40,
        owner: userId,
      },
      {
        title: 'REST API Documentation',
        description: 'Write OpenAPI docs for all task management and authentication endpoints.',
        priority: 'Low',
        status: 'Todo',
        category: 'Documentation',
        assignee: { id: 5, name: 'Dev Kumar', initials: 'DK', color: '#f59e0b' },
        dueDate: new Date(Date.now() + 86400000 * 12),
        progress: 0,
        owner: userId,
      },
      {
        title: 'CI/CD Pipeline Setup',
        description: 'Configure automated testing, linting, and continuous delivery.',
        priority: 'High',
        status: 'Review',
        category: 'DevOps',
        assignee: { id: 4, name: 'Neha Gupta', initials: 'NG', color: '#10b981' },
        dueDate: new Date(Date.now() + 86400000 * 9),
        progress: 85,
        owner: userId,
      },
    ];

    const inserted = await Task.insertMany(sampleTasks);
    res.status(201).json({
      message: 'Demo tasks loaded successfully for your workspace',
      count: inserted.length,
      tasks: inserted,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  seedDemoTasks,
};
