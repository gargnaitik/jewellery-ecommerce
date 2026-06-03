const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const redis = require('../../config/redis');
const User = require('../users/user.model');
const notificationService = require('../notifications/notification.service');
const { sendForgotPasswordOTPEmail } = require('../notifications/email.service');


// ─── Constants ────────────────────────────────────────
const OTP_TTL = 300;   // 5 minutes in seconds
const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 3; // max wrong attempts before lockout

// ─── Generate JWT token ───────────────────────────────
const generateToken = (userId, role) => {
    return jwt.sign(
        { id: userId, role },          // payload
        process.env.JWT_SECRET,        // secret key
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ─── Generate random OTP ──────────────────────────────
const generateOTP = () => {
    return Math.floor(
        100000 + Math.random() * 900000  // always 6 digits
    ).toString();
};

// ─── Send OTP via MSG91 ───────────────────────────────
const sendOTP = async (phone, otp) => {
    try {
        const response = await axios.post(
            'https://api.msg91.com/api/v5/otp',
            {
                template_id: process.env.MSG91_TEMPLATE_ID,
                mobile: `91${phone}`,  // 91 = India country code
                authkey: process.env.MSG91_API_KEY,
                otp,
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        return response.data;
    } catch (err) {
        throw new Error('Failed to send OTP. Please try again.');
    }
};

// ─── REGISTER with email + password ──────────────────
const registerWithEmail = async ({ name, email, password, phone }) => {

    // check existing email
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) throw new Error('Email already registered');

    // check existing phone
    if (phone) {
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) throw new Error('Phone already registered');
    }

    // hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // create user
    const user = await User.create({
        name,
        email,
        phone,
        password_hash,
        is_verified: true,  // email users verified immediately
    });
    await notificationService.notifyUserRegistered(user);
    // generate token
    const token = generateToken(user.id, user.role);

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }
    };
};

// ─── LOGIN with email + password ─────────────────────
const loginWithEmail = async ({ email, password }) => {

    // find user with password
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('Invalid email or password');

    // check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('Invalid email or password');

    // generate token
    const token = generateToken(user.id, user.role);

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }
    };
};

