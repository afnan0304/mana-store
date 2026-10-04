const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { loginSchema } = require('../validators');

const router = express.Router();

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/v1/auth/me
router.get('/me', authenticate, getMe);

module.exports = router;
