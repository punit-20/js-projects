const express = require('express');
const { getOrCreateUser, addUserActivity } = require('../utils/userHelpers');
const router = express.Router();

router.get('/:code', async (req, res) => {
  const db = req.app.locals.db;
  const urls = db.collection('urls');
  const url = await urls.findOne({ shortCode: req.params.code });

  if (!url) {
    return res.status(404).json({ message: 'Short URL not found' });
  }

  const user = await getOrCreateUser(req, res);
  await addUserActivity(db, user.encodedId, {
    type: 'visited',
    longUrl: url.longUrl,
    shortUrl: `/r/${url.shortCode}`,
    shortCode: url.shortCode,
  });

  await urls.updateOne({ _id: url._id }, { $inc: { clickCount: 1 } });
  res.redirect(url.longUrl);
});

module.exports = router;
