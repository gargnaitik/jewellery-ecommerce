const axios = require('axios');

// ─── Send raw SMS via MSG91 ───────────────────────────
const sendSMS = async ({ phone, message }) => {
    try {
        if (process.env.NODE_ENV === 'development') {
            console.log(`\n📱 DEV SMS to ${phone}:\n${message}\n`);
            return;
        }

        await axios.post(
            'https://api.msg91.com/api/v2/sendsms',
            {
                sender: process.env.MSG91_SENDER_ID,
                route: '4',       // transactional route
                country: '91',      // India
                sms: [{
                    message,
                    to: [phone],
                }],
            },
            {
                headers: {
                    'authkey': process.env.MSG91_API_KEY,
                    'Content-Type': 'application/json',
                }
            }
        );
        console.log(`✅ SMS sent to ${phone}`);
    } catch (err) {
        console.error(`❌ SMS failed to ${phone}:`, err.message);
        // never throw — SMS failure should not crash the app
    }
};

// ─── Welcome SMS ──────────────────────────────────────
const sendWelcomeSMS = async ({ phone, name }) => {
    await sendSMS({
        phone,
        message: `Hi ${name}! Welcome to Jewellery Store. Explore our exclusive BIS Hallmarked collection. Shop now: ${process.env.FRONTEND_URL}`,
    });
};

// ─── Order confirmation SMS ───────────────────────────
const sendOrderConfirmationSMS = async ({ phone, name, orderId, amount }) => {
    await sendSMS({
        phone,
        message: `Hi ${name}, your order #${orderId.slice(0, 8).toUpperCase()} for ₹${Number(amount).toLocaleString('en-IN')} is confirmed! We will notify you when it ships. - Jewellery Store`,
    });
};

// ─── Order shipped SMS ────────────────────────────────
const sendOrderShippedSMS = async ({ phone, name, orderId, trackingNumber }) => {
    await sendSMS({
        phone,
        message: `Hi ${name}, your order #${orderId.slice(0, 8).toUpperCase()} has been shipped! Tracking: ${trackingNumber || 'Will be updated soon'}. Expected delivery in 3-5 days. - Jewellery Store`,
    });
};

// ─── Order delivered SMS ──────────────────────────────
const sendOrderDeliveredSMS = async ({ phone, name, orderId }) => {
    await sendSMS({
        phone,
        message: `Hi ${name}, your order #${orderId.slice(0, 8).toUpperCase()} has been delivered! We hope you love your jewellery. Share your feedback: ${process.env.FRONTEND_URL}/review - Jewellery Store`,
    });
};

// ─── Payment failed SMS ───────────────────────────────
const sendPaymentFailedSMS = async ({ phone, name, orderId }) => {
    await sendSMS({
        phone,
        message: `Hi ${name}, payment failed for order #${orderId.slice(0, 8).toUpperCase()}. Please retry: ${process.env.FRONTEND_URL}/orders/${orderId}/pay - Jewellery Store`,
    });
};

module.exports = {
    sendWelcomeSMS,
    sendOrderConfirmationSMS,
    sendOrderShippedSMS,
    sendOrderDeliveredSMS,
    sendPaymentFailedSMS,
};