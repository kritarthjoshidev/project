import { useState } from 'react';
import { X, Calendar, Tag, User, AlignLeft, Flag } from 'lucide-react';
import { PRIORITIES, STATUSES, CATEGORIES, TEAM_MEMBERS } from '../data/mockData';

export default function CreateTaskModal({ onClose, onSave, editTask, saving = false }) {
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    title: editTask?.title || '',
    description: editTask?.description || '',
    priority: editTask?.priority || 'Medium',
    status: editTask?.status || 'Todo',
    category: editTask?.category || 'Frontend',
    assigneeId: editTask?.assignee?.id || 1,
    dueDate: editTask?.dueDate || today,
    progress: editTask?.progress ?? 0,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Task title is required';
    if (!form.dueDate) errs.dueDate = 'Due date is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const assignee = TEAM_MEMBERS.find((m) => m.id === Number(form.assigneeId));
    const task = {
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: form.status,
      category: form.category,
      assignee,
      dueDate: form.dueDate,
      progress: Number(form.progress),
    };
    onSave(task);
  };

  return (
    <div className="modal-overlay" id="create-task-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title" id="modal-title">
              {editTask ? '✏️ Edit Task' : '✨ Create New Task'}
            </div>
            <div className="modal-subtitle">
              {editTask ? 'Update task details below' : 'Fill in the details to add a new task'}
            </div>
          </div>
          <button className="modal-close" id="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Title - full width */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="task-title">
                  <Tag size={12} style={{ display:'inline', marginRight:4 }} />
                  Task Title *
                </label>
                <input
                  id="task-title"
                  name="title"
                  className={`form-input ${errors.title ? 'border-red-400' : ''}`}
                  placeholder="e.g. Implement user authentication"
                  value={form.title}
                  onChange={handleChange}
                  autoFocus
                />
                {errors.title && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.title}</span>}
              </div>

              {/* Description - full width */}
              <div className="form-group full-width">
                <label className="form-label" htmlFor="task-description">
                  <AlignLeft size={12} style={{ display:'inline', marginRight:4 }} />
                  Description
                </label>
                <textarea
                  id="task-description"
                  name="description"
                  className="form-textarea"
                  placeholder="Add task details, acceptance criteria, links…"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              {/* Priority */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-priority">
                  <Flag size={12} style={{ display:'inline', marginRight:4 }} />
                  Priority
                </label>
                <select id="task-priority" name="priority" className="form-select" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-status">Status</label>
                <select id="task-status" name="status" className="form-select" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-category">Category</label>
                <select id="task-category" name="category" className="form-select" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Assignee */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-assignee">
                  <User size={12} style={{ display:'inline', marginRight:4 }} />
                  Assignee
                </label>
                <select id="task-assignee" name="assigneeId" className="form-select" value={form.assigneeId} onChange={handleChange}>
                  {TEAM_MEMBERS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              {/* Due Date */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-due-date">
                  <Calendar size={12} style={{ display:'inline', marginRight:4 }} />
                  Due Date *
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  name="dueDate"
                  className="form-input"
                  value={form.dueDate}
                  onChange={handleChange}
                  min={today}
                />
                {errors.dueDate && <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{errors.dueDate}</span>}
              </div>

              {/* Progress */}
              <div className="form-group">
                <label className="form-label" htmlFor="task-progress">
                  Progress: <strong>{form.progress}%</strong>
                </label>
                <input
                  id="task-progress"
                  type="range"
                  name="progress"
                  min="0"
                  max="100"
                  step="5"
                  value={form.progress}
                  onChange={handleChange}
                  style={{ width: '100%', accentColor: 'var(--color-primary)' }}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" id="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="modal-save-btn" disabled={saving}>
              {saving ? '⏳ Saving…' : editTask ? 'Update Task' : '✨ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
