/**
 * Global Error Handling Middleware
 * 
 * Catches all errors thrown in route handlers and middleware,
 * and returns a consistent JSON error response.
 * 
 * This must be registered AFTER all routes in Express.
 */

const config = require('../config');
const { sendError } = require('../utils/responseFormatter');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || [];

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `A record with this ${field} already exists`;
    errors = [{ field, message }];
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
  }

  // Log the error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', {
      statusCode,
      message,
      stack: err.stack
    });
  }

  // In production, don't leak internal error details
  if (config.nodeEnv === 'production' && statusCode === 500) {
    message = 'Internal server error';
    errors = [];
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = errorHandler;
