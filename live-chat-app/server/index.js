const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chat-server' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory data store for messages history and active rooms
// Format: { roomName: [ { sender, text, timestamp, color } ] }
const chatHistory = new Map();

// Helper to get active users in a specific room
async function getRoomUsers(roomName) {
  const sockets = await io.in(roomName).fetchSockets();
  return sockets.map(s => ({
    id: s.id,
    username: s.username || 'Anonymous',
    color: s.color || '#3b82f6'
  }));
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // 1. Join Room Event
  socket.on('join_room', async ({ username, room, color }) => {
    // If user was already in a room, leave it first
    if (socket.currentRoom) {
      socket.leave(socket.currentRoom);
      const oldRoom = socket.currentRoom;
      
      // Notify old room
      socket.to(oldRoom).emit('receive_message', {
        id: `sys-${Date.now()}`,
        sender: 'System',
        text: `${socket.username} left the room`,
        timestamp: Date.now(),
        isSystem: true
      });

      // Update old room users list
      const oldUsers = await getRoomUsers(oldRoom);
      io.to(oldRoom).emit('room_users', oldUsers);
    }

    // Set socket properties
    socket.username = username;
    socket.currentRoom = room;
    socket.color = color || '#3b82f6';

    // Join new socket.io room
    socket.join(room);
    console.log(`User ${username} joined room: ${room}`);

    // Fetch or initialize chat history for this room
    if (!chatHistory.has(room)) {
      chatHistory.set(room, []);
    }
    const history = chatHistory.get(room);

    // Send chat history to the newly joined user
    socket.emit('chat_history', history);

    // Send join system notification to others in the room
    socket.to(room).emit('receive_message', {
      id: `sys-${Date.now()}`,
      sender: 'System',
      text: `${username} joined the room`,
      timestamp: Date.now(),
      isSystem: true
    });

    // Update room active users list for everyone in the room
    const currentUsers = await getRoomUsers(room);
    io.to(room).emit('room_users', currentUsers);
  });

  // 2. Send Message Event
  socket.on('send_message', ({ text }) => {
    const room = socket.currentRoom;
    if (!room || !socket.username) return;

    const messageData = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: socket.username,
      text: text,
      timestamp: Date.now(),
      color: socket.color,
      isSystem: false
    };

    // Store in history (keep last 50 messages)
    if (!chatHistory.has(room)) {
      chatHistory.set(room, []);
    }
    const history = chatHistory.get(room);
    history.push(messageData);
    if (history.length > 50) {
      history.shift();
    }

    // Emit message to everyone in the room
    io.to(room).emit('receive_message', messageData);
  });

  // 3. Typing Indicator Events
  socket.on('typing', ({ isTyping }) => {
    const room = socket.currentRoom;
    if (!room || !socket.username) return;

    // Broadcast typing status to everyone in the room EXCEPT the sender
    socket.to(room).emit('user_typing', {
      username: socket.username,
      isTyping: isTyping
    });
  });

  // 4. Leave Room Event
  socket.on('leave_room', async () => {
    const room = socket.currentRoom;
    if (!room) return;

    socket.leave(room);
    console.log(`User ${socket.username} left room: ${room}`);

    // Send leave system notification to others in the room
    socket.to(room).emit('receive_message', {
      id: `sys-${Date.now()}`,
      sender: 'System',
      text: `${socket.username} left the room`,
      timestamp: Date.now(),
      isSystem: true
    });

    // Reset socket room properties
    socket.currentRoom = null;

    // Update active users list for the room
    const currentUsers = await getRoomUsers(room);
    io.to(room).emit('room_users', currentUsers);
  });

  // 5. Disconnect Event
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.id}`);
    const room = socket.currentRoom;
    if (room && socket.username) {
      socket.to(room).emit('receive_message', {
        id: `sys-${Date.now()}`,
        sender: 'System',
        text: `${socket.username} disconnected`,
        timestamp: Date.now(),
        isSystem: true
      });

      const currentUsers = await getRoomUsers(room);
      io.to(room).emit('room_users', currentUsers);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Socket.io Server running on port ${PORT}`);
});
