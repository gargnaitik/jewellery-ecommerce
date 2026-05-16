const paymentService = require('./payment.service');

// POST /api/payments/initiate
const initiatePayment = async (req, res) => {
    try {
        const { order_id } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: 'order_id is required',
            });
        }

        const data = await paymentService.initiatePayment(
            order_id,
            req.user.id
        );

        res.status(200).json({
            success: true,
            message: 'Payment initiated',
            data,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'razorpay_order_id, razorpay_payment_id and razorpay_signature are required',
            });
        }

        const result = await paymentService.verifyPayment({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId: order_id,
        });

        res.status(200).json({
            success: true,
            data: result,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/payments/refund
const refundPayment = async (req, res) => {
    try {
        const { order_id, amount } = req.body;

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: 'order_id is required',
            });
        }

        const result = await paymentService.refundPayment(order_id, amount);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET /api/payments/:orderId
const getPayment = async (req, res) => {
    try {
        const payment = await paymentService.getPaymentByOrderId(
            req.params.orderId
        );
        res.status(200).json({ success: true, data: payment });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

module.exports = {
    initiatePayment,
    verifyPayment,
    refundPayment,
    getPayment,
};