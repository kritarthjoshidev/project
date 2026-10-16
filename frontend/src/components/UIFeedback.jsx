// ─── Skeleton Loader ──────────────────────────────────────────────────────────
export function SkeletonRow() {
  return (
    <tr style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      {[40, 260, 90, 100, 110, 110, 90, 70].map((w, i) => (
        <td key={i} style={{ padding: '14px 16px' }}>
          <div
            style={{
              height: 14,
              width: w,
              background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
              backgroundSize: '200% 100%',
              borderRadius: 6,
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </td>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </tr>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card" style={{ '--card-accent': '#e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9' }} />
        <div style={{ width: 70, height: 22, borderRadius: 20, background: '#f1f5f9' }} />
      </div>
      <div style={{ width: 60, height: 32, borderRadius: 6, background: '#f1f5f9', marginBottom: 8 }} />
      <div style={{ width: 100, height: 14, borderRadius: 6, background: '#f1f5f9' }} />
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  return (
    <div
      id="error-banner"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: '#fef2f2',
        border: '1.5px solid #fecaca',
        borderRadius: 12,
        marginBottom: 20,
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: '1.1rem' }}>⚠️</span>
        <div>
          <div style={{ fontWeight: 600, color: '#b91c1c', fontSize: '0.875rem' }}>
            Failed to load tasks
          </div>
          <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 2 }}>
            {message}
          </div>
        </div>
      </div>
      {onRetry && (
        <button
          id="error-retry-btn"
          onClick={onRetry}
          style={{
            padding: '7px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: '0.8rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            flexShrink: 0,
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ─── Toast Notification ───────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#15803d', icon: '✅' },
    error:   { bg: '#fef2f2', border: '#fca5a5', text: '#b91c1c', icon: '❌' },
    info:    { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8', icon: 'ℹ️' },
  };
  const c = colors[type] || colors.success;

  return (
    <div
      id="toast-notification"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 18px',
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        animation: 'slideInRight 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        maxWidth: 360,
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <span>{c.icon}</span>
      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: c.text }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: 'auto',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: c.text,
          fontSize: '1rem',
          padding: 0,
          lineHeight: 1,
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

// ─── DB Status Pill ───────────────────────────────────────────────────────────
export function DbStatusPill({ status }) {
  const map = {
    connected:    { color: '#10b981', bg: '#f0fdf4', label: 'DB Connected' },
    disconnected: { color: '#ef4444', bg: '#fef2f2', label: 'DB Offline' },
    connecting:   { color: '#f59e0b', bg: '#fffbeb', label: 'DB Connecting…' },
  };
  const s = map[status] || map.disconnected;

  return (
    <div
      id="db-status-pill"
      title={`Database ${status}`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 20,
        background: s.bg, fontSize: '0.72rem', fontWeight: 600, color: s.color,
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: s.color,
        boxShadow: status === 'connected' ? `0 0 0 3px ${s.color}33` : 'none',
      }} />
      {s.label}
    </div>
  );
}
