import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { User } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа. Попробуйте через 15 минут.' }
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: 'Слишком много запросов. Попробуйте позже.' }
});

const revokedTokens = new Set();

const router = express.Router();

// POST /auth/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Account is blocked' });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('POST /auth/login - Error:', error);
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// POST /auth/refresh
router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    if (revokedTokens.has(refreshToken)) {
      return res.status(403).json({ error: 'Token has been revoked' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || user.isBlocked) {
      return res.status(404).json({ error: 'User not found or blocked' });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({ accessToken });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// GET /auth/me
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'username', 'email', 'role', 'isBlocked']
    });

    if (!user || user.isBlocked) {
      return res.status(401).json({ error: 'Session is invalid' });
    }

    res.json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('GET /auth/me - Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) revokedTokens.add(refreshToken);
  res.json({ message: 'Logged out successfully' });
});

// POST /auth/register (protected - only authenticated admins can create users)
router.post('/register', authenticateToken, async (req, res) => {
  try {
    const { name, username, email, password, role } = req.body;

    // Only allow admins to create users
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Name, username and password required' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Prevent creating super_admin via API
    const safeRole = (role === 'admin' || role === 'manager') ? role : 'manager';

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role: safeRole
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

export default router;
