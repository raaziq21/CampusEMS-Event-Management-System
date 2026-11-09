/**
 * Registration Controller
 * 
 * Handles event registration logic:
 * - Register for an event
 * - Cancel a registration
 * - View registrations (by user or by event)
 */

const Registration = require('../models/Registration');
const Event = require('../models/Event');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * POST /api/registrations
 * Register the current user for an event.
 * Participant only.
 */
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      throw ApiError.badRequest('Event ID is required');
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    // Check if event is open for registration
    if (event.status === 'completed' || event.status === 'cancelled') {
      throw ApiError.badRequest(`Cannot register for a ${event.status} event`);
    }

    // Check if event is full
    if (event.registeredCount >= event.capacity) {
      throw ApiError.badRequest('This event is full. No more registrations are accepted.');
    }

    // Check for duplicate registration (compound unique index also enforces this)
    const existingRegistration = await Registration.findOne({
      user: req.user._id,
      event: eventId
    });

    if (existingRegistration) {
      if (existingRegistration.status === 'confirmed') {
        throw ApiError.conflict('You are already registered for this event');
      }

      // If previously cancelled, re-confirm the registration
      existingRegistration.status = 'confirmed';
      existingRegistration.registeredAt = new Date();
      await existingRegistration.save();

      await existingRegistration.populate('event', 'title date location status');
      await existingRegistration.populate('user', 'name email');

      return sendSuccess(res, 200, 'Registration re-confirmed successfully', {
        registration: existingRegistration
      });
    }

    // Create new registration
    const registration = await Registration.create({
      user: req.user._id,
      event: eventId
    });

    await registration.populate('event', 'title date location status');
    await registration.populate('user', 'name email');

    sendSuccess(res, 201, 'Successfully registered for event', { registration });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/registrations/:id/cancel
 * Cancel a registration.
 * The registration owner (participant) can cancel their own registration.
 */
const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);

    if (!registration) {
      throw ApiError.notFound('Registration not found');
    }

    // Only the registration owner can cancel
    if (registration.user.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only cancel your own registrations');
    }

    if (registration.status === 'cancelled') {
      throw ApiError.badRequest('This registration is already cancelled');
    }

    // Check if the event is still in a state that allows cancellation
    const event = await Event.findById(registration.event);
    if (event && (event.status === 'completed' || event.status === 'ongoing')) {
      throw ApiError.badRequest(`Cannot cancel registration for an event that is ${event.status}`);
    }

    registration.status = 'cancelled';
    await registration.save();

    await registration.populate('event', 'title date location status');

    sendSuccess(res, 200, 'Registration cancelled successfully', { registration });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/registrations/my
 * Get all registrations for the current user.
 * Participant access.
 */
const getMyRegistrations = async (req, res, next) => {
  try {
    const { status } = req.query;

    const filter = { user: req.user._id };
    if (status) {
      filter.status = status;
    }

    const registrations = await Registration.find(filter)
      .populate({
        path: 'event',
        select: 'title description date endDate location category capacity registeredCount status image',
        populate: { path: 'organizer', select: 'name email' }
      })
      .sort({ registeredAt: -1 });

    sendSuccess(res, 200, 'Registrations retrieved successfully', { registrations });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/registrations/event/:eventId
 * Get all registrations for a specific event.
 * Admin and assigned organizer access.
 */
const getEventRegistrations = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Verify event exists
    const event = await Event.findById(eventId);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    // Organizers can only view registrations for their assigned events
    if (req.user.role === 'organizer') {
      if (!event.organizer || event.organizer.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You can only view registrations for events assigned to you');
      }
    }

    const { status } = req.query;
    const filter = { event: eventId };
    if (status) {
      filter.status = status;
    }

    const registrations = await Registration.find(filter)
      .populate('user', 'name email phone')
      .sort({ registeredAt: -1 });

    sendSuccess(res, 200, 'Event registrations retrieved successfully', {
      event: { _id: event._id, title: event.title },
      registrations,
      total: registrations.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/registrations
 * Get all registrations (admin view).
 * Admin only.
 */
const getAllRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, eventId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (eventId) filter.event = eventId;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [registrations, total] = await Promise.all([
      Registration.find(filter)
        .populate('user', 'name email')
        .populate('event', 'title date status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Registration.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'All registrations retrieved successfully', {
      registrations,
      pagination: {
        current: pageNum,
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getEventRegistrations,
  getAllRegistrations
};
