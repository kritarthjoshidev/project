import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Team from './pages/Team';
import Analytics from './pages/Analytics';
import AuthModal from './components/AuthModal';

function AppContent() {
  const { showAuthModal, setShowAuthModal } = useAuth();

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Dashboard />} />
          <Route path="/team" element={<Team />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/settings"
            element={
              <div style={{ padding: 28 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Settings</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Settings & Account Preferences panel.</p>
              </div>
            }
          />
        </Routes>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
