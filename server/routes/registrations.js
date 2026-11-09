/**
 * Registration Routes
 * 
 * POST   /api/registrations              — Register for an event (participant)
 * GET    /api/registrations/my           — Get current user's registrations (authenticated)
 * GET    /api/registrations              — Get all registrations (admin)
 * GET    /api/registrations/event/:eventId — Get registrations for an event (admin/organizer)
 * PUT    /api/registrations/:id/cancel   — Cancel a registration (owner)
 */

const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { registerForEventRules, cancelRegistrationRules } = require('../validators');

// All registration routes require authentication
router.use(auth);

// Participant routes
router.post('/', authorize('participant'), registerForEventRules, registrationController.registerForEvent);
router.get('/my', registrationController.getMyRegistrations);
router.put('/:id/cancel', authorize('participant'), cancelRegistrationRules, registrationController.cancelRegistration);

// Admin/Organizer routes
router.get('/', authorize('admin'), registrationController.getAllRegistrations);
router.get('/event/:eventId', authorize('admin', 'organizer'), registrationController.getEventRegistrations);

module.exports = router;
