const express = require('express');
const router = express.Router();
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getTaskStats,
  seedDemoTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// ─── All Task Routes Require Authentication ──────────────────────────────────
router.use(protect);

// GET /api/tasks/stats  (aggregate metrics for user)
router.get('/stats', getTaskStats);

// POST /api/tasks/seed-demo (explicit action for presentation sample tasks)
router.post('/seed-demo', seedDemoTasks);

// GET /api/tasks (list user's tasks with pagination & filters)
router.get('/', getAllTasks);

// GET /api/tasks/:id (fetch single user task)
router.get('/:id', getTaskById);

// POST /api/tasks (create new task owned by user)
router.post('/', createTask);

// PUT /api/tasks/:id (update user task)
router.put('/:id', updateTask);

// PATCH /api/tasks/:id/status (partial update: status)
router.patch('/:id/status', updateTaskStatus);

// DELETE /api/tasks/:id (delete user task)
router.delete('/:id', deleteTask);

module.exports = router;
