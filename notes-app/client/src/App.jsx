import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = 'http://localhost:5001';

const NOTE_COLORS = [
  { name: 'Slate', value: '#1e293b' },
  { name: 'Indigo', value: '#312e81' },
  { name: 'Violet', value: '#4c1d95' },
  { name: 'Teal', value: '#115e59' },
  { name: 'Emerald', value: '#064e3b' },
  { name: 'Amber', value: '#78350f' },
  { name: 'Rose', value: '#9f1239' },
];

function App() {
  // Session & Authentication States
  const [token, setToken] = useState(localStorage.getItem('notes_app_token') || '');
  const [user, setUser] = useState(null);
  const [isAuthMode, setIsAuthMode] = useState(true); // true = Login, false = Register
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  // Notes States
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: '', content: '', tagsInput: '', color: '#1e293b', isPinned: false });
  const [editingNote, setEditingNote] = useState(null);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColorFilter, setSelectedColorFilter] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc', 'date-asc', 'alpha'

  // UI Notification States
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const [isCreatorExpanded, setIsCreatorExpanded] = useState(false);

  // Configure Axios defaults when token updates
  useEffect(() => {
    if (token) {
      localStorage.setItem('notes_app_token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchNotes();
      fetchUserProfile();
    } else {
      localStorage.removeItem('notes_app_token');
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setNotes([]);
    }
  }, [token]);

  const showNotification = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 4000);
  };

  const fetchUserProfile = async () => {
    // In our backend, user object is returned on login/register.
    // If we refresh, we can fetch it or verify token validity.
    // We'll mock extracting it from JWT or fetch it from standard route.
    try {
      // In this setup, we store user info in localStorage for quick load
      const savedUser = localStorage.getItem('notes_app_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/notes`);
      setNotes(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        showNotification('Failed to fetch notes', 'error');
      }
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isAuthMode ? '/api/auth/login' : '/api/auth/register';
    const payload = isAuthMode 
      ? { email: authForm.email, password: authForm.password }
      : authForm;

    try {
      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      const { token, user: userData } = response.data;
      
      localStorage.setItem('notes_app_user', JSON.stringify(userData));
      setUser(userData);
      setToken(token);
      showNotification(isAuthMode ? 'Logged in successfully!' : 'Account registered successfully!', 'success');
      setAuthForm({ name: '', email: '', password: '' });
    } catch (error) {
      showNotification(error.response?.data?.message || 'Authentication failed', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('notes_app_user');
    setToken('');
    showNotification('Logged out successfully', 'info');
  };

  // Add a Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.title.trim() && !newNote.content.trim()) {
      showNotification('Note must have a title or content', 'error');
      return;
    }

    // Convert comma-separated tags to array
    const tags = newNote.tagsInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    try {
      const response = await axios.post(`${API_BASE}/api/notes`, {
        title: newNote.title,
        content: newNote.content,
        tags,
        color: newNote.color,
        isPinned: newNote.isPinned
      });

      setNotes([response.data, ...notes]);
      setNewNote({ title: '', content: '', tagsInput: '', color: '#1e293b', isPinned: false });
      setIsCreatorExpanded(false);
      showNotification('Note added!', 'success');
    } catch (error) {
      showNotification('Failed to save note', 'error');
    }
  };

  // Delete a Note
  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await axios.delete(`${API_BASE}/api/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
      showNotification('Note deleted', 'success');
    } catch (error) {
      showNotification('Failed to delete note', 'error');
    }
  };

  // Toggle Pinned Status
  const handleTogglePin = async (note) => {
    try {
      const response = await axios.put(`${API_BASE}/api/notes/${note._id}`, {
        isPinned: !note.isPinned
      });
      setNotes(notes.map(n => n._id === note._id ? response.data : n));
      showNotification(note.isPinned ? 'Note unpinned' : 'Note pinned', 'success');
    } catch (error) {
      showNotification('Failed to update note pin', 'error');
    }
  };

  // Edit Note Submit
  const handleUpdateNoteSubmit = async (e) => {
    e.preventDefault();
    if (!editingNote.title.trim() && !editingNote.content.trim()) {
      showNotification('Note must have a title or content', 'error');
      return;
    }

    const tags = typeof editingNote.tagsInput === 'string'
      ? editingNote.tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : editingNote.tags;

    try {
      const response = await axios.put(`${API_BASE}/api/notes/${editingNote._id}`, {
        title: editingNote.title,
        content: editingNote.content,
        tags,
        color: editingNote.color,
        isPinned: editingNote.isPinned
      });

      setNotes(notes.map(n => n._id === editingNote._id ? response.data : n));
      setEditingNote(null);
      showNotification('Note updated!', 'success');
    } catch (error) {
      showNotification('Failed to update note', 'error');
    }
  };

  const handleCopyNoteContent = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Note copied to clipboard!', 'success');
    } catch (err) {
      showNotification('Failed to copy note', 'error');
    }
  };

  // Extract all unique tags across notes for filtering
  const allUniqueTags = Array.from(
    new Set(notes.flatMap(note => note.tags || []))
  ).filter(Boolean);

  // Filter & Sort logic
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesColor = !selectedColorFilter || note.color === selectedColorFilter;
    const matchesTag = !selectedTagFilter || note.tags.includes(selectedTagFilter);

    return matchesSearch && matchesColor && matchesTag;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    // Pinned notes always stay on top
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (sortBy === 'date-desc') {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    }
    if (sortBy === 'date-asc') {
      return new Date(a.updatedAt) - new Date(b.updatedAt);
    }
    if (sortBy === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  // Render Auth Interface
  if (!token) {
    return (
      <div className="auth-container animate-fade-in">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>

        <div className="auth-card">
          <div className="auth-logo">
            <span className="logo-icon">📝</span>
            <h1>Auth<span>Notes</span></h1>
          </div>
          <h2>{isAuthMode ? 'Welcome Back' : 'Create an Account'}</h2>
          <p className="auth-subtitle">
            {isAuthMode ? 'Sign in to access your secure notes dashboard' : 'Join and start keeping secure full-stack notes'}
          </p>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {!isAuthMode && (
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={authForm.name}
                  onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                  required
                />
              </div>
            )}
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn-primary auth-btn">
              {isAuthMode ? 'Sign In' : 'Register Now'}
            </button>
          </form>

          <div className="auth-toggle">
            <span>
              {isAuthMode ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button className="btn-link" onClick={() => setIsAuthMode(!isAuthMode)}>
              {isAuthMode ? 'Register here' : 'Login here'}
            </button>
          </div>
        </div>

        {message && (
          <div className={`toast-notification ${messageType}`}>
            <div className="toast-content">
              <span className="toast-icon">{messageType === 'success' ? '✅' : '❌'}</span>
              <span className="toast-text">{message}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render main Notes Dashboard
  return (
    <div className="dashboard-container">
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      {/* Header section */}
      <header className="dashboard-header">
        <div className="header-logo">
          <span className="logo-icon">📝</span>
          <h1>Auth<span>Notes</span></h1>
        </div>

        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search notes by title, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {user && (
          <div className="user-profile-section">
            <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Layout Grid */}
      <main className="dashboard-main">
        {/* Sidebar for filters */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-section">
            <h3>Filter by Color</h3>
            <div className="color-filters-grid">
              <button
                className={`color-filter-btn reset-filter ${selectedColorFilter === '' ? 'active' : ''}`}
                onClick={() => setSelectedColorFilter('')}
                title="All Colors"
              >
                All
              </button>
              {NOTE_COLORS.map(color => (
                <button
                  key={color.value}
                  className={`color-filter-btn ${selectedColorFilter === color.value ? 'active' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setSelectedColorFilter(color.value)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3>Filter by Tag</h3>
            {allUniqueTags.length ? (
              <div className="tag-filters-list">
                <button
                  className={`tag-filter-btn ${selectedTagFilter === '' ? 'active' : ''}`}
                  onClick={() => setSelectedTagFilter('')}
                >
                  🏷️ All Tags
                </button>
                {allUniqueTags.map(tag => (
                  <button
                    key={tag}
                    className={`tag-filter-btn ${selectedTagFilter === tag ? 'active' : ''}`}
                    onClick={() => setSelectedTagFilter(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            ) : (
              <p className="no-filters-msg">Create notes with tags to see them here.</p>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Sort Order</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-dropdown"
            >
              <option value="date-desc">Updated: Newest First</option>
              <option value="date-asc">Updated: Oldest First</option>
              <option value="alpha">Alphabetical: A-Z</option>
            </select>
          </div>
        </aside>

        {/* Notes listing & creation area */}
        <div className="dashboard-content">
          {/* Creator card */}
          <section className={`card note-creator ${isCreatorExpanded ? 'expanded' : ''}`}>
            <form onSubmit={handleAddNote}>
              {isCreatorExpanded && (
                <div className="creator-header">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    className="creator-title-input"
                  />
                  <button
                    type="button"
                    className={`btn-pin-toggle ${newNote.isPinned ? 'pinned' : ''}`}
                    onClick={() => setNewNote({ ...newNote, isPinned: !newNote.isPinned })}
                    title="Pin Note"
                  >
                    📌
                  </button>
                </div>
              )}

              <textarea
                placeholder="Take a note... (Click here to expand)"
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                onFocus={() => setIsCreatorExpanded(true)}
                className="creator-content-input"
                rows={isCreatorExpanded ? 4 : 1}
              />

              {isCreatorExpanded && (
                <div className="creator-footer animate-fade-in">
                  <div className="footer-inputs">
                    <div className="input-tags-wrapper">
                      <span className="tag-label">🏷️ Tags:</span>
                      <input
                        type="text"
                        placeholder="personal, work, study (comma-separated)..."
                        value={newNote.tagsInput}
                        onChange={(e) => setNewNote({ ...newNote, tagsInput: e.target.value })}
                        className="creator-tags-input"
                      />
                    </div>

                    <div className="color-selector">
                      <span className="color-label">🎨 Color:</span>
                      <div className="colors-row">
                        {NOTE_COLORS.map(color => (
                          <button
                            key={color.value}
                            type="button"
                            className={`color-btn ${newNote.color === color.value ? 'selected' : ''}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setNewNote({ ...newNote, color: color.value })}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="creator-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setIsCreatorExpanded(false);
                        setNewNote({ title: '', content: '', tagsInput: '', color: '#1e293b', isPinned: false });
                      }}
                    >
                      Close
                    </button>
                    <button type="submit" className="btn-primary">
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </form>
          </section>

          {/* Notes Grid listing */}
          {sortedNotes.length ? (
            <div className="notes-grid">
              {sortedNotes.map(note => (
                <article
                  key={note._id}
                  className={`note-card ${note.isPinned ? 'pinned' : ''}`}
                  style={{ '--note-color': note.color }}
                >
                  <div className="note-card-header">
                    <h3 className="note-card-title">{note.title || 'Untitled'}</h3>
                    <div className="note-card-actions-top">
                      <button
                        className={`action-btn-top pin-btn ${note.isPinned ? 'active' : ''}`}
                        onClick={() => handleTogglePin(note)}
                        title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                      >
                        📌
                      </button>
                    </div>
                  </div>

                  <p className="note-card-content">{note.content}</p>

                  {note.tags && note.tags.length > 0 && (
                    <div className="note-card-tags">
                      {note.tags.map(tag => (
                        <span key={tag} className="note-tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="note-card-footer">
                    <span className="note-date">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    <div className="note-card-actions-bottom">
                      <button
                        className="action-btn copy-btn"
                        onClick={() => handleCopyNoteContent(`${note.title}\n\n${note.content}`)}
                        title="Copy note to clipboard"
                      >
                        📋
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => {
                          setEditingNote({
                            ...note,
                            tagsInput: note.tags.join(', ')
                          });
                        }}
                        title="Edit note"
                      >
                        ✏️
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteNote(note._id)}
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-dashboard">
              <span className="empty-icon">📂</span>
              <p>No notes found matching your filters.</p>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelectedColorFilter('');
                  setSelectedTagFilter('');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Edit Note Modal */}
      {editingNote && (
        <div className="modal-overlay animate-fade-in">
          <div className="card modal-card" style={{ '--note-color': editingNote.color }}>
            <h2>Edit Note</h2>
            <form onSubmit={handleUpdateNoteSubmit}>
              <div className="input-group">
                <label>Title</label>
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  placeholder="Title"
                  className="modal-title-input"
                />
              </div>

              <div className="input-group">
                <label>Content</label>
                <textarea
                  value={editingNote.content}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  placeholder="Note content..."
                  className="modal-content-input"
                  rows={6}
                />
              </div>

              <div className="input-group">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  value={editingNote.tagsInput}
                  onChange={(e) => setEditingNote({ ...editingNote, tagsInput: e.target.value })}
                  placeholder="work, life, urgent..."
                  className="modal-tags-input"
                />
              </div>

              <div className="input-group">
                <label>Note Color</label>
                <div className="colors-row modal-colors">
                  {NOTE_COLORS.map(color => (
                    <button
                      key={color.value}
                      type="button"
                      className={`color-btn ${editingNote.color === color.value ? 'selected' : ''}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setEditingNote({ ...editingNote, color: color.value })}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEditingNote(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {message && (
        <div className={`toast-notification ${messageType}`}>
          <div className="toast-content">
            <span className="toast-icon">
              {messageType === 'success' ? '✅' : messageType === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span className="toast-text">{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
