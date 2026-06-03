const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../auth/auth.middleware');
const Order = require('../orders/order.model');
const OrderItem = require('../orders/orderItem.model');
const Product = require('../products/product.model');
const User = require('../users/user.model');
const { sequelize } = require('../../config/db');
const { QueryTypes } = require('sequelize');

// All admin routes require login + admin role
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
    try {
        // Run all queries in parallel
        const [
            totalOrders,
            totalUsers,
            revenueResult,
            recentOrders,
        ] = await Promise.all([
            // Total order count
            Order.count(),

            // Total user count
            User.count(),

            // Total revenue (sum of delivered orders only)
            sequelize.query(
                `SELECT COALESCE(SUM(total_amount), 0) AS revenue
                 FROM orders
                 WHERE status = 'delivered'`,
                { type: QueryTypes.SELECT }
            ),

            // Last 5 orders with user info
            Order.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email'],
                }],
            }),
        ]);

        // Product count from MongoDB
        const totalProducts = await Product.countDocuments({ is_active: true });

        // Low stock products (stock <= 5) from MongoDB
        const lowStockProducts = await Product.find(
            { stock: { $lte: 5 }, is_active: true },
            { name: 1, stock: 1, images: 1 }
        ).limit(10);

        const totalRevenue = revenueResult[0]?.revenue ?? 0;

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalOrders,
                    totalRevenue: Number(totalRevenue),
                    totalProducts,
                    totalUsers,
                },
                recentOrders,
                lowStockProducts,
            },
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;