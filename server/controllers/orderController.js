const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { items, customerInfo, couponCode } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Validate Items and Calculate Prices
        let calculatedTotal = 0;
        const processedItems = [];

        // START TRANSACTION-LIKE LOGIC (Simulated or Atomic check)
        // For simplicity in this non-replica set environment, we check stock first then update.
        // In production, use a session transaction.
        
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // Calculate price based on tiered pricing
            let priceToUse = product.basePrice;
            if (product.tieredPricing && product.tieredPricing.length > 0) {
                 // Sort tiers descending to find the best match
                 const tiers = product.tieredPricing.sort((a, b) => b.quantity - a.quantity);
                 for (const tier of tiers) {
                     if (item.quantity >= tier.quantity) {
                         priceToUse = tier.price;
                         break;
                     }
                 }
            }

            calculatedTotal += priceToUse * item.quantity;
            processedItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase: priceToUse
            });
        }

        // Apply Coupon
        let discountAmount = 0;
        let appliedCouponData = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            
            if (coupon) {
                 // Validate Expiry
                 if (new Date() > coupon.expirationDate) {
                     return res.status(400).json({ message: 'Coupon expired' });
                 }
                 // Validate Usage Limit
                 if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
                     return res.status(400).json({ message: 'Coupon usage limit reached' });
                 }

                 if (coupon.type === 'percent') {
                     discountAmount = (calculatedTotal * coupon.value) / 100;
                 } else if (coupon.type === 'fixed') {
                     discountAmount = coupon.value;
                 }

                 // Cap discount at total
                 if (discountAmount > calculatedTotal) discountAmount = calculatedTotal;

                 // Update Coupon Usage
                 coupon.usedCount += 1;
                 await coupon.save();

                 appliedCouponData = {
                     code: coupon.code,
                     discountValue: discountAmount
                 };
            } else {
                 return res.status(400).json({ message: 'Invalid coupon' });
            }
        }

        const finalAmount = calculatedTotal - discountAmount;

        // Create Order
        const order = new Order({
            items: processedItems,
            customerInfo,
            originalAmount: calculatedTotal,
            discountAmount,
            finalAmount,
            appliedCoupon: appliedCouponData
        });

        const createdOrder = await order.save();

        // Decrement Stock
        for (const item of processedItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        res.status(201).json(createdOrder);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my orders (or all for admin)
// @route   GET /api/orders
// @access  Public (simplified)
const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders };
