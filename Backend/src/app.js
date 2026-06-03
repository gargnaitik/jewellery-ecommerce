require('dotenv').config();
const express = require('express');
const { connectPostgres, sequelize } = require('./config/db');
const cors = require('cors');
const connectMongo = require('./config/mongo');
require('./config/redis');

// Route imports
const userRoutes = require('./modules/users/user.routes');
const productRoutes = require('./modules/products/product.routes');
const pricingRoutes = require('./modules/pricing/pricing.routes');
const authRoutes = require('./modules/auth/auth.routes');
const paymentRoutes = require('./modules/payments/payment.routes');
const orderRoutes = require('./modules/orders/order.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();
app.use(express.json());


app.use(cors({
    origin: 'http://localhost:5173'
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectPostgres();
        await connectMongo();

        await sequelize.sync({ alter: true });
        console.log('✅ Database synced');

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔍 Health: http://localhost:${PORT}/health`);
        });

    } catch (err) {
        console.error('❌ Failed to start:', err.message);
        process.exit(1);
    }
};

start();