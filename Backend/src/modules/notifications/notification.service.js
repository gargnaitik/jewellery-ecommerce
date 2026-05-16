const emailService = require('./email.service');
const smsService = require('./sms.service');

// ─── On user register ─────────────────────────────────
const notifyUserRegistered = async (user) => {
    await Promise.allSettled([
        user.email && emailService.sendWelcomeEmail({
            name: user.name,
            email: user.email,
        }),
        user.phone && smsService.sendWelcomeSMS({
            name: user.name,
            phone: user.phone,
        }),
    ]);
};

// ─── On order placed ──────────────────────────────────
const notifyOrderPlaced = async (user, order) => {
    await Promise.allSettled([
        user.email && emailService.sendOrderConfirmationEmail({
            name: user.name,
            email: user.email,
            order,
        }),
        user.phone && smsService.sendOrderConfirmationSMS({
            name: user.name,
            phone: user.phone,
            orderId: order.id,
            amount: order.total_amount,
        }),
    ]);
};

// ─── On order shipped ─────────────────────────────────
const notifyOrderShipped = async (user, order) => {
    await Promise.allSettled([
        user.email && emailService.sendOrderShippedEmail({
            name: user.name,
            email: user.email,
            order,
        }),
        user.phone && smsService.sendOrderShippedSMS({
            name: user.name,
            phone: user.phone,
            orderId: order.id,
            trackingNumber: order.tracking_number,
        }),
    ]);
};

// ─── On order delivered ───────────────────────────────
const notifyOrderDelivered = async (user, order) => {
    await Promise.allSettled([
        user.phone && smsService.sendOrderDeliveredSMS({
            name: user.name,
            phone: user.phone,
            orderId: order.id,
        }),
    ]);
};

// ─── On payment failed ────────────────────────────────
const notifyPaymentFailed = async (user, order) => {
    await Promise.allSettled([
        user.email && emailService.sendPaymentFailedEmail({
            name: user.name,
            email: user.email,
            order,
        }),
        user.phone && smsService.sendPaymentFailedSMS({
            name: user.name,
            phone: user.phone,
            orderId: order.id,
        }),
    ]);
};

module.exports = {
    notifyUserRegistered,
    notifyOrderPlaced,
    notifyOrderShipped,
    notifyOrderDelivered,
    notifyPaymentFailed,
};