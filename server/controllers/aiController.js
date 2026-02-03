const { GoogleGenerativeAI } = require("@google/generative-ai");
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Chat with AI about store data
// @route   POST /api/ai/chat
// @access  Private/Admin
const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: 'Gemini API Key not configured' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        // 1. Gather Context
        const products = await Product.find({}, 'name stock price category');
        const orders = await Order.find({}, 'finalAmount createdAt status'); // Limit fetching to avoid token limits if many
        const coupons = await Coupon.find({}, 'code isActive expirationDate usedCount');

        const context = {
            productsStr: JSON.stringify(products),
            ordersSummary: `Total Orders: ${orders.length}, Total Revenue: $${orders.reduce((acc, o) => acc + o.finalAmount, 0)}`,
            couponsStr: JSON.stringify(coupons)
        };

        const prompt = `
        You are an intelligent admin assistant for a Swag Commerce platform.
        Here is the current database state:
        
        PRODUCTS: ${context.productsStr}
        
        ORDERS SUMMARY: ${context.ordersSummary}
        
        COUPONS: ${context.couponsStr}
        
        User Question: "${message}"
        
        Answer the user's question accurately based *only* on the provided data. 
        If asking about specific stock, check the products list.
        If asking about revenue, use the orders summary.
        If asking about coupons, check expiry and active status.
        Keep answers concise and professional.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error('AI Error:', error);
        res.status(500).json({ message: 'AI Service Error: ' + error.message });
    }
};

module.exports = { chatWithAI };
