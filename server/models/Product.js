const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size: {
        type: String,
        enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'One Size', 'Custom'],
        required: true
    },
    color: {
        type: String,
        default: null
    },
    sku: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    priceModifier: {
        type: Number,
        default: 0 // Additional price for this variant (can be negative for discounts)
    }
}, { _id: true });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minlength: [2, 'Product name must be at least 2 characters'],
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minlength: [10, 'Description must be at least 10 characters'],
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['Apparel', 'Electronics', 'Accessories', 'Office', 'Drinkware', 'Bags', 'Other'],
            message: '{VALUE} is not a valid category'
        },
        index: true
    },
    image: {
        type: String,
        required: [true, 'Product image is required'],
        validate: {
            validator: function(v) {
                // Accept both regular URLs and base64 data URIs
                return /^https?:\/\/.+\..+/.test(v) || /^data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(v);
            },
            message: 'Please provide a valid image URL or upload an image'
        }
    },
    // For products without variants (simple products)
    stock: {
        type: Number,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    // Variant support
    hasVariants: {
        type: Boolean,
        default: false
    },
    variants: [variantSchema],
    // Tiered pricing for bulk orders
    tieredPricing: [{
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }
    }],
    // Metadata
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total stock (sum of variant stocks or simple stock)
productSchema.virtual('totalStock').get(function() {
    if (this.hasVariants && this.variants.length > 0) {
        return this.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return this.stock;
});

// Pre-save validation
productSchema.pre('save', function(next) {
    // If hasVariants is true, ensure at least one variant exists
    if (this.hasVariants && (!this.variants || this.variants.length === 0)) {
        next(new Error('Products with variants must have at least one variant'));
    }
    
    // Generate SKUs for variants if not provided
    if (this.hasVariants && this.variants) {
        this.variants.forEach((variant, index) => {
            if (!variant.sku) {
                const colorPart = variant.color ? `-${variant.color.substring(0, 3).toUpperCase()}` : '';
                variant.sku = `${this.name.substring(0, 3).toUpperCase()}-${variant.size}${colorPart}-${Date.now()}`;
            }
        });
    }
    
    next();
});

module.exports = mongoose.model('Product', productSchema);
