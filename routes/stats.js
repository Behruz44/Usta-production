import express from 'express';
import { Product, Category } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const [totalProducts, inStockProducts, totalCategories, topProduct] = await Promise.all([
      Product.count({ where: { isActive: true } }),
      Product.count({ where: { isActive: true, stock: { [Op.gt]: 0 } } }),
      Category.count({ where: { isActive: true } }),
      Product.findOne({ 
        where: { isActive: true }, 
        order: [['views', 'DESC']] 
      })
    ]);

    const outOfStockProducts = totalProducts - inStockProducts;

    res.json({
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalCategories,
      topProduct: topProduct ? { 
        id: topProduct.id,
        name: topProduct.name, 
        views: topProduct.views,
        price: topProduct.price,
        images: topProduct.images
      } : null
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
