require('dotenv').config();
const app = require('./app');
const { connectPostgres, sequelize } = require('./config/db');
const connectMongo = require('./config/mongo');
const { startPriceRefreshJob } = require('./modules/pricing/pricing.service');

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectPostgres();
        await connectMongo();

        // alter can drop/rewrite columns — only allow it outside production
        // unless explicitly asked for
        const alter = process.env.NODE_ENV !== 'production' || process.env.DB_SYNC_ALTER === 'true';
        await sequelize.sync({ alter });
        console.log(`✅ Database synced${alter ? ' (alter)' : ''}`);

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`🔍 Health: http://localhost:${PORT}/health`);
        });

        // keep stored product prices in step with the live gold rate
        startPriceRefreshJob();

    } catch (err) {
        console.error('❌ Failed to start:', err.message);
        process.exit(1);
    }
};

start();
