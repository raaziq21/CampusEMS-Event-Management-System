/**
 * Health Check Route
 * 
 * Provides a simple endpoint to verify the server and database are running.
 */

const express = require('express');
const mongoose = require('mongoose');
const { sendSuccess } = require('../utils/responseFormatter');

const router = express.Router();

/**
 * GET /api/health
 * Returns server status and MongoDB connection state.
 */
router.get('/', (req, res) => {
  // Mongoose connection states: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  const dbState = mongoose.connection.readyState;

  sendSuccess(res, 200, 'Server is running', {
    server: 'ok',
    database: dbStates[dbState] || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
