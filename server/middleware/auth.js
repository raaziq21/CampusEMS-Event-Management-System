/**
 * Authentication Middleware
 * 
 * Verifies the JWT token from the Authorization header and
 * attaches the authenticated user to req.user.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const ApiError = require('../utils/ApiError');

const auth = async (req, res, next) => {
  try {
    // Extract token from "Bearer <token>" header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access denied. No token provided.');
    }

    // Verify the token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Find the user (exclude password)
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('User associated with this token no longer exists.');
    }

    // Attach user to request object for downstream use
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error); // Let errorHandler format these
    }
    next(error);
  }
};

module.exports = auth;
