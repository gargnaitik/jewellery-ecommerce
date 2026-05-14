const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('./auth.middleware');

// public routes — no token needed
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);

// protected routes — token required
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;