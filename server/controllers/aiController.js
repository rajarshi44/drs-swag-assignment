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
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

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

// @desc    Chat with AI as a shopper (Sales Assistant)
// @route   POST /api/ai/public-chat
// @access  Public
const chatWithShopper = async (req, res) => {
    try {
        const { message } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ message: 'AI Service Unavailable' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // 1. Gather Context (Public Info Only)
        const products = await Product.find({}, 'name description price category stock features');
        const activeCoupons = await Coupon.find({ 
            isActive: true, 
            expirationDate: { $gt: new Date() },
            type: { $ne: 'fixed' } // Maybe hide fixed high-value coupons if they are secret? or just show percent ones.
        }, 'code value type');

        const context = {
            products: JSON.stringify(products),
            coupons: JSON.stringify(activeCoupons)
        };

        const prompt = `
        You are "DevRelSquad Bot", a helpful and enthusiastic sales assistant for the DevRelSquad Swag store.
        Your goal is to help developers find cool swag and answer questions about products.
        
        STORE DATA:
        - Products: ${context.products}
        - Active Coupons: ${context.coupons}

        GUIDELINES:
        - Be friendly, tech-savvy, and use emojis ⚡️🚀.
        - Recommend products based on the user's query.
        - If they ask for a discount, check the Active Coupons list and give them a code if available.
        - DO NOT mention backend IDs or internal data.
        - If you don't know something, suggest they browse the shop.
        - Keep answers short (max 3 sentences).

        User Question: "${message}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ answer: text });

    } catch (error) {
        console.error('Public AI Error:', error);
        res.status(500).json({ message: 'AI Service Error: ' + error.message });
    }
};

module.exports = { chatWithAI, chatWithShopper };
