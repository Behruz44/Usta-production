import express from 'express';
import { Order, Product, User } from '../models/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

const ORDER_STATUSES = ['new', 'processing', 'shipped', 'completed', 'cancelled'];
const PUBLIC_ORDER_LIMIT_WINDOW_MS = 60 * 1000;
const PUBLIC_ORDER_LIMIT_MAX = 10;
const publicOrderHits = new Map();

const isAdmin = (user) => ['super_admin', 'admin'].includes(user?.role);

const getClientIp = (req) => req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.socket?.remoteAddress || 'unknown';

const publicOrderRateLimit = (req, res, next) => {
  const now = Date.now();
  const ip = getClientIp(req);
  const bucket = publicOrderHits.get(ip) || [];
  const recentHits = bucket.filter((timestamp) => now - timestamp < PUBLIC_ORDER_LIMIT_WINDOW_MS);

  if (recentHits.length >= PUBLIC_ORDER_LIMIT_MAX) {
    return res.status(429).json({ error: 'Too many order attempts. Please try again later.' });
  }

  recentHits.push(now);
  publicOrderHits.set(ip, recentHits);
  next();
};

const toPositiveInteger = (value) => {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const normalizeOrderItems = (body) => {
  const rawItems = Array.isArray(body.items) ? body.items : body.products;

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return null;
  }

  return rawItems.map((item) => ({
    productId: toPositiveInteger(item.productId ?? item.id),
    quantity: toPositiveInteger(item.quantity ?? item.qty ?? 1)
  }));
};

const safeOrderPayload = (order) => ({
  id: order.id,
  userId: order.userId,
  customerName: order.customerName,
  customerPhone: order.customerPhone,
  products: order.products,
  total: Number(order.total),
  status: order.status,
  notes: order.notes,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt
});

// GET /api/orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(toPositiveInteger(page) || 1, 1);
    const pageSize = Math.min(Math.max(toPositiveInteger(limit) || 20, 1), 100);

    const where = {};
    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }
      where.status = status;
    }

    if (!isAdmin(req.user)) {
      where.userId = req.user.id;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize
    });

    res.json({
      orders: rows.map(safeOrderPayload),
      total: count,
      pages: Math.ceil(count / pageSize),
      currentPage: pageNumber
    });
  } catch (error) {
    console.error('Failed to load orders:', error);
    res.status(500).json({ error: 'Failed to load orders' });
  }
});

// GET /api/orders/:id
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'phone'] }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (!isAdmin(req.user) && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(safeOrderPayload(order));
  } catch (error) {
    console.error('Failed to load order:', error);
    res.status(500).json({ error: 'Failed to load order' });
  }
});

// POST /api/orders (public - for customer orders)
router.post('/', publicOrderRateLimit, async (req, res) => {
  try {
    const { customerName, customerPhone, notes } = req.body;
    const items = normalizeOrderItems(req.body);

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    if (!customerPhone || typeof customerPhone !== 'string' || !/^\+?[0-9\s()\-]{7,20}$/.test(customerPhone.trim())) {
      return res.status(400).json({ error: 'Valid customer phone is required' });
    }

    if (!items || items.some((item) => !item.productId || !item.quantity)) {
      return res.status(400).json({ error: 'Order must contain valid products and quantities' });
    }

    const uniqueProductIds = [...new Set(items.map((item) => item.productId))];
    const products = await Product.findAll({
      where: {
        id: uniqueProductIds,
        isActive: true
      }
    });

    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ error: 'Order contains unavailable products' });
    }

    const orderProducts = items.map((item) => {
      const product = products.find((candidate) => Number(candidate.id) === Number(item.productId));
      const stock = Number(product.stock ?? 0);

      if (stock < item.quantity) {
        const err = new Error(`Insufficient stock for product ${product.id}`);
        err.status = 400;
        err.publicMessage = `Insufficient stock for ${product.nameRu || product.name}`;
        throw err;
      }

      const price = Number(product.price);
      return {
        productId: product.id,
        name: product.name,
        nameRu: product.nameRu,
        price,
        quantity: item.quantity,
        unit: product.unit,
        subtotal: Number((price * item.quantity).toFixed(2))
      };
    });

    const total = orderProducts.reduce((sum, item) => sum + item.subtotal, 0);

    const order = await Order.create({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      products: orderProducts,
      total: Number(total.toFixed(2)),
      notes: typeof notes === 'string' ? notes.trim().slice(0, 1000) : null,
      status: 'new'
    });

    res.status(201).json(safeOrderPayload(order));
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ error: error.publicMessage || 'Invalid order' });
    }
    console.error('Failed to create order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUT /api/orders/:id/status (admin only)
router.put('/:id/status', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status' });
    }

    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.update({ status });

    res.json(safeOrderPayload(order));
  } catch (error) {
    console.error('Failed to update order status:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// DELETE /api/orders/:id (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Failed to delete order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

export default router;
