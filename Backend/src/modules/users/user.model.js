const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING(15),
        unique: true,
        allowNull: false,
    },
    password_hash: {          // stores ONLY hashed password
        type: DataTypes.STRING,
        allowNull: true,      // null for OTP-only users
    },
    role: {
        type: DataTypes.ENUM('customer', 'admin'),
        defaultValue: 'customer',
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'users',
    timestamps: true,
});

module.exports = User;