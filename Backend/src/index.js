const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // For serving uploaded files

// Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/incampus', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
// Remove the deprecated options:
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/incampus');

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Import routes with correct paths
const eventRoutes = require('./routes/eventRoutes'); // Fix: Use relative path
const userRoutes = require('./routes/userRoutes');   // Fix: Use relative path

// Use routes
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    port: PORT 
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'InCampus Backend API',
    version: '1.0.0',
    endpoints: {
      events: '/api/events',
      users: '/api/users',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📅 Events API: http://localhost:${PORT}/api/events`);
  console.log(`👤 Users API: http://localhost:${PORT}/api/users`);
});

module.exports = app;