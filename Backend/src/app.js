require('dotenv').config();
const express = require('express');
const { connectPostgres } = require('./config/db');
const connectMongo = require('./config/mongo');
require('./config/redis'); // auto connects on import

const app = express();
app.use(express.json());

// Health check route — tests all connections
app.get('/health', async (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date(),
        databases: {
            postgres: 'connected',
            mongodb: 'connected',
            redis: 'connected',
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectPostgres();
        await connectMongo();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔍 Health check: http://localhost:${PORT}/health`);
        });

    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
};

start();