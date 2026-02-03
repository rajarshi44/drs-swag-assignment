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

// Simple in-memory cache
let productCache = {
    data: null,
    timestamp: 0
};
let couponCache = {
    data: null,
    timestamp: 0
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
        const model = genAI.getGenerativeModel({ 
            model: "gemini-flash-latest",
            generationConfig: { responseMimeType: "application/json" }
        });

        // 1. Gather Context (with caching)
        const now = Date.now();
        
        let products;
        if (productCache.data && (now - productCache.timestamp < CACHE_TTL)) {
            products = productCache.data;
        } else {
            console.log("Fetching products to refresh cache...");
            products = await Product.find({}, 'name description price category stock features image hasVariants').lean();
            productCache = { data: products, timestamp: now };
            console.log("Products cached:", products.length);
        }

        let activeCoupons;
        if (couponCache.data && (now - couponCache.timestamp < CACHE_TTL)) {
            activeCoupons = couponCache.data;
        } else {
            console.log("Fetching coupons to refresh cache...");
            activeCoupons = await Coupon.find({ 
                isActive: true, 
                expirationDate: { $gt: new Date() },
                type: { $ne: 'fixed' } 
            }, 'code value type').lean();
            couponCache = { data: activeCoupons, timestamp: now };
            console.log("Coupons cached:", activeCoupons.length);
        }

        // 2. Prepare Minimal Context for AI (Save Tokens)
        // Map products to a smaller structure, REMOVING IMAGES and minimal description
        const simpleProducts = products.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            category: p.category,
            stock: p.stock,
            desc: p.description ? p.description.substring(0, 100) + '...' : '' // Truncate description
        }));

        const context = {
            products: JSON.stringify(simpleProducts),
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
        - If they ask for a discount, check the Active Coupons list and suggest one.
        - Return PURE JSON.
        
        CRITICAL: 
        - DO NOT invent products. Use the provided "id" from the STORE DATA.
        - In the "productIds" array, return ONLY the exact strings from the "id" field of the products you recommend.
        - Do not return product details in the JSON, just the IDs. The system will look them up.

        OUTPUT JSON SCHEMA:
        {
            "answer": "String. The conversational answer to the user.",
            "recommendedProductIds": ["String (id1)", "String (id2)"],
            "couponCode": "String (optional, only if suggesting a specific coupon)"
        }
        
        User Question: "${message}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // 3. Parse & Rehydrate
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse AI JSON:", text);
            jsonResponse = { answer: text, recommendedProductIds: [], couponCode: null };
        }

        // Rehydrate Products (Map IDs back to full objects from cache)
        const rehydratedProducts = [];
        if (jsonResponse.recommendedProductIds && Array.isArray(jsonResponse.recommendedProductIds)) {
            jsonResponse.recommendedProductIds.forEach(id => {
                const fullProduct = products.find(p => p._id.toString() === id);
                if (fullProduct) {
                    rehydratedProducts.push({
                        id: fullProduct._id,
                        name: fullProduct.name,
                        price: fullProduct.price,
                        image: fullProduct.image // Re-attach the image here!
                    });
                }
            });
        }

        // Rehydrate Coupon
        let rehydratedCoupon = null;
        if (jsonResponse.couponCode) {
            const fullCoupon = activeCoupons.find(c => c.code === jsonResponse.couponCode);
            if (fullCoupon) {
                rehydratedCoupon = {
                    code: fullCoupon.code,
                    discount: `${fullCoupon.value}%` // Assuming % for now based on previous logic, or adapt
                };
            }
        }

        // Final Response Structure
        res.json({
            answer: jsonResponse.answer,
            products: rehydratedProducts,
            coupon: rehydratedCoupon
        });

    } catch (error) {
        console.error('Public AI Error:', error);
        
        if (error.message.includes('429')) {
             return res.status(200).json({ 
                answer: "I'm receiving a lot of messages right now! 🤯 Please give me a minute to cool down my circuits.",
                products: [],
                coupon: null
            });
        }

        res.status(500).json({ 
            message: 'AI Service Error: ' + error.message
        });
    }
};

module.exports = { chatWithAI, chatWithShopper };
