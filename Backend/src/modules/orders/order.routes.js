const express = require('express');
const router = express.Router();
const orderController = require('./order.controller');
const { protect, adminOnly } = require('../auth/auth.middleware');

// all order routes require login
router.use(protect);

// user routes
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

// admin routes
router.get('/', adminOnly, orderController.getAllOrders);
router.patch('/:id/status', adminOnly, orderController.updateStatus);

module.exports = router;