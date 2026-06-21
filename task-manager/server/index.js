const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const PORT = process.env.PORT || 5003;
const DB_NAME = 'task_manager_db';

let dbClient;
let database;

// Initialize Database connection (Local MongoDB with in-memory fallback)
async function initDatabase() {
  async function connectClient(uri) {
    const client = new MongoClient(uri, {
      connectTimeoutMS: 2000,
      serverSelectionTimeoutMS: 2000
    });
    await client.connect();
    return client;
  }

  try {
    dbClient = await connectClient(MONGO_URI);
    database = dbClient.db(DB_NAME);
    console.log(`Connected to MongoDB at ${MONGO_URI}`);
  } catch (error) {
    console.warn(`Local MongoDB not available at ${MONGO_URI}. Starting in-memory fallback.`);
    const memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    dbClient = await connectClient(memUri);
    database = dbClient.db(DB_NAME);
    console.log(`Connected to in-memory MongoDB fallback at ${memUri}`);
  }
}

// ----------------------------------------------------
// REST API ENDPOINTS
// ----------------------------------------------------

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: dbClient.options.srvHost ? 'cloud' : 'local' });
});

// 1. GET /api/tasks - Retrieve Tasks with optional filters
app.get('/api/tasks', async (req, res) => {
  try {
    const query = {};
    const { status, priority, search } = req.query;

    // Filter by completed status (true/false)
    if (status === 'completed') {
      query.completed = true;
    } else if (status === 'pending') {
      query.completed = false;
    }

    // Filter by priority
    if (priority && ['high', 'medium', 'low'].includes(priority.toLowerCase())) {
      query.priority = priority.toLowerCase();
    }

    // Search filter (case-insensitive text match on title)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const tasksCollection = database.collection('tasks');
    const tasks = await tasksCollection.find(query).sort({ createdAt: -1 }).toArray();

    // Map _id to id for client convenience
    const formattedTasks = tasks.map(t => ({
      id: t._id,
      title: t.title,
      description: t.description || '',
      priority: t.priority || 'medium',
      completed: !!t.completed,
      createdAt: t.createdAt
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to retrieve tasks' });
  }
});

// 2. POST /api/tasks - Create new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const taskPriority = (priority && ['high', 'medium', 'low'].includes(priority.toLowerCase()))
      ? priority.toLowerCase()
      : 'medium';

    const newTask = {
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: taskPriority,
      completed: false,
      createdAt: new Date()
    };

    const tasksCollection = database.collection('tasks');
    const result = await tasksCollection.insertOne(newTask);

    res.status(201).json({
      id: result.insertedId,
      ...newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// 3. PUT /api/tasks/:id - Update an existing task (or toggle complete status)
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, completed } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (completed !== undefined) updateFields.completed = !!completed;
    
    if (priority !== undefined) {
      if (['high', 'medium', 'low'].includes(priority.toLowerCase())) {
        updateFields.priority = priority.toLowerCase();
      } else {
        return res.status(400).json({ error: 'Invalid priority level' });
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No update parameters provided' });
    }

    const tasksCollection = database.collection('tasks');
    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    // Express/MongoDB compat: handles updated documents safely
    const updatedDoc = result.value || await tasksCollection.findOne({ _id: new ObjectId(id) });
    if (!updatedDoc) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      id: updatedDoc._id,
      title: updatedDoc.title,
      description: updatedDoc.description,
      priority: updatedDoc.priority,
      completed: updatedDoc.completed,
      createdAt: updatedDoc.createdAt
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// 4. DELETE /api/tasks/:id - Remove task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const tasksCollection = database.collection('tasks');
    const result = await tasksCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', id: id });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Start Server after DB initialization
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`Task Manager Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to launch application:', err);
  process.exit(1);
});
