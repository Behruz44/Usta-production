import { sequelize, Category } from '../models/index.js';

const addCategory = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Check if category already exists
    const existing = await Category.findOne({ where: { name: 'Утеплители' } });
    if (existing) {
      console.log('Category Утеплители already exists');
    } else {
      await Category.create({
        name: 'Утеплители',
        nameRu: 'Утеплители',
        nameKg: 'Жылулоочу',
        desc: 'Теплоизоляционные материалы для стен и перекрытий'
      });
      console.log('Category Утеплители created successfully');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding category:', error);
    process.exit(1);
  }
};

addCategory();
