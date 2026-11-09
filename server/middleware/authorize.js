/**
 * Role-Based Authorization Middleware
 * 
 * Checks whether the authenticated user has one of the allowed roles.
 * Must be used AFTER the auth middleware.
 * 
 * Usage: authorize('admin', 'organizer')
 */

const ApiError = require('../utils/ApiError');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // auth middleware must run first and attach req.user
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized for this action.`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
