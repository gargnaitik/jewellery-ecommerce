const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const User = require('../users/user.model');

const Order = sequelize.define('Order', {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    // links to users table
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id',
        }
    },

    // order status flow:
    // pending → confirmed → processing → shipped → delivered
    // or: pending → cancelled
    status: {
        type: DataTypes.ENUM(
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        ),
        defaultValue: 'pending',
    },

    // financial breakdown
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    gst_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    discount_amount: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },

    // gold rate locked at time of purchase
    // stored as JSON so it never changes even if rates change
    gold_rate_snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
    },

    // payment info
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        defaultValue: 'pending',
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: true,   // filled after payment
    },
    razorpay_order_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    // shipping info
    shipping_address: {
        type: DataTypes.JSONB,
        allowNull: false,
    },

    // tracking
    tracking_number: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estimated_delivery: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    // cancellation
    cancelled_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    cancel_reason: {
        type: DataTypes.STRING,
        allowNull: true,
    },

}, {
    tableName: 'orders',
    timestamps: true,
});

// associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });

module.exports = Order;