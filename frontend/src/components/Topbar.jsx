import { Search, Bell, Plus, HelpCircle, Moon, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, subtitle, onCreateTask, searchValue, onSearchChange }) {
  const { user, isAuthenticated, setShowAuthModal } = useAuth();

  return (
    <header className="topbar" id="topbar">
      {/* Page title */}
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {/* Search */}
      <div className="topbar-search">
        <Search size={15} className="topbar-search-icon" />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="Search tasks, projects…"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      {/* Right actions */}
      <div className="topbar-actions">
        <button className="topbar-btn" id="topbar-help-btn" title="Help">
          <HelpCircle size={17} />
        </button>
        <button className="topbar-btn" id="topbar-theme-btn" title="Toggle theme">
          <Moon size={17} />
        </button>
        <button className="topbar-btn" id="topbar-notifications-btn" title="Notifications">
          <Bell size={17} />
          <span className="notif-dot" />
        </button>

        {isAuthenticated ? (
          <button
            className="btn-create-task"
            id="btn-open-create-task-modal"
            onClick={onCreateTask}
            aria-label="Create new task"
          >
            <Plus size={16} />
            New Task
          </button>
        ) : (
          <button
            className="btn-create-task"
            id="topbar-login-btn"
            onClick={() => setShowAuthModal(true)}
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            }}
          >
            <LogIn size={16} />
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
