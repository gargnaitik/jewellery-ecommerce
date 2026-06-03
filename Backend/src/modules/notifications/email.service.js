const nodemailer = require('nodemailer');

// ─── Create transporter ───────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,   // true for port 465
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// ─── Verify connection ────────────────────────────────
transporter.verify((err, success) => {
    if (err) console.error('❌ Email service error:', err.message);
    else console.log('✅ Email service ready');
});

// ─── Send raw email ───────────────────────────────────
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
            text,
        });
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (err) {
        console.error(`❌ Email failed to ${to}:`, err.message);
        // don't throw — notifications should never crash the app
    }
};

// ─── Welcome email ────────────────────────────────────
const sendWelcomeEmail = async ({ name, email }) => {
    await sendEmail({
        to: email,
        subject: '💍 Welcome to Jewellery Store!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #b8860b;">Welcome, ${name}! 💍</h2>
                <p>Thank you for joining our jewellery family.</p>
                <p>Explore our exclusive collection of 22K and 18K gold jewellery crafted with love.</p>
                <a href="${process.env.FRONTEND_URL}/products"
                   style="background: #b8860b; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                   Shop Now
                </a>
                <p style="color: #888; margin-top: 32px; font-size: 12px;">
                    Jewellery Store — BIS Hallmarked, IGI Certified
                </p>
            </div>
        `,
    });
};

// ─── Order confirmation email ─────────────────────────
const sendOrderConfirmationEmail = async ({ name, email, order }) => {

    // build items table rows
    const itemRows = order.items?.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
                ${item.product_snapshot?.name}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
                ₹${Number(item.item_total).toLocaleString('en-IN')}
            </td>
        </tr>
    `).join('');

    await sendEmail({
        to: email,
        subject: `✅ Order Confirmed — #${order.id.slice(0, 8).toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

                <h2 style="color: #b8860b;">Order Confirmed! 🎉</h2>
                <p>Hi ${name}, your order has been placed successfully.</p>

                <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                    <p><strong>Status:</strong> ${order.status}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background: #b8860b; color: white;">
                            <th style="padding: 10px; text-align: left;">Product</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>${itemRows}</tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                            <td style="padding: 8px; text-align: right;">₹${Number(order.subtotal).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td colspan="2" style="padding: 8px; text-align: right;">GST (3%):</td>
                            <td style="padding: 8px; text-align: right;">₹${Number(order.gst_amount).toLocaleString('en-IN')}</td>
                        </tr>
                        <tr style="font-size: 18px; color: #b8860b;">
                            <td colspan="2" style="padding: 8px; text-align: right;"><strong>Total:</strong></td>
                            <td style="padding: 8px; text-align: right;"><strong>₹${Number(order.total_amount).toLocaleString('en-IN')}</strong></td>
                        </tr>
                    </tfoot>
                </table>

                <div style="background: #f9f9f9; padding: 16px; border-radius: 8px;">
                    <h4>Shipping To:</h4>
                    <p>
                        ${order.shipping_address?.name}<br/>
                        ${order.shipping_address?.street}<br/>
                        ${order.shipping_address?.city}, ${order.shipping_address?.state}<br/>
                        ${order.shipping_address?.pincode}
                    </p>
                </div>

                <p style="color: #888; margin-top: 32px; font-size: 12px;">
                    Questions? Reply to this email or call us at 1800-XXX-XXXX
                </p>
            </div>
        `,
    });
};

// ─── Order shipped email ──────────────────────────────
const sendOrderShippedEmail = async ({ name, email, order }) => {
    await sendEmail({
        to: email,
        subject: `🚚 Your order is on the way! — #${order.id.slice(0, 8).toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #b8860b;">Your order is shipped! 🚚</h2>
                <p>Hi ${name}, your jewellery is on its way to you.</p>

                <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
                    <p><strong>Tracking Number:</strong> ${order.tracking_number || 'Will be updated soon'}</p>
                    <p><strong>Estimated Delivery:</strong> ${order.estimated_delivery
                ? new Date(order.estimated_delivery).toLocaleDateString('en-IN')
                : '3-5 business days'
            }</p>
                </div>

                <p>Your precious jewellery is packed securely and handed over to our delivery partner.</p>

                <p style="color: #888; margin-top: 32px; font-size: 12px;">
                    Jewellery Store — Delivering happiness since 2020
                </p>
            </div>
        `,
    });
};
// ─── Order delivered + feedback email ─────────────────
const sendOrderDeliveredEmail = async ({ name, email, order }) => {
    await sendEmail({
        to: email,
        subject: `💍 Your order is delivered! Share your experience — #${order.id.slice(0, 8).toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

                <h2 style="color: #b8860b;">Your jewellery has arrived! 💍</h2>
                <p>Hi ${name}, your order #${order.id.slice(0, 8).toUpperCase()} has been delivered.</p>
                <p>We hope you are absolutely in love with your new jewellery!</p>

                <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
                    <p><strong>Delivered On:</strong> ${new Date(order.delivered_at).toLocaleDateString('en-IN')}</p>
                </div>

                <!-- Star rating section -->
                <div style="text-align: center; margin: 24px 0;">
                    <h3 style="color: #333;">How would you rate your experience?</h3>
                    <div style="margin: 16px 0;">
                        <a href="${process.env.FRONTEND_URL}/review/${order.id}?rating=5"
                           style="font-size: 28px; text-decoration: none;">⭐⭐⭐⭐⭐</a>
                    </div>
                    <div style="display: flex; justify-content: center; gap: 8px; margin: 16px 0;">
                        <a href="${process.env.FRONTEND_URL}/review/${order.id}?rating=1"
                           style="background: #f9f9f9; border: 1px solid #ddd; padding: 8px 12px;
                                  text-decoration: none; color: #333; border-radius: 4px;">1 ⭐</a>
                        <a href="${process.env.FRONTEND_URL}/review/${order.id}?rating=2"
                           style="background: #f9f9f9; border: 1px solid #ddd; padding: 8px 12px;
                                  text-decoration: none; color: #333; border-radius: 4px;">2 ⭐</a>
                        <a href="${process.env.FRONTEND_URL}/review/${order.id}?rating=3"
                           style="background: #f9f9f9; border: 1px solid #ddd; padding: 8px 12px;
                                  text-decoration: none; color: #333; border-radius: 4px;">3 ⭐</a>
                        <a href="${process.env.FRONTEND_URL}/review/${order.id}?rating=4"
                           style="background: #f9f9f9; border: 1px solid #ddd; padding: 8px 12px;
                                  text-decoration: none; color: #333; border-radius: 4px;">4 ⭐</a>
                        <a href="${process.env.FRONTEND_URL}/review/${order.id}?rating=5"
                           style="background: #b8860b; color: white; padding: 8px 12px;
                                  text-decoration: none; border-radius: 4px;">5 ⭐</a>
                    </div>

                    <a href="${process.env.FRONTEND_URL}/review/${order.id}"
                       style="background: #b8860b; color: white; padding: 12px 28px;
                              text-decoration: none; border-radius: 4px;
                              display: inline-block; margin-top: 8px;">
                        Write a Review
                    </a>
                </div>

                <!-- Items purchased -->
                <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <h4 style="margin: 0 0 12px;">Items you received:</h4>
                    ${order.items?.map(item => `
                        <div style="display: flex; align-items: center; margin-bottom: 8px;">
                            <div>
                                <p style="margin: 0; font-weight: bold;">
                                    ${item.product_snapshot?.name}
                                </p>
                                <p style="margin: 0; color: #888; font-size: 12px;">
                                    ${item.product_snapshot?.karat}K |
                                    ${item.product_snapshot?.net_weight}g |
                                    Qty: ${item.quantity}
                                </p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Care tips -->
                <div style="border-left: 4px solid #b8860b; padding: 12px 16px; margin: 16px 0;">
                    <h4 style="margin: 0 0 8px; color: #b8860b;">💡 Jewellery Care Tips</h4>
                    <ul style="margin: 0; padding-left: 16px; color: #555;">
                        <li>Store in a cool, dry place away from sunlight</li>
                        <li>Clean with a soft cloth after wearing</li>
                        <li>Avoid contact with perfumes and chemicals</li>
                        <li>Visit us annually for professional cleaning</li>
                    </ul>
                </div>

                <!-- Social share -->
                <div style="text-align: center; margin: 24px 0;">
                    <p style="color: #555;">Love your jewellery? Share it with the world!</p>
                    <a href="https://instagram.com"
                       style="background: #E1306C; color: white; padding: 10px 20px;
                              text-decoration: none; border-radius: 4px; margin: 4px;
                              display: inline-block;">
                        📸 Share on Instagram
                    </a>
                </div>

                <p style="color: #888; margin-top: 32px; font-size: 12px; text-align: center;">
                    Questions? Contact us at support@jewellery.com or call 1800-XXX-XXXX<br/>
                    Jewellery Store — BIS Hallmarked, IGI Certified
                </p>
            </div>
        `,
    });
};

// ─── Payment failed email ─────────────────────────────
const sendPaymentFailedEmail = async ({ name, email, order }) => {
    await sendEmail({
        to: email,
        subject: `❌ Payment failed — Order #${order.id.slice(0, 8).toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #dc3545;">Payment Failed</h2>
                <p>Hi ${name}, your payment could not be processed.</p>
                <p>Your order is still saved. Please retry your payment.</p>

                <a href="${process.env.FRONTEND_URL}/orders/${order.id}/pay"
                   style="background: #b8860b; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 4px; display: inline-block;">
                   Retry Payment
                </a>

                <p style="color: #888; margin-top: 32px; font-size: 12px;">
                    Need help? Contact us at support@jewellery.com
                </p>
            </div>
        `,
    });
};

const sendOrderCancelledEmail = async ({ name, email, order }) => {
    await sendEmail({
        to: email,
        subject: `❌ Order Cancelled — #${order.id.slice(0, 8).toUpperCase()}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">

                <h2 style="color: #dc3545;">Order Cancelled</h2>
                <p>Hi ${name}, your order has been cancelled.</p>

                <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Order ID:</strong> #${order.id.slice(0, 8).toUpperCase()}</p>
                    <p><strong>Cancelled On:</strong> ${new Date(order.cancelled_at).toLocaleDateString('en-IN')}</p>
                    ${order.cancel_reason ? `<p><strong>Reason:</strong> ${order.cancel_reason}</p>` : ''}
                </div>

                <!-- Refund info -->
                <div style="border-left: 4px solid #b8860b; padding: 12px 16px; margin: 16px 0;">
                    <h4 style="margin: 0 0 8px; color: #b8860b;">💰 Refund Information</h4>
                    <p style="margin: 0; color: #555;">
                        If payment was made, your refund of
                        <strong>₹${Number(order.total_amount).toLocaleString('en-IN')}</strong>
                        will be processed within 5-7 business days to your original payment method.
                    </p>
                </div>

                <!-- Shop again -->
                <div style="text-align: center; margin: 24px 0;">
                    <p>We hope to see you again soon!</p>
                    <a href="${process.env.FRONTEND_URL}/products"
                       style="background: #b8860b; color: white; padding: 12px 28px;
                              text-decoration: none; border-radius: 4px;
                              display: inline-block;">
                        Continue Shopping
                    </a>
                </div>

                <p style="color: #888; margin-top: 32px; font-size: 12px; text-align: center;">
                    Questions? Contact us at support@jewellery.com or call 1800-XXX-XXXX
                </p>
            </div>
        `,
    });
};

// ─── Forgot Password OTP email ────────────────────────
const sendForgotPasswordOTPEmail = async ({ name, email, otp }) => {
    await sendEmail({
        to: email,
        subject: '🔐 Your Password Reset OTP — Jewellery Store',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">

                <!-- Header -->
                <div style="background: linear-gradient(135deg, #b8860b, #d4a017); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: 1px;">💍 Jewellery Store</h1>
                    <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Kanakam Fine Jewellery</p>
                </div>

                <!-- Body -->
                <div style="padding: 40px 32px;">
                    <h2 style="color: #333; margin: 0 0 8px;">Password Reset Request</h2>
                    <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                        Hi ${name || 'there'}, we received a request to reset your password.
                        Use the OTP below to continue. It is valid for <strong>10 minutes</strong>.
                    </p>

                    <!-- OTP Box -->
                    <div style="background: #faf6ef; border: 2px dashed #b8860b; border-radius: 10px;
                                padding: 28px; text-align: center; margin: 0 0 28px;">
                        <p style="color: #888; font-size: 13px; margin: 0 0 12px; letter-spacing: 1px; text-transform: uppercase;">
                            Your One-Time Password
                        </p>
                        <div style="font-size: 42px; font-weight: bold; letter-spacing: 10px; color: #b8860b;">
                            ${otp}
                        </div>
                        <p style="color: #999; font-size: 12px; margin: 12px 0 0;">
                            ⏱ Expires in 10 minutes
                        </p>
                    </div>

                    <!-- Warning -->
                    <div style="background: #fff8e1; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 4px; margin-bottom: 28px;">
                        <p style="margin: 0; color: #7a5c00; font-size: 13px;">
                            🔒 If you did not request this, please ignore this email. Your account remains secure.
                        </p>
                    </div>

                    <p style="color: #555; font-size: 14px; line-height: 1.6;">
                        Need help? Contact us at
                        <a href="mailto:support@jewellery.com" style="color: #b8860b;">support@jewellery.com</a>
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f9f9f9; padding: 16px 32px; text-align: center; border-radius: 0 0 8px 8px;">
                    <p style="color: #aaa; font-size: 12px; margin: 0;">
                        Jewellery Store — BIS Hallmarked, IGI Certified<br/>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </div>
        `,
        text: `Your password reset OTP is: ${otp}\nIt expires in 10 minutes.\nIf you did not request this, ignore this email.`,
    });
};

module.exports = {
    sendWelcomeEmail,
    sendOrderConfirmationEmail,
    sendOrderShippedEmail,
    sendOrderDeliveredEmail,
    sendOrderCancelledEmail,
    sendPaymentFailedEmail,
    sendForgotPasswordOTPEmail,
};