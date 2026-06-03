const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect, adminOnly } = require('../auth/auth.middleware');

// ALL user routes require login + admin role
router.use(protect, adminOnly);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// ── Role management ──────────────────────────────────
// PATCH /api/users/:id/role   Body: { role: 'admin' | 'user' }
router.patch('/:id/role', userController.updateUserRole);  // ← NEW

module.exports = router;