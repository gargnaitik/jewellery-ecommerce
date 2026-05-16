const { DataTypes } = require('sequelize');
const { sequelize } = require('../../config/db');
const Order = require('./order.model');

const OrderItem = sequelize.define('OrderItem', {

    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    order_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: Order, key: 'id' }
    },

    // MongoDB product ID stored as string
    product_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    // snapshot product details at time of purchase
    // even if product changes later, order shows original details
    product_snapshot: {
        type: DataTypes.JSONB,
        allowNull: false,
    },

    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        min: 1,
    },

    // price breakdown per item
    gold_value: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    making_charges: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    stone_value: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    gst_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    item_total: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },

    // gold rate used for this item
    gold_rate_used: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

}, {
    tableName: 'order_items',
    timestamps: true,
});

// associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });

module.exports = OrderItem;