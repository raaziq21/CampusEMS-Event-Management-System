/**
 * User Controller
 * 
 * Handles user management (admin operations):
 * - List all users
 * - Get user by ID
 * - Update user role
 * - Delete a user
 * - Get dashboard statistics
 */

const bcrypt = require('bcryptjs');
const config = require('../config');
const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ApiError = require('../utils/ApiError');
const { sendSuccess } = require('../utils/responseFormatter');

/**
 * GET /api/users
 * Get all users with optional filtering and pagination.
 * Admin only.
 */
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      User.countDocuments(filter)
    ]);

    sendSuccess(res, 200, 'Users retrieved successfully', {
      users,
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
 * GET /api/users/:id
 * Get a single user by ID.
 * Admin only.
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    sendSuccess(res, 200, 'User retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id/role
 * Update a user's role.
 * Admin only.
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'organizer', 'participant'].includes(role)) {
      throw ApiError.badRequest('Valid role is required (admin, organizer, or participant)');
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      throw ApiError.badRequest('You cannot change your own role');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.role = role;
    await user.save();

    sendSuccess(res, 200, `User role updated to ${role}`, { user });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Delete a user and their associated registrations.
 * Admin only. Cannot delete yourself.
 */
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Delete all registrations by this user
    const registrations = await Registration.find({ user: req.params.id });
    const eventIds = [...new Set(registrations.map((r) => r.event))];

    await Registration.deleteMany({ user: req.params.id });

    // Update registeredCount for affected events
    for (const eventId of eventIds) {
      await Registration.updateEventCount(eventId);
    }

    // If user was an organizer, remove them from assigned events
    if (user.role === 'organizer') {
      await Event.updateMany(
        { organizer: req.params.id },
        { organizer: null }
      );
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    sendSuccess(res, 200, 'User and associated data deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/stats/dashboard
 * Get dashboard statistics.
 * Admin only.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalParticipants,
      totalOrganizers,
      totalAdmins,
      totalEvents,
      upcomingEvents,
      ongoingEvents,
      completedEvents,
      cancelledEvents,
      totalRegistrations,
      confirmedRegistrations,
      capacityAgg
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'participant' }),
      User.countDocuments({ role: 'organizer' }),
      User.countDocuments({ role: 'admin' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'upcoming' }),
      Event.countDocuments({ status: 'ongoing' }),
      Event.countDocuments({ status: 'completed' }),
      Event.countDocuments({ status: 'cancelled' }),
      Registration.countDocuments(),
      Registration.countDocuments({ status: 'confirmed' }),
      Event.aggregate([
        { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } }
      ])
    ]);

    const totalCapacity = capacityAgg.length > 0 ? capacityAgg[0].totalCapacity : 0;
    const utilizationRate = totalCapacity > 0 ? Math.round((confirmedRegistrations / totalCapacity) * 100) : 0;

    // Get recent events
    const recentEvents = await Event.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('organizer', 'name email')
      .lean();

    // Get recent registrations
    const recentRegistrations = await Registration.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name email')
      .populate('event', 'title date')
      .lean();

    sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', {
      stats: {
        users: { total: totalUsers, participants: totalParticipants, organizers: totalOrganizers, admins: totalAdmins },
        events: { total: totalEvents, upcoming: upcomingEvents, ongoing: ongoingEvents, completed: completedEvents, cancelled: cancelledEvents },
        registrations: { total: totalRegistrations, confirmed: confirmedRegistrations },
        capacity: { total: totalCapacity, utilizationRate: utilizationRate }
      },
      recentEvents,
      recentRegistrations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/profile/me
 * Get the current user's profile.
 * Any authenticated user.
 */
const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    sendSuccess(res, 200, 'Profile retrieved successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile/me
 * Update the current user's profile (name, phone).
 * Any authenticated user. Cannot change email or role.
 */
const updateMyProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    sendSuccess(res, 200, 'Profile updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/profile/password
 * Change current user password with old password verification.
 * Any authenticated user.
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      throw ApiError.badRequest('Current password and new password are required');
    }
    if (newPassword.length < 6) {
      throw ApiError.badRequest('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    sendSuccess(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getDashboardStats,
  getMyProfile,
  updateMyProfile,
  changePassword
};
