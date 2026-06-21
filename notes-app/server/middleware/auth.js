const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'notes_app_secret_key_12345';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains id and email
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token is invalid or expired' });
  }
}

module.exports = authMiddleware;
