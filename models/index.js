import sequelize from '../config/database.js';
import User from './User.js';
import Category from './Category.js';
import Product from './Product.js';
import Order from './Order.js';

// Set up relationships
Category.hasMany(Category, { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Category, Product, Order };
