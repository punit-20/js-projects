const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const PORT = process.env.PORT || 5001; // Avoid port collision with url-shortner (5000)
const DB_NAME = 'notes_app_db';

async function createMongoClient() {
  let uri = MONGO_URI;
  let memoryServer;

  async function connectClient(currentUri) {
    const client = new MongoClient(currentUri, {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000
    });
    await client.connect();
    return client;
  }

  try {
    const client = await connectClient(uri);
    console.log(`Connected to MongoDB at ${uri}`);
    return { client, memoryServer: null };
  } catch (error) {
    console.warn(`Local MongoDB not available at ${uri}. Starting in-memory fallback.`);
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
    const client = await connectClient(uri);
    console.log(`Connected to in-memory MongoDB at ${uri}`);
    return { client, memoryServer };
  }
}

async function startServer() {
  const { client, memoryServer } = await createMongoClient();
  const db = client.db(DB_NAME);
  app.locals.db = db;
  app.locals.memoryServer = memoryServer;

  // Register routes
  app.use('/api/auth', authRoutes);
  app.use('/api/notes', notesRoutes);

  // Default health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', database: memoryServer ? 'in-memory' : 'local' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
