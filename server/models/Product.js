const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    tieredPricing: [{
        quantity: { type: Number, required: true },
        price: { type: Number, required: true } // Price per unit if buying >= quantity
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
