import { useState, useEffect } from 'react';
import Topbar from '../components/Topbar';
import { fetchTaskStats } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Activity, PieChart, RefreshCw, Lock, LogIn } from 'lucide-react';

const STATUS_COLORS   = { Todo: '#94a3b8', 'In Progress': '#3b82f6', Review: '#8b5cf6', Done: '#10b981' };
const PRIORITY_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#22c55e' };

function BarRow({ label, count, max, color }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{count} tasks</span>
      </div>
      <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          height: '100%', background: color, borderRadius: 4,
          width: `${max ? (count / max) * 100 : 0}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
}

export default function Analytics() {
  const { isAuthenticated, token, setShowAuthModal } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaskStats();
      setStats(data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      load();
    } else {
      setStats(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, token]);

  const statusEntries   = stats ? Object.entries(stats.byStatus || {}) : [];
  const priorityEntries = stats ? Object.entries(stats.byPriority || {}) : [];
  const maxStatus   = Math.max(...statusEntries.map(([, v]) => v), 1);
  const maxPriority = Math.max(...priorityEntries.map(([, v]) => v), 1);

  return (
    <>
      <Topbar
        title="Analytics"
        subtitle="Live project insights from database"
        onCreateTask={() => {}}
        searchValue=""
        onSearchChange={() => {}}
      />
      <main className="page-content" id="analytics-page">

        {/* Refresh + status row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="section-title">Project Analytics</div>
            <div className="section-subtitle">
              {loading ? 'Fetching latest data…' : `Live stats — ${stats?.total ?? 0} total tasks`}
            </div>
          </div>
          <button
            id="btn-refresh-analytics"
            className="filter-btn"
            onClick={load}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>

        {error && (
          <div style={{ padding: '14px 20px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 12, marginBottom: 20, color: '#b91c1c', fontSize: '0.875rem' }}>
            ⚠️ {error} — <button onClick={load} style={{ background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
          </div>
        )}

        {!isAuthenticated && (
          <div
            style={{
              padding: '40px 24px',
              textAlign: 'center',
              background: 'white',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              marginBottom: 24,
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: '#eef2ff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
              }}
            >
              <Lock size={22} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px', color: '#1e293b' }}>
              Sign In to View Project Analytics
            </h3>
            <p style={{ margin: '0 0 18px', color: '#64748b', fontSize: '0.85rem' }}>
              Real-time analytics and task completion metrics are secured per workspace.
            </p>
            <button
              id="analytics-signin-btn"
              onClick={() => setShowAuthModal(true)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: 'white',
                border: 'none',
                padding: '10px 22px',
                borderRadius: 10,
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <LogIn size={16} />
              Sign In / Register
            </button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

          {/* Status Distribution */}
          <div className="task-table-wrapper" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <BarChart3 size={18} color="var(--color-primary)" />
              <div className="section-title">Tasks by Status</div>
            </div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ height: 14, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: `${60 + i * 10}%` }} />
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }} />
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {statusEntries.length === 0
                  ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks yet.</p>
                  : statusEntries.map(([label, count]) => (
                    <BarRow key={label} label={label} count={count} max={maxStatus} color={STATUS_COLORS[label] || '#6366f1'} />
                  ))
                }
              </div>
            )}
          </div>

          {/* Priority Distribution */}
          <div className="task-table-wrapper" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Activity size={18} color="var(--color-primary)" />
              <div className="section-title">Tasks by Priority</div>
            </div>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ height: 14, background: '#f1f5f9', borderRadius: 4, marginBottom: 6, width: `${50 + i * 15}%` }} />
                  <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4 }} />
                </div>
              ))
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {priorityEntries.length === 0
                  ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks yet.</p>
                  : priorityEntries.map(([label, count]) => (
                    <BarRow key={label} label={label} count={count} max={maxPriority} color={PRIORITY_COLORS[label] || '#6366f1'} />
                  ))
                }
              </div>
            )}
          </div>

          {/* Summary Stats */}
          <div className="task-table-wrapper" style={{ padding: 24, gridColumn: '1/-1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <PieChart size={18} color="var(--color-primary)" />
              <div className="section-title">Overall Summary</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
              {[
                { label: 'Total Tasks',    value: stats?.total ?? '—',          color: '#6366f1' },
                { label: 'Completed',      value: stats?.done ?? '—',           color: '#10b981' },
                { label: 'In Progress',    value: stats?.inProgress ?? '—',     color: '#3b82f6' },
                { label: 'Overdue',        value: stats?.overdue ?? '—',        color: '#ef4444' },
                { label: 'Completion',     value: stats ? `${stats.completionRate}%` : '—', color: '#f59e0b' },
              ].map((item) => (
                <div key={item.label} style={{ textAlign: 'center', padding: 16, background: '#f8fafc', borderRadius: 10 }}>
                  {loading
                    ? <div style={{ height: 36, background: '#e2e8f0', borderRadius: 6, marginBottom: 6 }} />
                    : <div style={{ fontSize: '2rem', fontWeight: 800, color: item.color, letterSpacing: '-0.03em' }}>{item.value}</div>
                  }
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </>
  );
}
