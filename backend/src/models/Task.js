const mongoose = require('mongoose');

const PRIORITY_ENUM = ['Critical', 'High', 'Medium', 'Low'];
const STATUS_ENUM = ['Todo', 'In Progress', 'Review', 'Done'];
const CATEGORY_ENUM = ['Frontend', 'Backend', 'Design', 'DevOps', 'Testing', 'Documentation'];

// ─── Assignee Sub-document ────────────────────────────────────────────────────
const assigneeSchema = new mongoose.Schema({
  id:       { type: Number, required: true },
  name:     { type: String, required: true, trim: true },
  initials: { type: String, required: true, trim: true },
  color:    { type: String, required: true },
}, { _id: false });

// ─── Task Schema ──────────────────────────────────────────────────────────────
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: { values: PRIORITY_ENUM, message: 'Invalid priority value' },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: { values: STATUS_ENUM, message: 'Invalid status value' },
      default: 'Todo',
    },
    category: {
      type: String,
      enum: { values: CATEGORY_ENUM, message: 'Invalid category value' },
      default: 'Frontend',
    },
    assignee: {
      type: assigneeSchema,
      required: [true, 'Assignee is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    progress: {
      type: Number,
      min: [0, 'Progress cannot be negative'],
      max: [100, 'Progress cannot exceed 100'],
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
  },
  {
    timestamps: true,           // adds createdAt, updatedAt automatically
    versionKey: false,          // removes __v field
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
taskSchema.index({ owner: 1, createdAt: -1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ 'assignee.id': 1 });
taskSchema.index({ title: 'text', description: 'text' }); // full-text search

// ─── Pre-save Hook: Auto-set progress on Done ─────────────────────────────────
taskSchema.pre('save', function () {
  if (this.isModified('status')) {
    if (this.status === 'Done') this.progress = 100;
    if (this.status === 'Todo') this.progress = 0;
  }
});

module.exports = mongoose.model('Task', taskSchema);
