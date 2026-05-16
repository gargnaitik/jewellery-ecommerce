const orderService = require('./order.service');

// POST /api/orders — create order (checkout)
const createOrder = async (req, res) => {
    try {
        const { items, shipping_address } = req.body;

        if (!shipping_address) {
            return res.status(400).json({
                success: false,
                message: 'Shipping address is required',
            });
        }

        const order = await orderService.createOrder({
            userId: req.user.id,  // from auth middleware
            items,
            shipping_address,
        });

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user.id);
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/orders/:id
const getOrderById = async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.id);

        // user can only see their own order
        if (order.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order',
            });
        }

        res.status(200).json({ success: true, data: order });
    } catch (err) {
        res.status(404).json({ success: false, message: err.message });
    }
};

// GET /api/orders — all orders (admin only)
const getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders(req.query);
        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PATCH /api/orders/:id/status — update status (admin)
const updateStatus = async (req, res) => {
    try {
        const { status, tracking_number, estimated_delivery, cancel_reason } = req.body;

        const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        const order = await orderService.updateOrderStatus(
            req.params.id,
            status,
            { tracking_number, estimated_delivery, cancel_reason }
        );

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order,
        });

    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// POST /api/orders/:id/cancel — cancel order (user)
const cancelOrder = async (req, res) => {
    try {
        const { reason } = req.body;
        const order = await orderService.cancelOrder(
            req.params.id,
            req.user.id,
            reason
        );

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            data: order,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

module.exports = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateStatus,
    cancelOrder,
};