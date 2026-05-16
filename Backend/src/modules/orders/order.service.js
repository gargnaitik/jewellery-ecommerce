const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const Product = require('../products/product.model');
const pricingService = require('../pricing/pricing.service');
const { sequelize } = require('../../config/db');

// ─── Create order (checkout) ──────────────────────────
const createOrder = async ({ userId, items, shipping_address }) => {

    // items = [{ product_id, quantity }]
    if (!items || items.length === 0) {
        throw new Error('Order must have at least one item');
    }

    // fetch all gold rates once — used for all items
    const goldRates = await pricingService.getAllGoldRates();

    // calculate price for each item
    const calculatedItems = [];
    let subtotal = 0;
    let totalGst = 0;

    for (const item of items) {

        // fetch product from MongoDB
        const product = await Product.findById(item.product_id);
        if (!product) throw new Error(`Product ${item.product_id} not found`);
        if (!product.is_active) throw new Error(`Product ${product.name} is no longer available`);
        if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
        }

        // get gold rate for this product's karat
        const rateKey = `${product.karat}K`;
        const goldRate = goldRates[rateKey]?.rate_per_gram || 6870;

        // calculate price
        const goldValue = Math.round(product.net_weight * goldRate * item.quantity);
        const makingCharges = Math.round(product.making_charges * item.quantity);
        const stoneValue = product.stones?.reduce((t, s) => t + (s.price || 0), 0) * item.quantity || 0;
        const itemSubtotal = goldValue + makingCharges + stoneValue;
        const gstAmount = Math.round(itemSubtotal * 0.03);
        const itemTotal = itemSubtotal + gstAmount;

        subtotal += itemSubtotal;
        totalGst += gstAmount;

        calculatedItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            gold_rate_used: goldRate,
            gold_value: goldValue,
            making_charges: makingCharges,
            stone_value: stoneValue,
            gst_amount: gstAmount,
            item_total: itemTotal,

            // snapshot product at purchase time
            product_snapshot: {
                name: product.name,
                sku: product.sku,
                karat: product.karat,
                metal_type: product.metal_type,
                net_weight: product.net_weight,
                gross_weight: product.gross_weight,
                images: product.images,
                category: product.category,
            },
        });
    }

    const totalAmount = subtotal + totalGst;

    // use PostgreSQL transaction
    // either ALL of this saves or NONE of it does
    const order = await sequelize.transaction(async (t) => {

        // 1. create order
        const newOrder = await Order.create({
            user_id: userId,
            subtotal,
            gst_amount: totalGst,
            total_amount: totalAmount,
            shipping_address,
            gold_rate_snapshot: goldRates, // snapshot ALL rates
            status: 'pending',
            payment_status: 'pending',
        }, { transaction: t });

        // 2. create order items
        const orderItems = calculatedItems.map(item => ({
            ...item,
            order_id: newOrder.id,
        }));

        await OrderItem.bulkCreate(orderItems, { transaction: t });

        // 3. reduce stock in MongoDB
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product_id,
                { $inc: { stock: -item.quantity } }
            );
        }

        return newOrder;
    });

    // fetch order with items
    return await getOrderById(order.id);
};

// ─── Get order by ID ──────────────────────────────────
const getOrderById = async (orderId) => {
    const order = await Order.findByPk(orderId, {
        include: [{
            model: OrderItem,
            as: 'items',
        }]
    });
    if (!order) throw new Error('Order not found');
    return order;
};

// ─── Get all orders for a user ────────────────────────
const getUserOrders = async (userId) => {
    const orders = await Order.findAll({
        where: { user_id: userId },
        include: [{ model: OrderItem, as: 'items' }],
        order: [['createdAt', 'DESC']],
    });
    return orders;
};

// ─── Get all orders (admin) ───────────────────────────
const getAllOrders = async (filters = {}) => {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.payment_status) where.payment_status = filters.payment_status;

    const orders = await Order.findAll({
        where,
        include: [{ model: OrderItem, as: 'items' }],
        order: [['createdAt', 'DESC']],
    });
    return orders;
};

// ─── Update order status (admin) ──────────────────────
const updateOrderStatus = async (orderId, status, extra = {}) => {
    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    const updates = { status };

    if (status === 'shipped') {
        updates.tracking_number = extra.tracking_number;
        updates.estimated_delivery = extra.estimated_delivery;
    }
    if (status === 'delivered') {
        updates.delivered_at = new Date();
    }
    if (status === 'cancelled') {
        updates.cancelled_at = new Date();
        updates.cancel_reason = extra.cancel_reason;

        // restore stock when cancelled
        const items = await OrderItem.findAll({ where: { order_id: orderId } });
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product_id,
                { $inc: { stock: item.quantity } }
            );
        }
    }

    await order.update(updates);
    return await getOrderById(orderId);
};

// ─── Cancel order (user) ──────────────────────────────
const cancelOrder = async (orderId, userId, reason) => {

    const order = await Order.findByPk(orderId);
    if (!order) throw new Error('Order not found');

    // user can only cancel their own order
    if (order.user_id !== userId) {
        throw new Error('Not authorized to cancel this order');
    }

    // can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error(`Cannot cancel order with status: ${order.status}`);
    }

    return await updateOrderStatus(orderId, 'cancelled', { cancel_reason: reason });
};

module.exports = {
    createOrder,
    getOrderById,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    cancelOrder,
};