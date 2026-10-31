require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');
const { successResponse } = require('./utils/response');
const User = require('./models/User');

const app = express();

// Middleware: CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Middleware: Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Health Endpoint
app.get('/api/health', (req, res) => {
  return successResponse(res, 200, 'SubscriptIQ API is running healthy', {
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Seed default users for instant evaluation & development
const seedDefaultAccounts = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@brightloop.com' });
    if (!adminExists) {
      await User.create({
        name: 'Brightloop Admin',
        email: 'admin@brightloop.com',
        password: 'Admin@12345!',
        role: 'admin',
        isActive: true
      });
      console.log('[Seed] Default Admin account created: admin@brightloop.com / Admin@12345!');
    }

    const staffExists = await User.findOne({ email: 'staff@brightloop.com' });
    if (!staffExists) {
      await User.create({
        name: 'Alex Staff',
        email: 'staff@brightloop.com',
        password: 'Staff@12345!',
        role: 'staff',
        isActive: true
      });
      console.log('[Seed] Default Staff account created: staff@brightloop.com / Staff@12345!');
    }

    const customerExists = await User.findOne({ email: 'customer@brightloop.com' });
    if (!customerExists) {
      await User.create({
        name: 'Acme Corp (Customer)',
        email: 'customer@brightloop.com',
        password: 'Customer@12345!',
        role: 'customer',
        isActive: true
      });
      console.log('[Seed] Default Customer account created: customer@brightloop.com / Customer@12345!');
    }
  } catch (err) {
    console.warn(`[Seed] Warning during initial seed: ${err.message}`);
  }
};

// Route Mounts
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Placeholders for subsequent members' modules with helpful diagnostic info
app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
    return successResponse(res, 200, 'Member 2 Module Hook: Products endpoint ready for implementation', { items: [] });
  }
  next();
});

app.use('/api/plans', (req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
    return successResponse(res, 200, 'Member 2 Module Hook: Plans endpoint ready for implementation', { items: [] });
  }
  next();
});

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let serverInstance = null;

const startServer = async () => {
  await connectDB();
  await seedDefaultAccounts();

  serverInstance = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  SubscriptIQ Backend Server running on port ${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  return serverInstance;
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
