/**
 * Not Found Middleware
 * 
 * Catches requests to undefined routes and returns a 404 response.
 * Must be registered AFTER all defined routes, but BEFORE the error handler.
 */

const ApiError = require('../utils/ApiError');

const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

module.exports = notFound;
