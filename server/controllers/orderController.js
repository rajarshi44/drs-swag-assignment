const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const createOrder = async (req, res) => {
    try {
        const { items, customerInfo, couponCode, userId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }

        // Validate Items and Calculate Prices
        let calculatedTotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }

            // Determine effective stock and price
            let effectiveStock = product.stock;
            let targetVariantIndex = -1; // -1 means main product stock

            if (product.hasVariants && product.variants.length > 0) {
                // If the user didn't specify a variant (e.g. Quick Add), find the first one with stock
                // Ideally, the frontend should send variant SKU or ID. 
                // We'll assume for now if it's a generic add, we pick the first available.
                
                // Check if specific variant was requested (future proofing: item.variantSku)
                // For now, auto-select first available
                const availableVariantIndex = product.variants.findIndex(v => v.stock >= item.quantity);
                
                if (availableVariantIndex === -1) {
                     return res.status(400).json({ message: `Insufficient stock for ${product.name} (all sizes sold out)` });
                }

                targetVariantIndex = availableVariantIndex;
                effectiveStock = product.variants[targetVariantIndex].stock;
            }

            if (effectiveStock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // Calculate price based on tiered pricing
            let priceToUse = product.price; // Use current product price
            if (product.tieredPricing && product.tieredPricing.length > 0) {
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
                priceAtPurchase: priceToUse,
                variantIndex: targetVariantIndex // Store which variant to decrement
            });
        }

        // Apply Coupon
        let discountAmount = 0;
        let appliedCouponData = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
            
            if (coupon) {
                 if (new Date() > coupon.expirationDate) {
                     return res.status(400).json({ message: 'Coupon expired' });
                 }
                 if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
                     return res.status(400).json({ message: 'Coupon usage limit reached' });
                 }

                 if (coupon.type === 'percent') {
                     discountAmount = (calculatedTotal * coupon.value) / 100;
                 } else if (coupon.type === 'fixed') {
                     discountAmount = coupon.value;
                 }

                 if (discountAmount > calculatedTotal) discountAmount = calculatedTotal;

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
            user: userId,
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
            if (item.variantIndex !== -1) {
                // Decrement specific variant stock using array index dot notation
                const updateQuery = {};
                updateQuery[`variants.${item.variantIndex}.stock`] = -item.quantity;
                await Product.findByIdAndUpdate(item.product, { $inc: updateQuery });
            } else {
                // Decrement simple product stock
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }
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
        const { userId } = req.query;
        let query = {};
        
        if (userId) {
            query.user = userId;
        }

        const orders = await Order.find(query)
            .populate('items.product', 'name image price')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const VALID_STATUSES = ['pending', 'fulfilled', 'cancelled'];

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        order.status = status;
        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getOrders, updateOrderStatus };
