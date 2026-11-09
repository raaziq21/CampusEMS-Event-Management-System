/**
 * Event Management System — Express Server Entry Point
 * 
 * Initializes Express, connects to MongoDB, registers middleware and routes,
 * and starts listening for requests.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const { connectDB, disconnectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();

// ------------------------------------
// Core Middleware
// ------------------------------------

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// CORS — allow requests from the frontend origin
app.use(cors({
  origin: config.clientUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ------------------------------------
// API Routes
// ------------------------------------

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/users', userRoutes);

// ------------------------------------
// Static File Serving (Frontend SPA)
// ------------------------------------

// Serve static assets from client directory in all environments
const clientPath = path.join(__dirname, '..', 'client');
app.use(express.static(clientPath));

// Serve index.html for all non-API GET routes (AngularJS SPA routing)
app.get(/^\/(?!api(\/|$)).*/, (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// ------------------------------------
// Error Handling
// ------------------------------------

// Handle 404 — must be after all defined routes
app.use(notFound);

// Global error handler — must be the last middleware
app.use(errorHandler);

// ------------------------------------
// Start Server
// ------------------------------------

const startServer = async () => {
  try {
    // Connect to MongoDB
    let dbConnected = false;
    try {
      await connectDB();
      dbConnected = true;
    } catch (dbError) {
      console.error(`\nWARNING: MongoDB connection failed: ${dbError.message}`);
      console.error('The server will start, but database features will not work.');
      console.error('Please set a valid MONGODB_URI in your .env file.\n');
    }

    // Start listening for requests
    const server = app.listen(config.port, () => {
      console.log(`\n========================================`);
      console.log(`  Event Management System API Server`);
      console.log(`========================================`);
      console.log(`  Environment : ${config.nodeEnv}`);
      console.log(`  Port        : ${config.port}`);
      console.log(`  Client URL  : ${config.clientUrl}`);
      console.log(`  Database    : ${dbConnected ? 'Connected' : 'NOT CONNECTED'}`);
      console.log(`========================================\n`);
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await disconnectDB();
        console.log('Server closed.');
        process.exit(0);
      });

      // Force shutdown after 10 seconds if graceful shutdown hangs
      setTimeout(() => {
        console.error('Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
