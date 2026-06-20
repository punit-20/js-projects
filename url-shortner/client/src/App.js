import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Enable cookies and credentials across origins
axios.defaults.withCredentials = true;

// Pre-load user ID from localStorage
const storedUserId = localStorage.getItem('shortener_user_id');
if (storedUserId) {
  axios.defaults.headers.common['X-User-Id'] = storedUserId;
}

function App() {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isCopyingShort, setIsCopyingShort] = useState(false);

  useEffect(() => {
    fetchUser();
    fetchUrls();

    // Poll server for real-time monitoring of links, click stats, and activity timeline
    const intervalId = setInterval(() => {
      fetchUser();
      fetchUrls();
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/urls`);
      setUrls(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/users`);
      const userData = response.data.user;
      setUser(userData);
      
      // Store user ID client-side if not set or if it changed
      if (userData?.id) {
        localStorage.setItem('shortener_user_id', userData.id);
        axios.defaults.headers.common['X-User-Id'] = userData.id;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    }
  };

  const showNotification = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 4000);
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!longUrl) {
      showNotification('Please enter a valid URL', 'error');
      return;
    }

    try {
      const response = await axios.post(`${API_BASE}/api/urls`, { longUrl });
      const fullShortUrl = `${API_BASE}${response.data.shortUrl}`;
      setShortUrl(fullShortUrl);
      showNotification('Short link generated successfully!', 'success');
      setLongUrl('');
      fetchUrls();
      fetchUser();
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to shorten URL', 'error');
    }
  };

  const handleCopy = async (text, index = null) => {
    try {
      await navigator.clipboard.writeText(text);
      if (index !== null) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      } else {
        setIsCopyingShort(true);
        setTimeout(() => setIsCopyingShort(false), 2000);
      }
      showNotification('Copied to clipboard!', 'success');
    } catch (err) {
      showNotification('Failed to copy', 'error');
    }
  };

  const createdLinks = user?.activity?.filter((item) => item.type === 'created') || [];
  const activityItems = user?.activity || [];

  return (
    <div className="app-container">
      {/* Background blobs for premium micro-animation & design */}
      <div className="bg-glow-1"></div>
      <div className="bg-glow-2"></div>

      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">🔗</div>
          <h1>Snip<span>URL</span></h1>
        </div>
        <p className="subtitle">Premium URL Shortener & Real-Time Link Analytics</p>
      </header>


      {/* Main Shortener Form */}
      <section className="card shortener-section">
        <h2>Shorten a new URL</h2>
        <form onSubmit={handleShorten} className="form-row">
          <div className="input-wrapper">
            <span className="input-icon">🔗</span>
            <input
              type="url"
              placeholder="Paste your long link here (e.g. https://google.com)..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Generate Short Link</button>
        </form>

        {shortUrl && (
          <div className="result-container animate-fade-in">
            <div className="result-header">
              <h3>Your shortened link is ready!</h3>
            </div>
            <div className="result-body">
              <div className="result-url-box">
                <a href={shortUrl} target="_blank" rel="noreferrer" className="shortened-link">
                  {shortUrl}
                </a>
                <button className="btn-copy" onClick={() => handleCopy(shortUrl)}>
                  {isCopyingShort ? 'Copied! ✅' : 'Copy'}
                </button>
              </div>
              <div className="qr-container">
                <div className="qr-box">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(shortUrl)}`}
                    alt="QR Code"
                    className="qr-img"
                  />
                  <p className="qr-label">Scan to open URL</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Grid for History & Analytics */}
      <div className="dashboard-grid">
        {/* User's Created Links */}
        <section className="card grid-span-2">
          <h2>Your Created Links</h2>
          {createdLinks.length ? (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Long Link</th>
                    <th>Short Link</th>
                    <th>Created At</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {createdLinks.map((item, index) => {
                    const fullShort = `${API_BASE}${item.shortUrl}`;
                    return (
                      <tr key={`${item.shortCode}-${index}`}>
                        <td className="truncate-cell" title={item.longUrl}>
                          {item.longUrl}
                        </td>
                        <td>
                          <a href={fullShort} target="_blank" rel="noreferrer" className="table-link">
                            {item.shortUrl}
                          </a>
                        </td>
                        <td>{new Date(item.timestamp).toLocaleString()}</td>
                        <td>
                          <button
                            className="btn-table-copy"
                            onClick={() => handleCopy(fullShort, index)}
                          >
                            {copiedIndex === index ? 'Copied! ✓' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No links shortened in this session yet.</p>
            </div>
          )}
        </section>

        {/* Global/Recent Redirect Click Counts */}
        <section className="card">
          <h2>Global Click Stats</h2>
          {urls.length ? (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Short Code</th>
                    <th>Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {urls.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <a href={`${API_BASE}/r/${item.shortCode}`} target="_blank" rel="noreferrer" className="table-link-code">
                          /r/{item.shortCode}
                        </a>
                      </td>
                      <td>
                        <span className="click-pill">{item.clickCount} clicks</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No shortened links exist globally.</p>
            </div>
          )}
        </section>
      </div>

      {/* Activity Log Timeline */}
      <section className="card activity-section">
        <h2>Your Activity Timeline</h2>
        {activityItems.length ? (
          <div className="timeline">
            {activityItems.map((item, index) => (
              <div key={`${item.type}-${item.shortCode}-${index}`} className="timeline-item">
                <div className={`timeline-badge ${item.type}`}>
                  {item.type === 'created' ? '＋' : '➜'}
                </div>
                <div className="timeline-content">
                  <div className="timeline-time">
                    {new Date(item.timestamp).toLocaleString()}
                  </div>
                  <p className="timeline-text">
                    <strong>{item.type === 'created' ? 'Created shortened link' : 'Visited link'}</strong>:{' '}
                    <a href={`${API_BASE}${item.shortUrl}`} target="_blank" rel="noreferrer" className="timeline-link">
                      /r/{item.shortCode}
                    </a>
                  </p>
                  <p className="timeline-subtext">Original: {item.longUrl}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No activity history logged yet.</p>
          </div>
        )}
      </section>

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
