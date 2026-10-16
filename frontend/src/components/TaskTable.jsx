import { useState } from 'react';
import { Pencil, Trash2, Calendar, ChevronUp, ChevronDown, ChevronsUpDown, Plus, Sparkles } from 'lucide-react';
import { PriorityBadge, StatusBadge, AssigneeAvatar } from './Badges';
import { getDueDateStatus, formatDate, getProgressColor } from '../data/mockData';

export default function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
  onCreateTask,
  onLoadDemo,
  loadingDemo = false,
}) {
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sorted = [...tasks].sort((a, b) => {
    if (!sortField) return 0;
    let av = a[sortField], bv = b[sortField];
    if (typeof av === 'string') av = av.toLowerCase();
    if (typeof bv === 'string') bv = bv.toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronsUpDown size={12} style={{ opacity: 0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
  };

  if (tasks.length === 0) {
    return (
      <div className="task-table-wrapper" id="task-table-empty">
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div className="empty-state-icon" style={{ margin: '0 auto 16px' }}>
            <Calendar size={32} color="#6366f1" />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
            No tasks in your workspace yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 440, margin: '0 auto 24px' }}>
            Get started by creating your first task, or load sample demo tasks to explore your TaskFlow workspace.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {onCreateTask && (
              <button
                id="btn-empty-create-task"
                className="btn-create-task"
                onClick={onCreateTask}
                style={{ padding: '10px 20px', fontSize: '0.875rem' }}
              >
                <Plus size={16} />
                Create First Task
              </button>
            )}
            {onLoadDemo && (
              <button
                id="btn-empty-load-demo"
                className="filter-btn"
                onClick={onLoadDemo}
                disabled={loadingDemo}
                style={{
                  padding: '10px 18px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  borderColor: '#c7d2fe',
                  color: '#4f46e5',
                  background: '#f5f3ff',
                }}
              >
                <Sparkles size={16} color="#7c3aed" />
                {loadingDemo ? 'Loading Demo Tasks…' : 'Load Demo Data'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-table-wrapper" id="task-table">
      <table className="task-table" aria-label="Task list">
        <thead>
          <tr>
            <th style={{ width: 40 }}></th>
            <th onClick={() => handleSort('title')} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                Task <SortIcon field="title" />
              </span>
            </th>
            <th onClick={() => handleSort('priority')} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                Priority <SortIcon field="priority" />
              </span>
            </th>
            <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                Status <SortIcon field="status" />
              </span>
            </th>
            <th>Assignee</th>
            <th onClick={() => handleSort('dueDate')} style={{ cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                Due Date <SortIcon field="dueDate" />
              </span>
            </th>
            <th>Progress</th>
            <th style={{ width: 80 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((task) => {
            const dueStat = getDueDateStatus(task.dueDate);
            const isDone = task.status === 'Done';
            const progressColor = getProgressColor(task.progress);

            return (
              <tr key={task._id || task.id} id={`task-row-${task._id || task.id}`}>
                {/* Checkbox */}
                <td>
                  <input
                    type="checkbox"
                    className="task-checkbox"
                    checked={isDone}
                    onChange={() => onToggleStatus(task._id || task.id)}
                    title={isDone ? 'Mark as Todo' : 'Mark as Done'}
                    id={`task-check-${task._id || task.id}`}
                    aria-label={`Mark "${task.title}" as ${isDone ? 'todo' : 'done'}`}
                  />
                </td>

                {/* Title */}
                <td>
                  <div className="task-title-cell">
                    <div>
                      <div className={`task-title-main${isDone ? ' completed' : ''}`}>
                        {task.title}
                      </div>
                      <div className="task-title-sub">{task.category}</div>
                    </div>
                  </div>
                </td>

                {/* Priority */}
                <td><PriorityBadge priority={task.priority} /></td>

                {/* Status */}
                <td><StatusBadge status={task.status} /></td>

                {/* Assignee */}
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <AssigneeAvatar assignee={task.assignee} />
                    <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>
                      {task.assignee.name.split(' ')[0]}
                    </span>
                  </div>
                </td>

                {/* Due Date */}
                <td>
                  <div className={`due-date ${dueStat}`}>
                    <Calendar size={12} />
                    {dueStat === 'overdue' && '⚠ '}
                    {formatDate(task.dueDate)}
                  </div>
                </td>

                {/* Progress */}
                <td>
                  <div className="progress-bar-wrapper" title={`${task.progress}% complete`}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <div className="progress-bar-bg" style={{ flex:1 }}>
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${task.progress}%`, background: progressColor }}
                        />
                      </div>
                      <span style={{ fontSize:'0.7rem', color:'var(--text-secondary)', minWidth:28 }}>
                        {task.progress}%
                      </span>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td>
                  <div style={{ display:'flex', gap:2 }}>
                    <button
                      className="action-btn"
                      id={`btn-edit-task-${task._id || task.id}`}
                      onClick={() => onEdit(task)}
                      title="Edit task"
                      aria-label={`Edit task: ${task.title}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="action-btn danger"
                      id={`btn-delete-task-${task._id || task.id}`}
                      onClick={() => onDelete(task._id || task.id)}
                      title="Delete task"
                      aria-label={`Delete task: ${task.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
