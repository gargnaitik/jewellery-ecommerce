const authService = require('./auth.service');

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters',
            });
        }

        const result = await authService.registerWithEmail({
            name, email, password, phone
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: result,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const result = await authService.loginWithEmail({ email, password });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });

    } catch (err) {
        res.status(401).json({ success: false, message: err.message });
    }
};

// POST /api/auth/send-otp
const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone || phone.length !== 10) {
            return res.status(400).json({
                success: false,
                message: 'Valid 10 digit phone number is required',
            });
        }

        const result = await authService.sendPhoneOTP(phone);

        res.status(200).json({
            success: true,
            message: result.message,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
    try {
        const { phone, otp, name } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone and OTP are required',
            });
        }

        const result = await authService.verifyPhoneOTP({ phone, otp, name });

        res.status(200).json({
            success: true,
            message: result.is_new_user
                ? 'Account created successfully'
                : 'Login successful',
            data: result,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/auth/logout
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        await authService.logout(token, req.user.id);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/auth/me
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user,   // attached by protect middleware
    });
};

module.exports = {
    register,
    login,
    sendOTP,
    verifyOTP,
    logout,
    getMe,
};