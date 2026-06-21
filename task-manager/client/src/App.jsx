import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5003/api/tasks';

function App() {
  // Tasks State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  // Filter & Search States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
  const [priorityFilter, setPriorityFilter] = useState('all'); // all, high, medium, low

  // Fetch tasks from API on filter or search changes
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (priorityFilter !== 'all') {
        params.priority = priorityFilter;
      }
      if (search.trim()) {
        params.search = search;
      }

      const res = await axios.get(API_BASE, { params });
      setTasks(res.data);
      setError('');
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError('Could not retrieve tasks from the server.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger reload on filter changes (debounced search handled via useEffect)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks();
    }, 300); // 300ms debounce for typing search

    return () => clearTimeout(delayDebounceFn);
  }, [search, statusFilter, priorityFilter]);

  // Add Task Handler
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await axios.post(API_BASE, {
        title: title.trim(),
        description: description.trim(),
        priority
      });

      // Insert new task into front of task list or reload
      setTasks(prev => [res.data, ...prev]);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create a new task.');
    }
  };

  // Toggle Completion Status
  const handleToggleComplete = async (id, completed) => {
    try {
      const res = await axios.put(`${API_BASE}/${id}`, {
        completed: !completed
      });

      // Update local task state
      setTasks(prev =>
        prev.map(t => (t.id === id ? { ...t, completed: res.data.completed } : t))
      );
    } catch (err) {
      console.error('Error toggling completion:', err);
      setError('Failed to update task status.');
    }
  };

  // Delete Task Handler
  const handleDeleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task.');
    }
  };

  // Stats Calculations (always calculate based on all tasks, not filtered list)
  // To get overall stats, we can fetch all tasks once or keep track.
  // For UI consistency, we can compute stats from local tasks, or fetch overall stats.
  // Let's compute them from local list if filters are 'all'. To be accurate, we'll fetch
  // overall stats. Or we can just calculate them from the currently fetched list if we want,
  // but a better approach is to do a quick fetch of all tasks to get clean stats, or simply
  // keep a non-filtered reference. Let's do a simple frontend local calculation from a separate state, 
  // or simple count: total, completed, pending. Let's make an API call to get all stats.
  // Wait, let's keep it simple: we can do a secondary effect that fetches overall counts,
  // or simply filter tasks locally. Let's look:
  // If we filter locally, we don't have to keep re-fetching. But since we coded filtering on the backend, 
  // let's do a quick separate fetch for overall count or calculate it dynamically!
  const [totalCount, setTotalCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Separate effect to fetch overall stats whenever tasks collection changes
  useEffect(() => {
    const fetchOverallStats = async () => {
      try {
        const res = await axios.get(API_BASE); // No params = all tasks
        const allTasks = res.data;
        setTotalCount(allTasks.length);
        setCompletedCount(allTasks.filter(t => t.completed).length);
        setPendingCount(allTasks.filter(t => !t.completed).length);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchOverallStats();
  }, [tasks]); // Updates when tasks array additions/updates/deletions happen

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="app-wrapper">
      {/* Brand Header */}
      <header className="app-header">
        <div className="brand-section">
          <h1>SyncTasks</h1>
          <p>Organize your work with a full-stack CRUD workflow</p>
        </div>
      </header>

      {/* Stats Board */}
      <section className="stats-grid">
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#818cf8' }}>{totalCount}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#10b981' }}>{completedCount}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-num" style={{ color: '#f59e0b' }}>{pendingCount}</div>
          <div className="stat-label">Pending</div>
        </div>
      </section>

      {/* Progress tracking bar */}
      <section className="progress-container">
        <div className="progress-header">
          <span>Task Completion Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </section>

      {/* Task Creator Form */}
      <section className="task-form">
        <h2>Create a New Task</h2>
        <form onSubmit={handleAddTask}>
          <div className="form-row" style={{ marginBottom: '16px' }}>
            <div className="form-group title-group">
              <label htmlFor="task-title">Task Title</label>
              <input
                type="text"
                id="task-title"
                className="input-field"
                placeholder="What needs to be done?"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                maxLength={80}
              />
            </div>

            <div className="form-group priority-group">
              <label htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="input-field"
                value={priority}
                onChange={e => setPriority(e.target.value)}
              >
                <option value="high">High 🔥</option>
                <option value="medium">Medium ⚡</option>
                <option value="low">Low 💤</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="task-desc">Description (Optional)</label>
              <input
                type="text"
                id="task-desc"
                className="input-field"
                placeholder="Add optional task details..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={200}
              />
            </div>
            
            <button type="submit" className="btn-submit">
              Add Task
            </button>
          </div>
        </form>
      </section>

      {/* Error Indicator */}
      {error && (
        <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.1)', padding: '12px 16px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters & Search Section */}
      <section className="filters-toolbar">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="input-field"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>
      </section>

      {/* Priority Secondary Filters */}
      <section className="priority-filters">
        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', marginRight: '6px' }}>
          Filter Priority:
        </span>
        {['all', 'high', 'medium', 'low'].map(p => (
          <button
            key={p}
            className={`priority-tab ${priorityFilter === p ? 'active' : ''}`}
            onClick={() => setPriorityFilter(p)}
          >
            {p.toUpperCase()}
          </button>
        ))}
      </section>

      {/* Tasks Feed */}
      <main className="tasks-list">
        {loading && tasks.length === 0 ? (
          <div className="no-tasks">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="no-tasks">
            No tasks found. Try changing filters or create a new task!
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className={`task-card priority-${task.priority} ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-left">
                {/* Interactive Checkbox */}
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task.id, task.completed)}
                  />
                  <span className="checkmark"></span>
                </label>

                {/* Task Info */}
                <div className="task-info">
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div className="task-desc">{task.description}</div>
                  )}
                  <div className="task-tags">
                    <span className={`priority-badge ${task.priority}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delete Button */}
              <button
                className="btn-delete"
                onClick={() => handleDeleteTask(task.id)}
                title="Delete task"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
