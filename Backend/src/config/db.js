const { Sequelize } = require('sequelize');

const options = {
    dialect: 'postgres',
    logging: false,
};

// Hosted Postgres (Neon, Supabase, Render) gives one connection string and
// requires SSL; local development uses the individual PG_* variables
const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        ...options,
        dialectOptions: {
            ssl: process.env.PG_SSL === 'false'
                ? false
                : { require: true, rejectUnauthorized: false },
        },
    })
    : new Sequelize(
        process.env.PG_DB,
        process.env.PG_USER,
        process.env.PG_PASSWORD,
        {
            ...options,
            host: process.env.PG_HOST,
            port: process.env.PG_PORT,
        }
    );

const connectPostgres = async () => {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');
};

module.exports = { sequelize, connectPostgres };