// ─── SEND OTP to phone ────────────────────────────────
const sendPhoneOTP = async (phone) => {

    // check rate limit — max 3 OTP requests per 10 mins
    const rateLimitKey = `otp_limit:${phone}`;
    const attempts = await redis.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 3) {
        throw new Error('Too many OTP requests. Please wait 10 minutes.');
    }

    // generate OTP
    const otp = generateOTP();

    // store OTP in Redis with 5 min TTL
    await redis.setex(`otp:${phone}`, OTP_TTL, otp);

    // store attempt count
    await redis.setex(
        rateLimitKey,
        600,  // 10 minute window
        ((parseInt(attempts) || 0) + 1).toString()
    );

    // send via MSG91
    // in development — skip sending and just log OTP
    if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔐 DEV OTP for ${phone}: ${otp}\n`);
        return { message: 'OTP sent (check terminal in dev mode)' };
    }

    await sendOTP(phone, otp);
    return { message: 'OTP sent successfully' };
};

// ─── VERIFY OTP and login/register ───────────────────
const verifyPhoneOTP = async ({ phone, otp, name }) => {

    // get OTP from Redis
    const storedOTP = await redis.get(`otp:${phone}`);

    if (!storedOTP) {
        throw new Error('OTP expired. Please request a new one.');
    }

    if (storedOTP !== otp.toString()) {

        // track wrong attempts
        const attemptsKey = `otp_attempts:${phone}`;
        const wrongAttempts = await redis.incr(attemptsKey);
        await redis.expire(attemptsKey, OTP_TTL);

        if (wrongAttempts >= MAX_OTP_ATTEMPTS) {
            // delete OTP — force them to request new one
            await redis.del(`otp:${phone}`);
            throw new Error('Too many wrong attempts. Request a new OTP.');
        }

        throw new Error(`Invalid OTP. ${MAX_OTP_ATTEMPTS - wrongAttempts} attempts remaining.`);
    }

    // OTP correct — delete it from Redis immediately
    await redis.del(`otp:${phone}`);
    await redis.del(`otp_attempts:${phone}`);

    // find or create user
    let user = await User.findOne({ where: { phone } });

    if (!user) {
        // new user — register them
        if (!name) throw new Error('Name is required for new users');
        user = await User.create({
            name,
            phone,
            is_verified: true,
        });
    } else {
        // existing user — mark verified
        await user.update({ is_verified: true });
    }

    // generate token
    const token = generateToken(user.id, user.role);

    return {
        token,
        is_new_user: !user,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }
    };
};

// ─── FORGOT PASSWORD — send OTP to email ─────────────
const forgotPasswordOTP = async (email) => {
    // find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
        // don't reveal whether email exists — just silently succeed
        return { message: 'If this email is registered, an OTP has been sent.' };
    }

    // rate limit: max 3 requests per 15 mins per email
    const rateLimitKey = `forgot_limit:${email}`;
    const attempts = await redis.get(rateLimitKey);
    if (attempts && parseInt(attempts) >= 3) {
        throw new Error('Too many requests. Please wait 15 minutes before trying again.');
    }

    // generate OTP
    const otp = generateOTP();
    const OTP_EMAIL_TTL = 600; // 10 minutes

    // store OTP in Redis
    await redis.setex(`forgot_otp:${email}`, OTP_EMAIL_TTL, otp);

    // increment rate limit counter
    await redis.setex(
        rateLimitKey,
        900, // 15 minute window
        ((parseInt(attempts) || 0) + 1).toString()
    );

    // log OTP in development for convenience
    if (process.env.NODE_ENV === 'development') {
        console.log(`\n🔐 DEV FORGOT-PASSWORD OTP for ${email}: ${otp}\n`);
    }

    // send OTP email
    await sendForgotPasswordOTPEmail({ name: user.name, email, otp });
    return { message: 'If this email is registered, an OTP has been sent.' };
};

// ─── RESET PASSWORD — verify OTP + set new password ───
const resetPassword = async ({ email, otp, newPassword }) => {
    // get OTP from Redis
    const storedOTP = await redis.get(`forgot_otp:${email}`);
    if (!storedOTP) {
        throw new Error('OTP expired or not requested. Please request a new OTP.');
    }

    // track wrong attempts
    const attemptsKey = `forgot_otp_attempts:${email}`;

    if (storedOTP !== otp.toString()) {
        const wrongAttempts = await redis.incr(attemptsKey);
        await redis.expire(attemptsKey, 600);

        if (wrongAttempts >= MAX_OTP_ATTEMPTS) {
            await redis.del(`forgot_otp:${email}`);
            throw new Error('Too many wrong attempts. Please request a new OTP.');
        }

        throw new Error(`Invalid OTP. ${MAX_OTP_ATTEMPTS - wrongAttempts} attempts remaining.`);
    }

    // OTP correct — delete it
    await redis.del(`forgot_otp:${email}`);
    await redis.del(attemptsKey);

    // find user
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error('User not found.');

    // hash new password and save
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);
    await user.update({ password_hash });

    return { message: 'Password reset successfully. You can now log in.' };
};

// ─── LOGOUT — blacklist token ─────────────────────────
const logout = async (token, userId) => {
    // store token in blacklist until it expires
    await redis.setex(
        `blacklist:${token}`,
        7 * 24 * 60 * 60,  // 7 days in seconds
        userId
    );
    return { message: 'Logged out successfully' };
};

module.exports = {
    registerWithEmail,
    loginWithEmail,
    sendPhoneOTP,
    verifyPhoneOTP,
    forgotPasswordOTP,
    resetPassword,
    logout,
    generateToken,
};