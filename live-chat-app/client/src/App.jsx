import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5002';

const AVATAR_COLORS = [
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#0ea5e9'  // Sky Blue
];

const PRESETS_ROOMS = ['General', 'Gaming', 'Coding', 'Music', 'Tech Support'];

function App() {
  // Join Room Screen States
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('General');
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [isJoined, setIsJoined] = useState(false);

  // Chat Screen States
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  // Socket and Scroll Refs
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isTypingState, setIsTypingState] = useState(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typingUsers]);

  // Handle Socket events connection
  useEffect(() => {
    if (!isJoined) return;

    // 1. Initialize socket connection
    const socket = io(SOCKET_SERVER_URL);
    socketRef.current = socket;

    // 2. Emit join_room payload
    socket.emit('join_room', { username, room, color });

    // 3. Setup event listeners
    socket.on('chat_history', (history) => {
      setMessages(history);
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('room_users', (userList) => {
      setUsers(userList);
    });

    socket.on('user_typing', ({ username: typingUser, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          // Add user if not already in list
          if (!prev.includes(typingUser)) {
            return [...prev, typingUser];
          }
          return prev;
        } else {
          // Remove user from list
          return prev.filter((u) => u !== typingUser);
        }
      });
    });

    // Cleanup connection when leaving or unmounting
    return () => {
      socket.disconnect();
    };
  }, [isJoined, username, room, color]);

  // Join Room Form Handler
  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
      setIsJoined(true);
    }
  };

  // Send Message Handler
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageText.trim() && socketRef.current) {
      // Emit message
      socketRef.current.emit('send_message', { text: messageText });
      setMessageText('');

      // Clear local typing timeout and emit typing stopped
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socketRef.current.emit('typing', { isTyping: false });
      setIsTypingState(false);
    }
  };

  // Input change handler supporting Typing Indicator
  const handleInputChange = (e) => {
    setMessageText(e.target.value);

    if (!socketRef.current) return;

    // Emit typing status if not already typing
    if (!isTypingState) {
      setIsTypingState(true);
      socketRef.current.emit('typing', { isTyping: true });
    }

    // Reset typing timeout to stop indicator after 1.5s idle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit('typing', { isTyping: false });
      setIsTypingState(false);
    }, 1500);
  };

  // Leave Room Handler
  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room');
    }
    // Reset states
    setIsJoined(false);
    setMessages([]);
    setUsers([]);
    setTypingUsers([]);
    setMessageText('');
  };

  // Render Join Screen
  if (!isJoined) {
    return (
      <div className="join-container">
        <div className="join-header">
          <h1>SyncTalk</h1>
          <p>Join a real-time room and chat instantly</p>
        </div>

        <form onSubmit={handleJoin} style={{ width: '100%' }}>
          <div className="form-group">
            <label htmlFor="username">Your Nickname</label>
            <input
              type="text"
              id="username"
              className="input-field"
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              maxLength={20}
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label htmlFor="room">Choose or Enter Room</label>
            <input
              type="text"
              id="room"
              className="input-field"
              placeholder="Enter room name"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              required
              maxLength={30}
              autoComplete="off"
              list="rooms-list"
            />
            <datalist id="rooms-list">
              {PRESETS_ROOMS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="color-picker-label">Avatar Identity Color</label>
            <div className="color-options">
              {AVATAR_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-dot ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Join Chat Room
          </button>
        </form>
      </div>
    );
  }

  // Helper to format timestamps nicely
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Render Active Chat Room
  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <span className="brand">SyncTalk</span>
          <span className="room-badge">{room}</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-title">Active Users ({users.length})</div>
          {users.map((u) => (
            <div key={u.id} className="user-item">
              <div
                className="user-avatar-dot"
                style={{ backgroundColor: u.color }}
              />
              <span className={`user-name ${u.username === username ? 'self' : ''}`}>
                {u.username} {u.username === username && '(You)'}
              </span>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="current-user-info">
            <div
              className="avatar-preview"
              style={{ backgroundColor: color }}
            >
              {username.charAt(0).toUpperCase()}
            </div>
            <span>{username}</span>
          </div>
          <button className="btn-leave" onClick={handleLeaveRoom}>
            Leave
          </button>
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="chat-main">
        <div className="chat-header">
          <div className="chat-room-info">
            <h2># {room}</h2>
            <p>Welcome to the beginning of the room feed.</p>
          </div>
          <div className="active-count">
            <div className="pulse-dot" />
            <span>{users.length} Online</span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="chat-messages">
          {messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="msg-system">
                  {msg.text}
                </div>
              );
            }

            const isSelf = msg.sender === username;
            return (
              <div
                key={msg.id}
                className={`msg-wrapper ${isSelf ? 'self' : 'other'}`}
              >
                <div className="msg-meta">
                  <span className="msg-sender" style={{ color: isSelf ? '#c084fc' : msg.color }}>
                    {msg.sender}
                  </span>
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Typing Indicators */}
        <div className="typing-indicator-wrapper">
          {typingUsers.length > 0 && (
            <>
              <span>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
              </span>
              <div className="typing-dots">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </>
          )}
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSendMessage} className="chat-input-bar">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={handleInputChange}
            required
            autoComplete="off"
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
