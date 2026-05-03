import express from 'express';
import { Category, Product } from '../models/index.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { isActive: true },
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false
        },
        {
          model: Product,
          as: 'products',
          where: { isActive: true },
          required: false,
          attributes: ['id']
        }
      ],
      order: [['order', 'ASC'], ['name', 'ASC']]
    });

    // Add product count to each category
    const categoriesWithCount = categories.map(cat => ({
      ...cat.toJSON(),
      count: cat.products ? cat.products.length : 0
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// GET /api/categories/:id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: { isActive: true },
          required: false
        },
        {
          model: Product,
          as: 'products',
          where: { isActive: true },
          required: false
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// POST /api/categories (admin only)
router.post('/', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const { name, nameRu, nameKg, icon, desc, descRu, descKg, parentId, order } = req.body;

    if (!name || !nameRu || !nameKg) {
      return res.status(400).json({ error: 'Name in all languages is required' });
    }

    const category = await Category.create({
      name,
      nameRu,
      nameKg,
      icon,
      desc,
      descRu,
      descKg,
      parentId: parentId || null,
      order: order || 0
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// PUT /api/categories/:id (admin only)
router.put('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const { name, nameRu, nameKg, icon, desc, descRu, descKg, parentId, order, isActive } = req.body;

    await category.update({
      name: name !== undefined && name !== '' ? name : category.name,
      nameRu: nameRu !== undefined && nameRu !== '' ? nameRu : category.nameRu,
      nameKg: nameKg !== undefined && nameKg !== '' ? nameKg : category.nameKg,
      icon: icon !== undefined ? icon : category.icon,
      desc: desc !== undefined ? desc : category.desc,
      descRu: descRu !== undefined ? descRu : category.descRu,
      descKg: descKg !== undefined ? descKg : category.descKg,
      parentId: parentId !== undefined ? parentId : category.parentId,
      order: order !== undefined ? order : category.order,
      isActive: isActive !== undefined ? isActive : category.isActive
    });

    await category.reload();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

// DELETE /api/categories/:id (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('super_admin', 'admin'), async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.count({ where: { categoryId: req.params.id } });
    if (productCount > 0) {
      return res.status(400).json({ error: 'Cannot delete category with products' });
    }

    await category.destroy();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message });
  }
});

export default router;

