const express = require('express');
const { getOrCreateUser } = require('../utils/userHelpers');
const router = express.Router();

router.get('/', async (req, res) => {
  const user = await getOrCreateUser(req, res);
  res.json({ user });
});

module.exports = router;
