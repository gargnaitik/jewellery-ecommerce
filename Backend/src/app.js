// Express app — routes and middleware only.
// Connections and the HTTP listener live in server.js, so tests can
// import the app without touching real databases.
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { sequelize } = require('./config/db');
const redis = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const { rateLimit } = require('./middleware/rateLimit.middleware');

// Route imports
const userRoutes = require('./modules/users/user.routes');
const productRoutes = require('./modules/products/product.routes');
const pricingRoutes = require('./modules/pricing/pricing.routes');
const authRoutes = require('./modules/auth/auth.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const orderRoutes = require('./modules/orders/order.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

// behind Render/Vercel proxies — needed for the real client IP in rate limits
app.set('trust proxy', 1);

app.use(helmet());
app.use(express.json({ limit: '1mb' }));
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// CLIENT_URL can hold several comma-separated origins (e.g. prod + preview)
const allowedOrigins = (process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // allow same-origin / server-to-server requests with no Origin header
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(null, false);
    },
}));

// Routes
// brute-force protection on auth: 20 requests per 15 minutes per IP
app.use('/api/auth', rateLimit({ prefix: 'auth', max: 20, windowSeconds: 900 }), authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check — reports each datastore so uptime monitors can tell what's down
app.get('/health', async (req, res) => {
    const check = async (fn) => {
        try { await fn(); return 'up'; } catch { return 'down'; }
    };

    const [postgres, redisStatus] = await Promise.all([
        check(() => sequelize.authenticate()),
        check(() => redis.ping()),
    ]);
    const services = {
        postgres,
        mongodb: mongoose.connection.readyState === 1 ? 'up' : 'down',
        redis: redisStatus,
    };
    const healthy = Object.values(services).every((s) => s === 'up');

    res.status(healthy ? 200 : 503).json({
        status: healthy ? 'ok' : 'degraded',
        services,
        timestamp: new Date(),
    });
});

// 404 for unknown API routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

app.use(errorHandler);

module.exports = app;
