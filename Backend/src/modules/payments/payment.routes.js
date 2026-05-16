const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { protect, adminOnly } = require('../auth/auth.middleware');

router.use(protect);

router.post('/initiate', paymentController.initiatePayment);
router.post('/verify', paymentController.verifyPayment);
router.get('/:orderId', paymentController.getPayment);

// admin only
router.post('/refund', adminOnly, paymentController.refundPayment);

module.exports = router;