import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        await register(name, email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setTab('login');
    setEmail('demo@example.com');
    setPassword('Demo@123');
    setError(null);
  };

  return (
    <div
      className="modal-overlay"
      id="auth-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        style={{
          background: 'white',
          borderRadius: 20,
          width: '100%',
          maxWidth: 440,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header gradient banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            padding: '24px 24px 20px',
            color: 'white',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            aria-label="Close"
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={20} color="#fbbf24" />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {tab === 'login' ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#e0e7ff' }}>
            {tab === 'login'
              ? 'Sign in to access your personal workspace and tasks'
              : 'Sign up to start organizing and tracking your tasks securely'}
          </p>

          {/* Tab selector */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.18)',
              borderRadius: 10,
              padding: 4,
              marginTop: 18,
            }}
          >
            <button
              type="button"
              id="tab-btn-login"
              onClick={() => { setTab('login'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 7,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: tab === 'login' ? 'white' : 'transparent',
                color: tab === 'login' ? '#4f46e5' : '#e0e7ff',
                transition: 'all 0.2s',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              id="tab-btn-register"
              onClick={() => { setTab('register'); setError(null); }}
              style={{
                flex: 1,
                padding: '8px 0',
                border: 'none',
                borderRadius: 7,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: tab === 'register' ? 'white' : 'transparent',
                color: tab === 'register' ? '#4f46e5' : '#e0e7ff',
                transition: 'all 0.2s',
              }}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '0.825rem',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {tab === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="auth-name"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: 6,
                }}
              >
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
                />
                <input
                  id="auth-name"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 38px',
                    borderRadius: 10,
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="auth-email"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: 6,
              }}
            >
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
              />
              <input
                id="auth-email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 38px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label
              htmlFor="auth-password"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: 6,
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }}
              />
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 38px',
                  borderRadius: 10,
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: 10,
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                }}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            id="auth-submit-btn"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.8 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              transition: 'transform 0.15s ease',
            }}
          >
            <LogIn size={18} />
            {loading ? 'Please wait…' : tab === 'login' ? 'Sign In to Workspace' : 'Create Free Account'}
          </button>

          {/* Quick Demo Login Option */}
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
            }}
          >
            <button
              type="button"
              id="btn-quick-demo-fill"
              onClick={handleFillDemo}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: '0.78rem',
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
              }}
            >
              <CheckCircle2 size={13} color="#10b981" />
              <span>Use Demo Credentials (<code>demo@example.com</code>)</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
