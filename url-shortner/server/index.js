const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const urlRoutes = require('./routes/urlRoutes');
const redirectRoutes = require('./routes/redirectRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const PORT = process.env.PORT || 5000;
const DB_NAME = 'url_shortener_db';

async function createMongoClient() {
  let uri = MONGO_URI;
  let memoryServer;

  async function connectClient(currentUri) {
    const client = new MongoClient(currentUri);
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

  app.use('/api/urls', urlRoutes);
  app.use('/api/users', userRoutes);
  app.use('/r', redirectRoutes);

  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
