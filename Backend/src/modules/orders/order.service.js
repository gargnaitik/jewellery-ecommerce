const Order = require('./order.model');
const OrderItem = require('./orderItem.model');
const Product = require('../products/product.model');
const pricingService = require('../pricing/pricing.service');
const { sequelize } = require('../../config/db');
const notificationService = require('../notifications/notification.service');
const User = require('../users/user.model');


const MAX_QUANTITY_PER_ITEM = 10;

// ─── Reserve stock atomically ─────────────────────────
// the stock check and the decrement happen in one MongoDB operation,
// so two buyers can never both take the last piece
const reserveStock = async (productId, quantity) => {
    return Product.findOneAndUpdate(
        { _id: productId, is_active: true, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
    );
};

const releaseStock = async (reserved) => {
    await Promise.all(reserved.map(({ product_id, quantity }) =>
        Product.findByIdAndUpdate(product_id, { $inc: { stock: quantity } })
    ));
};

// ─── Create order (checkout) ──────────────────────────
const createOrder = async ({ userId, items, shipping_address }) => {

    // items = [{ product_id, quantity }]
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Order must have at least one item');
    }
    for (const item of items) {
        const qty = item.quantity;
        if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY_PER_ITEM) {
            throw new Error(`Quantity must be a whole number between 1 and ${MAX_QUANTITY_PER_ITEM}`);
        }
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

        // get gold rate for this product's karat
        const goldRate = goldRates[`${product.karat}K`]?.rate_per_gram;
        if (!goldRate) throw new Error(`No gold rate available for ${product.karat}K`);

        const price = pricingService.computePrice({
            net_weight: product.net_weight,
            goldRate,
            making_charges: product.making_charges,
            stone_value: pricingService.stoneTotal(product.stones),
            quantity: item.quantity,
        });

        subtotal += price.subtotal;
        totalGst += price.gst_amount;

        calculatedItems.push({
            product_id: item.product_id,
            quantity: item.quantity,
            gold_rate_used: goldRate,
            gold_value: price.gold_value,
            making_charges: price.making_charges,
            stone_value: price.stone_value,
            gst_amount: price.gst_amount,
            item_total: price.final_price,

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

    // 1. reserve stock in MongoDB — if any item is short, release what we took
    const reserved = [];
    try {
        for (const item of calculatedItems) {
            const updated = await reserveStock(item.product_id, item.quantity);
            if (!updated) {
                throw new Error(`Insufficient stock for ${item.product_snapshot.name}`);
            }
            reserved.push(item);
        }

        // 2. PostgreSQL transaction — order and items save together or not at all
        const order = await sequelize.transaction(async (t) => {
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

            await OrderItem.bulkCreate(
                calculatedItems.map(item => ({ ...item, order_id: newOrder.id })),
                { transaction: t }
            );

            return newOrder;
        });

        // order confirmation is sent once payment is verified, not here

        return await getOrderById(order.id);

    } catch (err) {
        // compensate: the Postgres transaction rolled back, so put the stock back
        await releaseStock(reserved);
        throw err;
    }
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

    const order = await Order.findByPk(orderId, {
        include: [
            { model: OrderItem, as: 'items' },
            { model: User, as: 'user' },
        ]
    });
    if (!order) throw new Error('Order not found');
    if (order.status === 'cancelled') throw new Error('Order is already cancelled');

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
        await releaseStock(order.items);
    }

    // update order
    await order.update(updates);

    // fetch updated order fresh with all includes
    const updatedOrder = await Order.findByPk(orderId, {
        include: [
            { model: OrderItem, as: 'items' },
            { model: User, as: 'user' },
        ]
    });

    // send notification based on status
    if (updatedOrder.user) {
        switch (status) {

            case 'shipped':
                await notificationService.notifyOrderShipped(
                    updatedOrder.user,
                    updatedOrder
                );
                break;

            case 'delivered':
                await notificationService.notifyOrderDelivered(
                    updatedOrder.user,
                    updatedOrder
                );
                break;

            case 'cancelled':
                await notificationService.notifyOrderCancelled(
                    updatedOrder.user,
                    updatedOrder
                );
                break;

            // confirmed, processing — no notification needed
            default:
                break;
        }
    }

    return updatedOrder;
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