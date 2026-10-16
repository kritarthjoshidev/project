import { NavLink } from 'react-router-dom';
import {
  CheckSquare, LayoutDashboard, Users, BarChart3,
  Settings, Bell, LogOut, LogIn, Zap, User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', icon: <LayoutDashboard size={17} />, label: 'Dashboard' },
  { to: '/tasks', icon: <CheckSquare size={17} />, label: 'My Tasks' },
  { to: '/team', icon: <Users size={17} />, label: 'Team' },
  { to: '/analytics', icon: <BarChart3 size={17} />, label: 'Analytics' },
  { to: '/settings', icon: <Settings size={17} />, label: 'Settings' },
];

export default function Sidebar() {
  const { user, isAuthenticated, logout, setShowAuthModal } = useAuth();

  return (
    <aside className="sidebar" id="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Zap size={20} />
        </div>
        <div>
          <div className="sidebar-logo-text">TaskFlow</div>
          <div className="sidebar-logo-badge">PRO</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item${isActive ? ' active' : ''}`
            }
            id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label" style={{ marginTop: 8 }}>Workspace</div>
        <div className="sidebar-nav-item" style={{ cursor: 'pointer' }}>
          <Bell size={17} />
          <span>Notifications</span>
          <span className="badge">3</span>
        </div>
      </div>

      {/* Footer / User Auth Status */}
      <div className="sidebar-footer">
        {isAuthenticated ? (
          <div className="sidebar-user" id="sidebar-user-menu">
            <div
              className="sidebar-avatar"
              style={{
                background: user?.color || 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              }}
            >
              {user?.initials || 'U'}
            </div>
            <div className="sidebar-user-info" style={{ overflow: 'hidden' }}>
              <div
                className="sidebar-user-name"
                style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                title={user?.name}
              >
                {user?.name || 'User'}
              </div>
              <div className="sidebar-user-role" style={{ textTransform: 'capitalize' }}>
                {user?.role || 'Member'}
              </div>
            </div>
            <button
              id="sidebar-logout-btn"
              onClick={logout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                padding: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: 'rgba(199,210,254,0.6)',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(199,210,254,0.6)')}
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            id="sidebar-signin-btn"
            onClick={() => setShowAuthModal(true)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.25))',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >
            <LogIn size={15} />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
}
