import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameRu: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameKg: {
    type: DataTypes.STRING,
    allowNull: false
  },
  desc: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  descRu: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  descKg: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  oldPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  unit: {
    type: DataTypes.STRING,
    defaultValue: 'шт'
  },
  specs: {
    type: DataTypes.JSON,
    defaultValue: '{}'
  },
  images: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('images');
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val || '[]'); } catch { return []; }
    },
    set(val) {
      this.setDataValue('images', JSON.stringify(val));
    }
  },
  badge: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'products',
  timestamps: true,
  indexes: [
    { fields: ['categoryId'] },
    { fields: ['isActive'] },
    { fields: ['isActive', 'categoryId'] },
    { fields: ['price'] },
    { fields: ['views'] }
  ]
});

export default Product;
