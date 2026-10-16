/**
 * Seed Script — Populates MongoDB with initial mock tasks
 * Run once after connecting to Atlas:
 *   cd backend
 *   node src/scripts/seed.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const connectDB = require('../config/db');

const TEAM_MEMBERS = [
  { id: 1, name: 'Rahul Sharma',   initials: 'RS', color: '#6366f1' },
  { id: 2, name: 'Priya Mehta',    initials: 'PM', color: '#0ea5e9' },
  { id: 3, name: 'Arjun Singh',    initials: 'AS', color: '#8b5cf6' },
  { id: 4, name: 'Neha Gupta',     initials: 'NG', color: '#10b981' },
  { id: 5, name: 'Dev Kumar',      initials: 'DK', color: '#f59e0b' },
];

const SEED_TASKS = [
  {
    title: 'Design System Setup',
    description: 'Create reusable component library with design tokens, color palette, and typography system.',
    priority: 'High', status: 'Done', category: 'Design',
    assignee: TEAM_MEMBERS[1], dueDate: new Date('2026-10-10'), progress: 100,
  },
  {
    title: 'User Authentication Flow',
    description: 'Implement JWT-based login, signup, and session management with refresh tokens.',
    priority: 'Critical', status: 'In Progress', category: 'Backend',
    assignee: TEAM_MEMBERS[0], dueDate: new Date('2026-10-25'), progress: 65,
  },
  {
    title: 'Dashboard Analytics Charts',
    description: 'Integrate Recharts for task completion graphs, burndown chart, and team velocity.',
    priority: 'Medium', status: 'In Progress', category: 'Frontend',
    assignee: TEAM_MEMBERS[2], dueDate: new Date('2026-10-28'), progress: 40,
  },
  {
    title: 'REST API Documentation',
    description: 'Write Swagger/OpenAPI docs for all task management endpoints.',
    priority: 'Low', status: 'Todo', category: 'Documentation',
    assignee: TEAM_MEMBERS[4], dueDate: new Date('2026-11-05'), progress: 0,
  },
  {
    title: 'CI/CD Pipeline Setup',
    description: 'Configure GitHub Actions for automated testing, linting, and deployment to production.',
    priority: 'High', status: 'Review', category: 'DevOps',
    assignee: TEAM_MEMBERS[3], dueDate: new Date('2026-10-30'), progress: 85,
  },
  {
    title: 'Task CRUD API Endpoints',
    description: 'Build Express routes for creating, reading, updating, and deleting tasks with validation.',
    priority: 'Critical', status: 'Done', category: 'Backend',
    assignee: TEAM_MEMBERS[0], dueDate: new Date('2026-10-16'), progress: 100,
  },
  {
    title: 'Mobile Responsive UI',
    description: 'Ensure all pages work flawlessly on mobile, tablet, and desktop breakpoints.',
    priority: 'Medium', status: 'Todo', category: 'Frontend',
    assignee: TEAM_MEMBERS[2], dueDate: new Date('2026-11-10'), progress: 10,
  },
  {
    title: 'Unit & Integration Tests',
    description: 'Write Jest tests for all utility functions and Supertest integration tests for APIs.',
    priority: 'High', status: 'Todo', category: 'Testing',
    assignee: TEAM_MEMBERS[4], dueDate: new Date('2026-11-15'), progress: 0,
  },
];

const seed = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting seed...');

    // 1. Ensure Demo User exists
    let demoUser = await User.findOne({ email: 'demo@example.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'Demo User',
        email: 'demo@example.com',
        password: 'Demo@123',
        role: 'user',
      });
      console.log('👤 Created demo user: demo@example.com / Demo@123');
    } else {
      console.log('👤 Demo user verified: demo@example.com');
    }

    // 2. Assign unowned tasks to demo user
    const unownedCount = await Task.countDocuments({ owner: { $exists: false } });
    if (unownedCount > 0) {
      await Task.updateMany({ owner: { $exists: false } }, { $set: { owner: demoUser._id } });
      console.log(`🔗 Linked ${unownedCount} legacy tasks to demo user`);
    }

    const existing = await Task.countDocuments();
    if (existing > 0) {
      console.log(`ℹ️  Database has ${existing} tasks. Skipping fresh insert.`);
      console.log('   To force re-seed, run: node src/scripts/seed.js --force');

      if (process.argv.includes('--force')) {
        await Task.deleteMany({});
        console.log('🗑️  Cleared existing tasks (--force)');
      } else {
        process.exit(0);
      }
    }

    const tasksWithOwner = SEED_TASKS.map((t) => ({ ...t, owner: demoUser._id }));
    const inserted = await Task.insertMany(tasksWithOwner);
    console.log(`✅ Seeded ${inserted.length} tasks successfully!`);
    inserted.forEach((t) => console.log(`   • [${t.priority}] ${t.title}`));

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

seed();
