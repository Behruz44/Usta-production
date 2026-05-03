import express from 'express';
import jwt from 'jsonwebtoken';
import { Product, Category } from '../models/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = 'uploads/products';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20, sort = 'createdAt', order = 'DESC', showAll } = req.query;

    const VALID_SORT_FIELDS = ['createdAt', 'price', 'name', 'views', 'stock'];
    const VALID_ORDER = ['ASC', 'DESC'];
    const safeSort = VALID_SORT_FIELDS.includes(sort) ? sort : 'createdAt';
    const safeOrder = VALID_ORDER.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';
    let isAdmin = false;
    if (showAll === 'true' && req.headers.authorization) {
      try {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_SECRET);
        isAdmin = true;
      } catch { }
    }
    const safeLimit = isAdmin ? Math.min(1000, parseInt(limit) || 20) : Math.min(500, parseInt(limit) || 20);

    const where = {};
    if (!isAdmin) {
      where.isActive = true;
    }

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { nameRu: { [Op.like]: `%${search}%` } },
        { nameKg: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      order: [[safeSort, safeOrder]],
      limit: safeLimit,
      offset: (parseInt(page) - 1) * safeLimit
    });

    res.json({
      products: rows,
      total: count,
      pages: Math.ceil(count / safeLimit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    await product.increment('views');

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// POST /api/products (admin only)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), upload.array('images', 5), async (req, res) => {
  try {
    console.log('POST /api/products - Request body:', req.body);
    console.log('POST /api/products - Files:', req.files);
    const { name, nameRu, nameKg, desc, descRu, descKg, categoryId, price, oldPrice, sku, stock, unit, specs, badge, isActive } = req.body;

    if (!name || !categoryId || !price) {
      return res.status(400).json({ error: 'Name, category and price are required' });
    }

    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

    let parsedSpecs = {};
    if (specs) {
      try { parsedSpecs = JSON.parse(specs); }
      catch { return res.status(400).json({ error: 'Invalid specs JSON' }); }
    }

    const product = await Product.create({
      name,
      nameRu: nameRu || name,
      nameKg: nameKg || name,
      desc,
      descRu,
      descKg,
      categoryId: parseInt(categoryId),
      price: parseFloat(price),
      oldPrice: oldPrice ? parseFloat(oldPrice) : null,
      sku,
      stock: stock ? parseInt(stock) : 0,
      unit: unit || 'шт',
      specs: parsedSpecs,
      images,
      badge,
      isActive: isActive !== undefined ? (isActive === '1' || isActive === 'true' || isActive === true) : true
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('POST /api/products - Error:', error);
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// PUT /api/products/:id (admin only)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { name, nameRu, nameKg, desc, descRu, descKg, categoryId, price, oldPrice, sku, stock, unit, specs, badge, isActive } = req.body;

    let images = product.images;
    if (req.files && req.files.length > 0) {
      const oldImages = Array.isArray(product.images) ? product.images : [];
      oldImages.forEach(imgPath => {
        const fullPath = path.join(process.cwd(), imgPath);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      });
      images = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    let parsedSpecs = product.specs;
    if (specs !== undefined) {
      try { parsedSpecs = JSON.parse(specs); }
      catch { return res.status(400).json({ error: 'Invalid specs JSON' }); }
    }

    await product.update({
      name: name !== undefined && name !== '' ? name : product.name,
      nameRu: nameRu !== undefined && nameRu !== '' ? nameRu : product.nameRu,
      nameKg: nameKg !== undefined && nameKg !== '' ? nameKg : product.nameKg,
      desc: desc !== undefined ? desc : product.desc,
      descRu: descRu !== undefined ? descRu : product.descRu,
      descKg: descKg !== undefined ? descKg : product.descKg,
      categoryId: categoryId ? parseInt(categoryId) : product.categoryId,
      price: price ? parseFloat(price) : product.price,
      oldPrice: oldPrice !== undefined ? (oldPrice ? parseFloat(oldPrice) : null) : product.oldPrice,
      sku: sku !== undefined ? sku : product.sku,
      stock: stock !== undefined ? parseInt(stock) : product.stock,
      unit: unit !== undefined && unit !== '' ? unit : product.unit,
      specs: parsedSpecs,
      images,
      badge: badge !== undefined ? badge : product.badge,
      isActive: isActive !== undefined ? (isActive === '1' || isActive === 'true' || isActive === true) : product.isActive
    });

    await product.reload();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete images
    product.images.forEach(imagePath => {
      const fullPath = path.join(process.cwd(), imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

export default router;
