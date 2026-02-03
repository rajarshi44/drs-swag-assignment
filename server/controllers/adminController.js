const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        // Revenue
        const orders = await Order.find({ status: 'completed' });
        const totalRevenue = orders.reduce((acc, order) => acc + order.finalAmount, 0);

        // Low Stock
        const lowStockProducts = await Product.find({ stock: { $lt: 20 } }).select('name stock');

        // Coupon Usage
        const coupons = await Coupon.find({}).select('code usedCount usageLimit');

        // Recent Orders
        const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);

        res.json({
            totalRevenue,
            lowStockProducts,
            couponUsage: coupons,
            recentOrders,
            totalOrders: orders.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAnalytics };
