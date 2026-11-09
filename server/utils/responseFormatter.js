/**
 * Response Formatter Utility
 * 
 * Provides consistent JSON response structure across all API endpoints.
 */

/**
 * Send a success response.
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {Object|Array} data - Response data payload
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send an error response.
 * 
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {Array} errors - Optional detailed error array
 */
const sendError = (res, statusCode = 500, message = 'Internal server error', errors = []) => {
  const response = {
    success: false,
    message
  };

  if (errors.length > 0) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

module.exports = { sendSuccess, sendError };
