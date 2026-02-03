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
        const { type, value, code, expirationDate } = req.body;
        
        // Server-side validation
        if (!code || code.trim().length < 3) {
            return res.status(400).json({ message: 'Coupon code must be at least 3 characters' });
        }
        
        if (type === 'percent' && (value < 0 || value > 100)) {
            return res.status(400).json({ message: 'Percentage discount must be between 0 and 100' });
        }
        
        if (type === 'fixed' && value < 0) {
            return res.status(400).json({ message: 'Fixed discount cannot be negative' });
        }
        
        if (new Date(expirationDate) <= new Date()) {
            return res.status(400).json({ message: 'Expiration date must be in the future' });
        }
        
        const coupon = new Coupon(req.body);
        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A coupon with this code already exists' });
        }
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Admin
const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find({}).sort({ createdAt: -1 });
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a coupon
// @route   DELETE /api/coupons/:id
// @access  Admin
const deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        res.json({ message: 'Coupon deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { validateCoupon, createCoupon, getCoupons, deleteCoupon };
