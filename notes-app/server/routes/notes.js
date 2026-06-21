const express = require('express');
const { ObjectId } = require('mongodb');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all note routes
router.use(authMiddleware);

// GET all notes for user
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const notesCollection = db.collection('notes');

    const notes = await notesCollection
      .find({ userId: req.user.id })
      .sort({ isPinned: -1, updatedAt: -1 })
      .toArray();

    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to retrieve notes' });
  }
});

// POST create a note
router.post('/', async (req, res) => {
  const { title, content, tags, color, isPinned } = req.body;

  try {
    const db = req.app.locals.db;
    const notesCollection = db.collection('notes');

    const newNote = {
      userId: req.user.id,
      title: title || '',
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      color: color || '#1e293b', // Default color
      isPinned: !!isPinned,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await notesCollection.insertOne(newNote);
    res.status(201).json({ id: result.insertedId.toString(), ...newNote });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

// PUT edit a note
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, color, isPinned } = req.body;

  try {
    const db = req.app.locals.db;
    const notesCollection = db.collection('notes');

    // Find note to check ownership
    const note = await notesCollection.findOne({ _id: new ObjectId(id) });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You do not own this note' });
    }

    const updatedData = {
      updatedAt: new Date().toISOString()
    };
    if (title !== undefined) updatedData.title = title;
    if (content !== undefined) updatedData.content = content;
    if (tags !== undefined) updatedData.tags = Array.isArray(tags) ? tags : [];
    if (color !== undefined) updatedData.color = color;
    if (isPinned !== undefined) updatedData.isPinned = !!isPinned;

    await notesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    const updatedNote = await notesCollection.findOne({ _id: new ObjectId(id) });
    res.json(updatedNote);

  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Failed to update note' });
  }
});

// DELETE a note
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = req.app.locals.db;
    const notesCollection = db.collection('notes');

    // Find note to check ownership
    const note = await notesCollection.findOne({ _id: new ObjectId(id) });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: You do not own this note' });
    }

    await notesCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: 'Note deleted successfully', id });

  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Failed to delete note' });
  }
});

module.exports = router;
