require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Request Logger ───────────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Task Management API is running!',
    version: '2.0.0',
    environment: process.env.NODE_ENV,
    docs: '/api/health',
  });
});

app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    database: {
      status: dbState[mongoose.connection.readyState] || 'unknown',
      name: mongoose.connection.name || null,
    },
  });
});

// ─── Auth API Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Task API Routes ──────────────────────────────────────────────────────────
app.use('/api/tasks', taskRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Start: Connect DB then Listen ───────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Backend server running on http://localhost:${PORT}`);
      console.log(`📋 Health check:  http://localhost:${PORT}/api/health`);
      console.log(`📦 Tasks API:     http://localhost:${PORT}/api/tasks`);
      console.log(`🌍 Environment:   ${process.env.NODE_ENV}`);
    });
  } catch (err) {
    console.error('💥 Server startup failed:', err.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
