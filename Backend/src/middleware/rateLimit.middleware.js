// src/middleware/rateLimit.middleware.js
const redis = require('../config/redis');

// Fixed-window rate limiter backed by Redis, so the limit holds across
// multiple server instances. Fails open: if Redis is down, requests pass.
const rateLimit = ({ prefix, max, windowSeconds }) => async (req, res, next) => {
    const key = `rate:${prefix}:${req.ip}`;

    try {
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, windowSeconds);

        res.set('RateLimit-Limit', String(max));
        res.set('RateLimit-Remaining', String(Math.max(0, max - count)));

        if (count > max) {
            const ttl = await redis.ttl(key);
            res.set('Retry-After', String(ttl > 0 ? ttl : windowSeconds));
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.',
            });
        }
    } catch (err) {
        console.error('Rate limiter error:', err.message);
    }

    next();
};

module.exports = { rateLimit };
