/**
 * Validation Middleware
 * 
 * Uses express-validator to validate request bodies.
 * Each export is an array of validation rules that can be used as route middleware.
 */

const { body, param, query, validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Middleware to check validation results.
 * Place this AFTER the validation rules in the middleware chain.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));
    return next(ApiError.badRequest('Validation failed', formattedErrors));
  }
  next();
};

// ------------------------------------------
// Auth Validators
// ------------------------------------------

const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional()
    .trim(),
  validate
];

const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

// ------------------------------------------
// Event Validators
// ------------------------------------------

const createEventRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10–5000 characters'),
  body('date')
    .notEmpty().withMessage('Event date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required')
    .isLength({ max: 300 }).withMessage('Location cannot exceed 300 characters'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .isIn(['conference', 'workshop', 'seminar', 'webinar', 'hackathon', 'cultural', 'sports', 'social', 'academic', 'other'])
    .withMessage('Invalid category'),
  body('capacity')
    .notEmpty().withMessage('Capacity is required')
    .isInt({ min: 1, max: 100000 }).withMessage('Capacity must be between 1 and 100,000'),
  body('image')
    .optional()
    .trim()
    .isURL().withMessage('Image must be a valid URL'),
  body('organizer')
    .optional({ nullable: true })
    .isMongoId().withMessage('Organizer must be a valid ID'),
  validate
];

const updateEventRules = [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Title must be 3–200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10–5000 characters'),
  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 date'),
  body('endDate')
    .optional({ nullable: true })
    .isISO8601().withMessage('End date must be a valid ISO 8601 date'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location cannot exceed 300 characters'),
  body('category')
    .optional()
    .trim()
    .isIn(['conference', 'workshop', 'seminar', 'webinar', 'hackathon', 'cultural', 'sports', 'social', 'academic', 'other'])
    .withMessage('Invalid category'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 100000 }).withMessage('Capacity must be between 1 and 100,000'),
  body('status')
    .optional()
    .isIn(['upcoming', 'ongoing', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('image')
    .optional()
    .trim(),
  body('organizer')
    .optional({ nullable: true })
    .isMongoId().withMessage('Organizer must be a valid ID'),
  validate
];

// ------------------------------------------
// Registration Validators
// ------------------------------------------

const registerForEventRules = [
  body('eventId')
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Invalid event ID'),
  validate
];

const cancelRegistrationRules = [
  param('id').isMongoId().withMessage('Invalid registration ID'),
  validate
];

// ------------------------------------------
// User Validators
// ------------------------------------------

const updateRoleRules = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['admin', 'organizer', 'participant']).withMessage('Role must be admin, organizer, or participant'),
  validate
];

const updateProfileRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),
  body('phone')
    .optional()
    .trim(),
  validate
];

const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID'),
  validate
];

const assignOrganizerRules = [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('organizerId')
    .optional({ nullable: true })
    .isMongoId().withMessage('Organizer ID must be a valid ID'),
  validate
];

module.exports = {
  registerRules,
  loginRules,
  createEventRules,
  updateEventRules,
  registerForEventRules,
  cancelRegistrationRules,
  updateRoleRules,
  updateProfileRules,
  mongoIdParam,
  assignOrganizerRules
};
