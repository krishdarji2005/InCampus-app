require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Environment check
console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
console.log('🔌 MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://incampus-app.vercel.app',
          'https://incampus-gnpr.onrender.com',
          'https://your-frontend-domain.com',
          // Add your actual frontend domains here
        ]
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'http://127.0.0.1:5173'
        ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚫 CORS blocked origin:', origin);
      callback(null, true); // Allow for now, remove in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control'
  ],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.body) {
    console.log('Body keys:', Object.keys(req.body));
  }
  next();
});

// Connect to MongoDB
connectDB();

// Create uploads directory if it doesn't exist
const uploadsPath = path.join(__dirname, '..', 'public', 'uploads');
console.log('📁 Uploads directory:', uploadsPath);

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'InCampus Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT,
    mongodb: process.env.MONGODB_URI ? 'Connected' : 'Not configured'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'InCampus Backend API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      events: '/api/events',
      users: '/api/users',
      profiles: '/api/profile',
      dashboard: '/api/dashboard'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.warn('📍 Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 InCampus Backend Server started!');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: /api/health`);
  console.log(`📅 Events API: /api/events`);
  console.log(`👤 Users API: /api/users`);
  console.log(`📈 Dashboard API: /api/dashboard`);
  console.log(`📁 Static files: /uploads`);
});

module.exports = app;
