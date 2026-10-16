import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchTasks,
  fetchTaskStats,
  createTask as apiCreate,
  updateTask as apiUpdate,
  updateTaskStatus as apiPatchStatus,
  deleteTask as apiDelete,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

// ─── useTasks Hook ────────────────────────────────────────────────────────────
// Manages the full task lifecycle: fetch, create, update, delete, toggle status
// Also handles loading, error, optimistic UI, and auth token reactivity.

export function useTasks(filters = {}) {
  const { isAuthenticated, token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Fetch tasks + stats from API ──────────────────────────────────────────
  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTasks(filters);
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, JSON.stringify(filters)]); // eslint-disable-line

  const loadStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setStatsLoading(true);
    try {
      const data = await fetchTaskStats();
      setStats(data);
    } catch {
      // stats are non-critical; silently fail
    } finally {
      setStatsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
      loadStats();
    } else {
      setTasks([]);
      setStats(null);
      setLoading(false);
      setStatsLoading(false);
      setError(null);
    }
  }, [isAuthenticated, token, loadTasks, loadStats]);

  // ─── Create ────────────────────────────────────────────────────────────────
  const addTask = async (taskData) => {
    const created = await apiCreate(taskData);
    setTasks((prev) => [created, ...prev]);
    setStats((s) => (s ? { ...s, total: s.total + 1 } : s));
    return created;
  };

  // ─── Update ────────────────────────────────────────────────────────────────
  const editTask = async (id, taskData) => {
    const updated = await apiUpdate(id, taskData);
    setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  };

  // ─── Toggle status (checkbox) ───────────────────────────────────────────────
  const toggleStatus = async (id) => {
    const task = tasks.find((t) => t._id === id);
    if (!task) return;
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t._id === id
          ? { ...t, status: newStatus, progress: newStatus === 'Done' ? 100 : 0 }
          : t
      )
    );

    try {
      const updated = await apiPatchStatus(id, newStatus);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      loadStats(); // refresh stat counts
    } catch (err) {
      // Rollback on failure
      setTasks((prev) => prev.map((t) => (t._id === id ? task : t)));
      throw err;
    }
  };

  // ─── Delete ────────────────────────────────────────────────────────────────
  const removeTask = async (id) => {
    const snapshot = tasks; // for rollback
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      await apiDelete(id);
      setStats((s) => (s ? { ...s, total: Math.max(0, s.total - 1) } : s));
    } catch (err) {
      setTasks(snapshot); // rollback
      throw err;
    }
  };

  return {
    tasks,
    stats,
    loading,
    statsLoading,
    error,
    addTask,
    editTask,
    toggleStatus,
    removeTask,
    refresh: () => {
      loadTasks();
      loadStats();
    },
  };
}
