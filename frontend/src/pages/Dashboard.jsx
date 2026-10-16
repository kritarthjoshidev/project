import { useState, useMemo, useCallback } from 'react';
import {
  CheckSquare, Clock, AlertTriangle, TrendingUp,
  Filter, SortAsc, RefreshCw,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { StatCardSkeleton, SkeletonRow, ErrorBanner, Toast } from '../components/UIFeedback';
import TaskTable from '../components/TaskTable';
import CreateTaskModal from '../components/CreateTaskModal';
import Topbar from '../components/Topbar';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import { seedDemoTasks } from '../services/api';
import { PRIORITIES, STATUSES } from '../data/mockData';

export default function Dashboard() {
  const { isAuthenticated, setShowAuthModal, user } = useAuth();
  const [showModal, setShowModal]         = useState(false);
  const [editTask, setEditTask]           = useState(null);
  const [search, setSearch]               = useState('');
  const [filterStatus, setFilterStatus]   = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [toast, setToast]                 = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingDemo, setLoadingDemo]     = useState(false);

  // ─── API filters (only passed when set — let backend filter when possible) ──
  const apiFilters = useMemo(() => {
    const f = {};
    if (filterStatus !== 'All') f.status = filterStatus;
    if (filterPriority !== 'All') f.priority = filterPriority;
    if (search.trim().length > 2) f.search = search.trim();
    return f;
  }, [filterStatus, filterPriority, search]);

  const {
    tasks, stats, loading, statsLoading,
    error, addTask, editTask: apiEdit, toggleStatus, removeTask, refresh,
  } = useTasks(apiFilters);

  // ─── Client-side search filter for fast UX (<3 chars stay local) ─────────
  const displayedTasks = useMemo(() => {
    if (search.trim().length <= 2 && search.trim().length > 0) {
      const q = search.toLowerCase();
      return tasks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }
    return tasks;
  }, [tasks, search]);

  // ─── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  // ─── CRUD Handlers ──────────────────────────────────────────────────────────
  const handleSave = async (taskData) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setActionLoading(true);
    try {
      if (editTask) {
        await apiEdit(editTask._id, taskData);
        showToast('Task updated successfully ✏️');
      } else {
        await addTask(taskData);
        showToast('Task created successfully ✨');
      }
      setShowModal(false);
      setEditTask(null);
      refresh();
    } catch (err) {
      showToast(err.message || 'Failed to save task', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (task) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setEditTask(task);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    try {
      await removeTask(id);
      showToast('Task deleted', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    try {
      await toggleStatus(id);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleLoadDemo = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setLoadingDemo(true);
    try {
      const result = await seedDemoTasks();
      showToast(result.message || 'Sample demo tasks loaded! ✨', 'success');
      refresh();
    } catch (err) {
      showToast(err.message || 'Failed to load demo tasks', 'error');
    } finally {
      setLoadingDemo(false);
    }
  };

  const handleCloseModal = () => { setShowModal(false); setEditTask(null); };

  // ─── Derived stats (use API stats if available, fallback to local count) ───
  const displayStats = useMemo(() => {
    if (stats) return stats;
    // Fallback: compute from local tasks array
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'Done').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const overdue = tasks.filter((t) =>
      new Date(t.dueDate) < today && t.status !== 'Done'
    ).length;
    return { total, done, inProgress, overdue, completionRate: total ? Math.round((done / total) * 100) : 0 };
  }, [stats, tasks]);

  return (
    <>
      <Topbar
        title={isAuthenticated ? `Welcome, ${user?.name?.split(' ')[0] || 'Member'} 👋` : 'Dashboard'}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        onCreateTask={() => (isAuthenticated ? setShowModal(true) : setShowAuthModal(true))}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <main className="page-content" id="main-content">

        {/* ── Guest Welcome Banner (When Not Logged In) ────────────────── */}
        {!isAuthenticated && (
          <div
            id="guest-welcome-banner"
            style={{
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
              border: '1.5px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 16,
              padding: '20px 24px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#312e81', marginBottom: 4 }}>
                👋 Welcome to TaskFlow Pro!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4338ca' }}>
                Sign in to access your personal workspace, track progress, and manage tasks with user isolation.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                id="btn-banner-signin"
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                }}
              >
                Sign In / Register
              </button>
            </div>
          </div>
        )}

        {/* ── Error Banner ─────────────────────────────────────────────── */}
        {error && <ErrorBanner message={error} onRetry={refresh} />}

        {/* ── Stats Grid ───────────────────────────────────────────────── */}
        <div className="stats-grid" id="stats-grid">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                icon={<CheckSquare size={20} color="#6366f1" />}
                iconBg="rgba(99,102,241,0.1)"
                label="Total Tasks"
                value={displayStats.total}
                trend="+2 this week"
                trendUp={true}
                accentColor="#6366f1"
              />
              <StatCard
                icon={<Clock size={20} color="#0ea5e9" />}
                iconBg="rgba(14,165,233,0.1)"
                label="In Progress"
                value={displayStats.inProgress}
                trend={`${displayStats.total ? Math.round((displayStats.inProgress / displayStats.total) * 100) : 0}% of total`}
                trendUp={true}
                accentColor="#0ea5e9"
              />
              <StatCard
                icon={<AlertTriangle size={20} color="#ef4444" />}
                iconBg="rgba(239,68,68,0.1)"
                label="Overdue"
                value={displayStats.overdue}
                trend={displayStats.overdue > 0 ? 'Needs attention' : 'All on track'}
                trendUp={displayStats.overdue === 0}
                accentColor="#ef4444"
              />
              <StatCard
                icon={<TrendingUp size={20} color="#10b981" />}
                iconBg="rgba(16,185,129,0.1)"
                label="Completion Rate"
                value={`${displayStats.completionRate}%`}
                trend={`${displayStats.done} tasks done`}
                trendUp={displayStats.completionRate >= 50}
                accentColor="#10b981"
              />
            </>
          )}
        </div>

        {/* ── Section Header + Filters ──────────────────────────────────── */}
        <div className="section-header" id="task-list-section">
          <div>
            <div className="section-title">Task List</div>
            <div className="section-subtitle">
              {loading ? 'Loading…' : `${displayedTasks.length} task${displayedTasks.length !== 1 ? 's' : ''} shown`}
            </div>
          </div>

          <div className="filter-bar" id="filter-bar" style={{ alignItems: 'center' }}>
            {/* Refresh button */}
            <button
              id="btn-refresh-tasks"
              className="filter-btn"
              onClick={refresh}
              disabled={loading}
              title="Refresh tasks"
              style={{ gap: 5 }}
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>

            <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />

            {/* Status filters */}
            {['All', ...STATUSES].map((s) => (
              <button
                key={s}
                id={`filter-status-${s.toLowerCase().replace(/\s+/g, '-')}`}
                className={`filter-btn ${filterStatus === s ? 'active' : ''}`}
                onClick={() => setFilterStatus(s)}
              >
                {s}
              </button>
            ))}

            <div style={{ width: 1, height: 20, background: 'var(--border-color)' }} />
            <SortAsc size={14} style={{ color: 'var(--text-muted)' }} />

            {/* Priority filters */}
            {['All', ...PRIORITIES].map((p) => (
              <button
                key={p}
                id={`filter-priority-${p.toLowerCase()}`}
                className={`filter-btn ${filterPriority === p ? 'active' : ''}`}
                onClick={() => setFilterPriority(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Task Table ────────────────────────────────────────────────── */}
        {loading ? (
          <div className="task-table-wrapper">
            <table className="task-table" aria-label="Loading tasks">
              <thead>
                <tr>
                  {['', 'Task', 'Priority', 'Status', 'Assignee', 'Due Date', 'Progress', 'Actions'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : (
          <TaskTable
            tasks={displayedTasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onCreateTask={() => (isAuthenticated ? setShowModal(true) : setShowAuthModal(true))}
            onLoadDemo={handleLoadDemo}
            loadingDemo={loadingDemo}
          />
        )}
      </main>

      {/* ── Create/Edit Modal ─────────────────────────────────────────── */}
      {showModal && (
        <CreateTaskModal
          onClose={handleCloseModal}
          onSave={handleSave}
          editTask={editTask}
          saving={actionLoading}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Spin animation for refresh icon */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
