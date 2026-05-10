const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.PG_DB,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        dialect: 'postgres',
        logging: false,
    }
);

const connectPostgres = async () => {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected');
};

module.exports = { sequelize, connectPostgres };