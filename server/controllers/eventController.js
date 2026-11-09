/**
 * Event Controller
 * 
 * Handles all event-related business logic:
 * - CRUD operations for events
 * - Organizer assignment
 * - Filtering, searching, and pagination
 */

const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * GET /api/events
 * Get all events with optional filtering, searching, sorting, and pagination.
 * Public access.
 */
const getEvents = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      status,
      category,
      search,
      organizer,
      sort = '-date',
      upcoming
    } = req.query;

    // Build filter object
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (organizer) {
      filter.organizer = organizer;
    }

    // Show only upcoming events (date >= now)
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ['upcoming', 'ongoing'] };
    }

    // Text search on title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? -1 : 1;
    sortObj[sortField] = sortOrder;

    // Execute query
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name email')
        .populate('createdBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Event.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Events retrieved successfully', {
      events,
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

/**
 * GET /api/events/:id
 * Get a single event by ID.
 * Public access.
 */
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('createdBy', 'name email');

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    sendSuccess(res, 200, 'Event retrieved successfully', { event });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/events
 * Create a new event.
 * Admin only.
 */
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      endDate,
      location,
      category,
      capacity,
      image,
      organizer
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      endDate: endDate || null,
      location,
      category,
      capacity,
      image: image || undefined, // Let the model default handle empty values
      organizer: req.user.role === 'organizer' ? req.user._id : (organizer || null),
      createdBy: req.user._id
    });

    // Populate references before returning
    await event.populate('organizer', 'name email');
    await event.populate('createdBy', 'name email');

    sendSuccess(res, 201, 'Event created successfully', { event });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/events/:id
 * Update an event.
 * Admin: can update all fields.
 * Organizer: can only update events assigned to them, and only specific fields.
 */
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    // Organizer authorization: can only edit their assigned events
    if (req.user.role === 'organizer') {
      if (!event.organizer || event.organizer.toString() !== req.user._id.toString()) {
        throw ApiError.forbidden('You can only edit events assigned to you');
      }

      // Organizers can update permitted event fields
      const allowedFields = ['title', 'description', 'date', 'endDate', 'location', 'category', 'capacity', 'status', 'image'];
      const updateData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      )
        .populate('organizer', 'name email')
        .populate('createdBy', 'name email');

      return sendSuccess(res, 200, 'Event updated successfully', { event: updatedEvent });
    }

    // Admin: can update all fields
    const {
      title,
      description,
      date,
      endDate,
      location,
      category,
      capacity,
      status,
      image,
      organizer
    } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = date;
    if (endDate !== undefined) updateData.endDate = endDate;
    if (location !== undefined) updateData.location = location;
    if (category !== undefined) updateData.category = category;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;
    if (image !== undefined) updateData.image = image;
    if (organizer !== undefined) updateData.organizer = organizer || null;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('organizer', 'name email')
      .populate('createdBy', 'name email');

    sendSuccess(res, 200, 'Event updated successfully', { event: updatedEvent });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/events/:id
 * Delete an event and all its registrations.
 * Admin only.
 */
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    // Delete all registrations for this event
    await Registration.deleteMany({ event: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, 'Event and associated registrations deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/events/:id/assign
 * Assign an organizer to an event.
 * Admin only.
 */
const assignOrganizer = async (req, res, next) => {
  try {
    const { organizerId } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      throw ApiError.notFound('Event not found');
    }

    if (organizerId) {
      // Verify the user exists and has the organizer role
      const User = require('../models/User');
      const organizer = await User.findById(organizerId);
      if (!organizer) {
        throw ApiError.notFound('Organizer user not found');
      }
      if (organizer.role !== 'organizer') {
        throw ApiError.badRequest('The specified user is not an organizer');
      }
    }

    event.organizer = organizerId || null;
    await event.save();

    await event.populate('organizer', 'name email');
    await event.populate('createdBy', 'name email');

    sendSuccess(res, 200, organizerId ? 'Organizer assigned successfully' : 'Organizer removed successfully', { event });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  assignOrganizer
};
