const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'notes_app_secret_key_12345';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    const result = await usersCollection.insertOne(newUser);
    const userId = result.insertedId.toString();

    // Create JWT
    const token = jwt.sign(
      { id: userId, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name: newUser.name,
        email: newUser.email,
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const db = req.app.locals.db;
    const usersCollection = db.collection('users');

    // Find user
    const user = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to login' });
  }
});

module.exports = router;
