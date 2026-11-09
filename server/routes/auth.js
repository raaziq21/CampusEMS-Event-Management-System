/**
 * Auth Routes
 * 
 * POST /api/auth/register  — Register a new participant
 * POST /api/auth/login     — Login with email + password
 * GET  /api/auth/me        — Get current authenticated user
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { registerRules, loginRules } = require('../validators');

router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
