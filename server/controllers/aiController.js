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
        const orders = await Order.find({}, 'finalAmount createdAt status isDelivered');
        const coupons = await Coupon.find({}, 'code isActive expirationDate usedCount value type');

        // Summarize data for AI to save tokens and give better "bird's eye view"
        const lowStock = products.filter(p => p.stock < 10).map(p => `${p.name} (${p.stock})`);
        const activeCoupons = coupons.filter(c => c.isActive && new Date(c.expirationDate) > new Date()).map(c => c.code);
        const todayRevenue = orders
            .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
            .reduce((acc, o) => acc + o.finalAmount, 0);

        const context = {
            summary: {
                totalRevenue: orders.reduce((acc, o) => acc + o.finalAmount, 0),
                totalOrders: orders.length,
                todayRevenue,
                lowStockItems: lowStock,
                activeCoupons
            },
            productsList: JSON.stringify(products), // Providing full list for specific Qs
            recentOrders: JSON.stringify(orders.slice(0, 5)) // detailed recent ones
        };

        const prompt = `
        You are an intelligent admin assistant for a Swag Commerce platform.
        Here is the live store data:
        
        SUMMARY STATS:
        - Total Revenue: $${context.summary.totalRevenue}
        - Total Orders: ${context.summary.totalOrders}
        - Revenue Today: $${context.summary.todayRevenue}
        - Low Stock Items: ${context.summary.lowStockItems.join(', ') || 'None'}
        - Active Coupons: ${context.summary.activeCoupons.join(', ') || 'None'}

        FULL PRODUCT LIST:
        ${context.productsList}

        RECENT ORDERS (Last 5):
        ${context.recentOrders}
        
        User Question: "${message}"
        
        Answer the user's question accurately based *only* on the provided data.
        If the user asks about something outside this data, politely say you only have access to store data.
        Keep answers professional, concise, and helpful.
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
