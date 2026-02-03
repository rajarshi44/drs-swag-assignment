const Coupon = require('../models/Coupon');

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal } = req.body;
        
        const coupon = await Coupon.findOne({ code: code, isActive: true });
        
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        // Check Expiry
        if (new Date() > coupon.expirationDate) {
            return res.status(400).json({ message: 'Coupon expired' });
        }

        // Check Usage Limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        let discountAmount = 0;
        if (coupon.type === 'percent') {
            discountAmount = (cartTotal * coupon.value) / 100;
        } else {
            discountAmount = coupon.value;
        }

        // Cap at total
        if (discountAmount > cartTotal) discountAmount = cartTotal;

        res.json({
            valid: true,
            discountAmount,
            coupon
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a coupon
// @route   POST /api/coupons
// @access  Admin
const createCoupon = async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { validateCoupon, createCoupon };
