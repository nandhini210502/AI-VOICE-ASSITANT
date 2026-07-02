const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

// In-memory user store (replace with DB in production)
const users = new Map();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('username').isLength({ min: 2, max: 30 }).trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, username } = req.body;

      if (users.has(email)) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = { id: uuidv4(), email, username, password: hashedPassword, createdAt: new Date() };
      users.set(email, user);

      const token = generateToken(user);
      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        token,
        user: { id: user.id, email: user.email, username: user.username },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = users.get(email);

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      logger.info(`User logged in: ${email}`);

      res.json({
        token,
        user: { id: user.id, email: user.email, username: user.username },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Guest login (no auth required for demo)
router.post('/guest', async (req, res, next) => {
  try {
    const guestId = uuidv4();
    const user = {
      id: guestId,
      email: `guest_${guestId.slice(0, 8)}@guest.local`,
      username: `Guest_${guestId.slice(0, 6)}`,
    };
    const token = generateToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// Verify token
router.get('/me', require('../middleware/auth'), (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
