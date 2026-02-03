const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [3, 'Coupon code must be at least 3 characters'],
        maxlength: [20, 'Coupon code cannot exceed 20 characters']
    },
    type: {
        type: String,
        enum: {
            values: ['fixed', 'percent'],
            message: '{VALUE} is not a valid coupon type'
        },
        required: [true, 'Coupon type is required']
    },
    value: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative'],
        validate: {
            validator: function(v) {
                // For percent type, value must be between 0 and 100
                if (this.type === 'percent') {
                    return v >= 0 && v <= 100;
                }
                // For fixed type, value must be positive
                return v >= 0;
            },
            message: function(props) {
                if (this.type === 'percent') {
                    return 'Percentage discount must be between 0 and 100';
                }
                return 'Fixed discount must be a positive number';
            }
        }
    },
    expirationDate: {
        type: Date,
        required: [true, 'Expiration date is required'],
        validate: {
            validator: function(v) {
                // Expiration date must be in the future (only on create)
                if (this.isNew) {
                    return v > new Date();
                }
                return true;
            },
            message: 'Expiration date must be in the future'
        }
    },
    usageLimit: {
        type: Number,
        default: null, // null means unlimited
        min: [1, 'Usage limit must be at least 1 if specified']
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Optional: minimum order amount
    minOrderAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    // Optional: maximum discount cap (for percent coupons)
    maxDiscountAmount: {
        type: Number,
        default: null,
        min: 0
    },
    // Product restrictions
    appliesToAllProducts: {
        type: Boolean,
        default: true
    },
    // Array of product IDs this coupon applies to (only used if appliesToAllProducts is false)
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // Optional: category restrictions
    applicableCategories: [{
        type: String,
        enum: ['Apparel', 'Electronics', 'Accessories', 'Office', 'Drinkware', 'Bags', 'Other']
    }]
}, {
    timestamps: true
});

// Index for faster lookups
couponSchema.index({ code: 1, isActive: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
