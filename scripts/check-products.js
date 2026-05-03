import { sequelize, Product, Category } from '../models/index.js';

const checkProducts = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    const products = await Product.findAll();
    console.log(`Total products in database: ${products.length}`);

    const categories = await Category.findAll();
    console.log(`Total categories in database: ${categories.length}`);
    categories.forEach(cat => {
      const count = products.filter(p => p.categoryId === cat.id).length;
      console.log(`- ${cat.name}: ${count} products`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error checking products:', error);
    process.exit(1);
  }
};

checkProducts();
