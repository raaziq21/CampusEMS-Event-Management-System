/**
 * User Routes
 * 
 * GET    /api/users/profile/me       — Get own profile (authenticated)
 * PUT    /api/users/profile/me       — Update own profile (authenticated)
 * GET    /api/users/stats/dashboard  — Dashboard statistics (admin)
 * GET    /api/users                  — List all users (admin)
 * GET    /api/users/:id              — Get user by ID (admin)
 * PUT    /api/users/:id/role         — Update user role (admin)
 * DELETE /api/users/:id              — Delete user (admin)
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { updateRoleRules, updateProfileRules, mongoIdParam } = require('../validators');

// All user routes require authentication
router.use(auth);

// Profile routes (any authenticated user)
router.get('/profile/me', userController.getMyProfile);
router.put('/profile/me', updateProfileRules, userController.updateMyProfile);
router.put('/profile/password', userController.changePassword);

// Dashboard stats (admin only)
router.get('/stats/dashboard', authorize('admin'), userController.getDashboardStats);

// Admin user management
router.get('/', authorize('admin'), userController.getUsers);
router.get('/:id', authorize('admin'), mongoIdParam, userController.getUserById);
router.put('/:id/role', authorize('admin'), updateRoleRules, userController.updateUserRole);
router.delete('/:id', authorize('admin'), mongoIdParam, userController.deleteUser);

module.exports = router;
