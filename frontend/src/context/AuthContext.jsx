import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, fetchCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ─── Verify session on initial app load ──────────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const data = await fetchCurrentUser();
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for 401 events dispatched from API client
    const handleUnauthorized = () => {
      logout();
      setShowAuthModal(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // ─── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await loginUser({ email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setShowAuthModal(false);
    return data.user;
  }, []);

  // ─── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const data = await registerUser({ name, email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setShowAuthModal(false);
    return data.user;
  }, []);

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    showAuthModal,
    setShowAuthModal,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
