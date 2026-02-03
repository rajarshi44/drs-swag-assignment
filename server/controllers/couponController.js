const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

// @desc    Validate a coupon
// @route   POST /api/coupons/validate
// @access  Public
const validateCoupon = async (req, res) => {
    try {
        const { code, cartTotal, cartItems } = req.body;
        
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

        // Check minimum order amount
        if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
            return res.status(400).json({ 
                message: `Minimum order amount of $${coupon.minOrderAmount} required` 
            });
        }

        // Calculate eligible amount based on product restrictions
        let eligibleTotal = cartTotal;
        let eligibleItems = [];
        
        if (!coupon.appliesToAllProducts && cartItems && cartItems.length > 0) {
            // Need to check which items are eligible
            eligibleTotal = 0;
            
            for (const item of cartItems) {
                // Extract product ID (remove variant suffix if present)
                const productId = item.product.split('-')[0];
                
                // Check if product is in the applicable products list
                const isProductEligible = coupon.applicableProducts.some(
                    p => p.toString() === productId
                );
                
                // Check if product category is eligible (if categories are specified)
                let isCategoryEligible = true;
                if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
                    const product = await Product.findById(productId);
                    if (product) {
                        isCategoryEligible = coupon.applicableCategories.includes(product.category);
                    }
                }
                
                if (isProductEligible || (coupon.applicableCategories?.length > 0 && isCategoryEligible)) {
                    eligibleTotal += item.price * item.quantity;
                    eligibleItems.push(item.product);
                }
            }
            
            if (eligibleTotal === 0) {
                return res.status(400).json({ 
                    message: 'This coupon is not valid for any items in your cart' 
                });
            }
        }

        let discountAmount = 0;
        if (coupon.type === 'percent') {
            discountAmount = (eligibleTotal * coupon.value) / 100;
            
            // Apply max discount cap if specified
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        } else {
            discountAmount = coupon.value;
        }

        // Cap at eligible total
        if (discountAmount > eligibleTotal) discountAmount = eligibleTotal;

        res.json({
            valid: true,
            discountAmount,
            eligibleTotal,
            eligibleItems,
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
