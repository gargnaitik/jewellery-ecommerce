const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('./payment.model');
const Order = require('../orders/order.model');

// initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Initiate payment ─────────────────────────────────
const initiatePayment = async (orderId, userId) => {

    // fetch order
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    // verify order belongs to user
    if (order.user_id !== userId) {
        throw new Error('Not authorized');
    }

    // only pending orders can be paid
    if (order.payment_status === 'paid') {
        throw new Error('Order already paid');
    }

    // create Razorpay order
    // amount must be in paise (₹1 = 100 paise)
    const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.total_amount * 100),
        currency: 'INR',
        receipt: `receipt_${orderId}`,
        notes: {
            order_id: orderId,
            user_id: userId,
        },
    });

    // save payment record
    const payment = await Payment.create({
        order_id: orderId,
        razorpay_order_id: razorpayOrder.id,
        amount: order.total_amount,
        currency: 'INR',
        status: 'created',
    });

    // update order with razorpay order id
    await order.update({
        razorpay_order_id: razorpayOrder.id
    });

    return {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,      // in paise
        amount_display: order.total_amount,        // in rupees
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        payment_id: payment.id,

        // prefill for Razorpay checkout UI
        prefill: {
            name: order.shipping_address?.name,
            contact: order.shipping_address?.phone,
        },
    };
};

// ─── Verify payment ───────────────────────────────────
// called after user completes payment on Razorpay UI
const verifyPayment = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
}) => {

    // Step 1 — verify signature
    // Razorpay sends a signature = HMAC of order_id + payment_id
    // You recreate it and compare — if they match, payment is genuine
    const body = razorpay_order_id + '|' + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
        // signature mismatch — payment tampered or fake
        await Payment.update(
            { status: 'failed' },
            { where: { razorpay_order_id } }
        );
        throw new Error('Payment verification failed. Invalid signature.');
    }

    // Step 2 — fetch payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // Step 3 — update payment record
    await Payment.update(
        {
            razorpay_payment_id,
            razorpay_signature,
            status: 'paid',
            method: razorpayPayment.method,
            razorpay_response: razorpayPayment,
        },
        { where: { razorpay_order_id } }
    );

    // Step 4 — update order status
    const order = await Order.findByPk(orderId);
    await order.update({
        payment_status: 'paid',
        payment_method: razorpayPayment.method,
        status: 'confirmed',
    });

    return {
        success: true,
        payment_id: razorpay_payment_id,
        order_id: orderId,
        amount: razorpayPayment.amount / 100, // paise to rupees
        method: razorpayPayment.method,
        message: 'Payment successful',
    };
};

// ─── Refund payment ───────────────────────────────────
const refundPayment = async (orderId, amount) => {

    const payment = await Payment.findOne({ where: { order_id: orderId } });
    if (!payment) throw new Error('Payment not found');
    if (payment.status !== 'paid') throw new Error('Payment not paid yet');

    // amount in paise
    const refundAmount = amount
        ? Math.round(amount * 100)
        : Math.round(payment.amount * 100); // full refund if no amount

    const refund = await razorpay.payments.refund(
        payment.razorpay_payment_id,
        { amount: refundAmount }
    );

    // update payment record
    await payment.update({
        status: 'refunded',
        refund_id: refund.id,
        refund_amount: refundAmount / 100,
        refunded_at: new Date(),
    });

    // update order
    await Order.update(
        { payment_status: 'refunded' },
        { where: { id: orderId } }
    );

    return {
        refund_id: refund.id,
        amount: refundAmount / 100,
        message: 'Refund processed successfully',
    };
};

// ─── Get payment by order ID ──────────────────────────
const getPaymentByOrderId = async (orderId) => {
    const payment = await Payment.findOne({
        where: { order_id: orderId },
        include: [{ model: Order, as: 'order' }],
    });
    if (!payment) throw new Error('Payment not found');
    return payment;
};

module.exports = {
    initiatePayment,
    verifyPayment,
    refundPayment,
    getPaymentByOrderId,
};