import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: process.env.DB_DIALECT || 'postgres',
      logging: false,
      pool: {
        max: Number(process.env.DB_POOL_MAX || 10),
        min: Number(process.env.DB_POOL_MIN || 0),
        acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
        idle: Number(process.env.DB_POOL_IDLE || 10000)
      },
      dialectOptions: process.env.DB_SSL === 'true'
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: process.env.SQLITE_STORAGE || path.join(__dirname, '../usta_db.sqlite'),
      logging: !isProduction && process.env.DB_LOGGING === 'true' ? console.log : false
    });

if (isProduction && !databaseUrl) {
  console.warn('DATABASE_URL is not set. Falling back to SQLite; this is not recommended for production deployments.');
}

export default sequelize;
