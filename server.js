import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import statsRoutes from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Validate JWT_SECRET
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change_this')) {
  console.error('ERROR: JWT_SECRET must be set to a secure value in .env file');
  process.exit(1);
}
if (!process.env.JWT_REFRESH_SECRET || process.env.JWT_REFRESH_SECRET.includes('change_this')) {
  console.error('ERROR: JWT_REFRESH_SECRET must be set to a secure value in .env file');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : process.env.NODE_ENV === 'production'
    ? ['https://usta.kg', 'https://www.usta.kg', 'https://admin.usta.kg']
    : ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:4173', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3002'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') {
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : 0,
  fallthrough: true
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, next) => {
  if (err?.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS origin denied' });
  }
  next(err);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve built frontend (production only)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));

  app.use((req, res, next) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
      next();
    }
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'USTA Backend API', version: '1.0.0' });
  });
}

app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err);
  res.status(err.status || 500).json({ error: err.publicMessage || 'Internal server error' });
});

// Sync database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    await sequelize.sync();
    console.log('Database synchronized.');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();
