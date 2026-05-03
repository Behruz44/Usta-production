import express from 'express';
import { User, Order } from '../models/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/users (admin only)
router.get('/', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where = {};
    if (search) {
      const searchLower = search.toLowerCase();
      where[Op.or] = [
        { name: { [Op.like]: `%${searchLower}%` } },
        { phone: { [Op.like]: `%${searchLower}%` } },
        { email: { [Op.like]: `%${searchLower}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Order, as: 'orders', attributes: ['id', 'status', 'total', 'createdAt'] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      users: rows,
      total: count,
      pages: Math.ceil(count / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// GET /api/users/:id (admin only)
router.get('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Order, as: 'orders' }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// PUT /api/users/:id (admin only)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { name, email, phone, role, isBlocked } = req.body;

    const safeRole = role && ['admin', 'manager'].includes(role) ? role : undefined;

    await user.update({
      name: name !== undefined && name !== '' ? name : user.name,
      email: email !== undefined ? email : user.email,
      phone: phone !== undefined ? phone : user.phone,
      role: safeRole !== undefined ? safeRole : user.role,
      isBlocked: isBlocked !== undefined ? isBlocked : user.isBlocked
    });

    await user.reload();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// PUT /api/users/:id/block (admin only)
router.put('/:id/block', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isBlocked: true });

    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// PUT /api/users/:id/unblock (admin only)
router.put('/:id/unblock', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isBlocked: false });

    res.json({ message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// DELETE /api/users/:id (super admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

export default router;

