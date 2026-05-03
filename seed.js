import sequelize from './config/database.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync({ force: false });
    console.log('Database synchronized.');

    // Check if admin user exists
    const adminUser = await User.findOne({ where: { username: 'admin' } });

    if (!adminUser) {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSWORD) {
        throw new Error('ADMIN_PASSWORD env variable is required in production');
      }
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      await User.create({
        name: 'Admin',
        username: 'admin',
        email: 'admin@usta.kg',
        phone: '+996312000000',
        password: hashedPassword,
        role: 'super_admin'
      });
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Unable to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
