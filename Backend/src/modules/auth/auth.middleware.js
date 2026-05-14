const jwt = require('jsonwebtoken');
const redis = require('../../config/redis');
const User = require('../users/user.model');

const protect = async (req, res, next) => {
    try {

        // 1. get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1]; // "Bearer TOKEN"

        // 2. check if token is blacklisted (logged out)
        const isBlacklisted = await redis.get(`blacklist:${token}`);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token is no longer valid. Please login again.',
            });
        }

        // 3. verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. check user still exists
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password_hash'] }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User no longer exists.',
            });
        }

        // 5. attach user to request
        req.user = user;
        next();

    } catch (err) {
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─── Admin only middleware ────────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admins only.',
        });
    }
    next();
};

module.exports = { protect, adminOnly };