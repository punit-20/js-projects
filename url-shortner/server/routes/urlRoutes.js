const express = require('express');
const { randomBytes } = require('crypto');
const { getOrCreateUser, addUserActivity } = require('../utils/userHelpers');
const router = express.Router();

function generateShortCode() {
  return randomBytes(3).toString('hex');
}

router.post('/', async (req, res) => {
  const { longUrl } = req.body;
  if (!longUrl) {
    return res.status(400).json({ message: 'Long URL is required' });
  }

  const db = req.app.locals.db;
  const user = await getOrCreateUser(req, res);
  const urls = db.collection('urls');
  const shortCode = generateShortCode();
  const newUrl = {
    longUrl,
    shortCode,
    ownerId: user.id,
    userId: user.encodedId,
    clickCount: 0,
    createdAt: new Date(),
  };

  await urls.insertOne(newUrl);
  await addUserActivity(db, user.encodedId, {
    type: 'created',
    longUrl,
    shortUrl: `/r/${shortCode}`,
    shortCode,
  });

  res.status(201).json({ shortUrl: `/r/${shortCode}`, ...newUrl });
});

router.get('/', async (req, res) => {
  const db = req.app.locals.db;
  const urls = db.collection('urls');
  const allUrls = await urls.find().sort({ createdAt: -1 }).toArray();
  res.json(allUrls);
});

router.get('/:id', async (req, res) => {
  const db = req.app.locals.db;
  const urls = db.collection('urls');
  const url = await urls.findOne({ _id: new require('mongodb').ObjectId(req.params.id) });
  if (!url) {
    return res.status(404).json({ message: 'URL not found' });
  }
  res.json(url);
});

module.exports = router;
