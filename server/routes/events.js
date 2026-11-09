/**
 * Event Routes
 * 
 * GET    /api/events           — List events (public, with filters/pagination)
 * GET    /api/events/:id       — Get single event (public)
 * POST   /api/events           — Create event (admin only)
 * PUT    /api/events/:id       — Update event (admin or assigned organizer)
 * DELETE /api/events/:id       — Delete event (admin only)
 * PUT    /api/events/:id/assign — Assign organizer to event (admin only)
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  createEventRules,
  updateEventRules,
  mongoIdParam,
  assignOrganizerRules
} = require('../validators');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', mongoIdParam, eventController.getEventById);

// Protected routes
router.post('/', auth, authorize('admin', 'organizer'), createEventRules, eventController.createEvent);
router.put('/:id', auth, authorize('admin', 'organizer'), updateEventRules, eventController.updateEvent);
router.delete('/:id', auth, authorize('admin'), mongoIdParam, eventController.deleteEvent);
router.put('/:id/assign', auth, authorize('admin'), assignOrganizerRules, eventController.assignOrganizer);

module.exports = router;
