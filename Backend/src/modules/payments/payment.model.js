const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const Order = require('../orders/order.model');

const Payment = sequelize.define('Payment', {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Order, key: 'id' },
    },

    // Razorpay IDs
    razorpay_order_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    razorpay_payment_id: {
        type: DataTypes.STRING,
        allowNull: true,    // filled after payment
    },
    razorpay_signature: {
        type: DataTypes.STRING,
        allowNull: true,    // filled after verification
    },

    // payment details
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'INR',
    },
    status: {
        type: DataTypes.ENUM(
            'created',    // razorpay order created
            'paid',       // payment successful
            'failed',     // payment failed
            'refunded',   // refund processed
        ),
        defaultValue: 'created',
    },
    method: {
        type: DataTypes.STRING,
        allowNull: true,    // upi, card, netbanking, emi
    },

    // refund details
    refund_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    refund_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
    },
    refunded_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },

    // full razorpay response stored for records
    razorpay_response: {
        type: DataTypes.JSONB,
        allowNull: true,
    },

}, {
    tableName: 'payments',
    timestamps: true,
});

Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasOne(Payment, { foreignKey: 'order_id', as: 'payment' });

module.exports = Payment;