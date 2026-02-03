const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

const seedData = async () => {
    try {
        await Product.deleteMany();
        await Coupon.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed...');

        // Create Users
        const adminUser = await User.create({
            name: 'Admin User',
            email: 'admin@swag.com',
            password: 'adminpassword', // Will be hashed by model
            role: 'admin'
        });

        const demoUser = await User.create({
            name: 'Demo User',
            email: 'user@swag.com',
            password: 'userpassword',
            role: 'user'
        });

        console.log('Users Created...');

        // Create Products
        const products = [
            {
                name: 'Premium Developer Hoodie',
                description: 'High-quality cotton blend hoodie with embroidered logo. Perfect for late night coding sessions.',
                category: 'Apparel',
                image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=500', 
                stock: 50,
                price: 49.99,
                tieredPricing: [
                    { quantity: 10, price: 45.00 },
                    { quantity: 50, price: 40.00 }
                ]
            },
            {
                name: 'Stainless Steel Water Bottle',
                description: 'Double-walled vacuum insulated bottle. Keeps drinks cold for 24 hours.',
                category: 'Accessories',
                image: 'https://images.unsplash.com/photo-1602143407151-511191054779?auto=format&fit=crop&q=80&w=500',
                stock: 100,
                price: 24.99,
                tieredPricing: [
                    { quantity: 20, price: 20.00 }
                ]
            },
            {
                name: 'Wireless Noise Cancelling Headphones',
                description: 'Focus on your code with these premium noise cancelling headphones.',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=500',
                stock: 15,
                price: 199.99,
                tieredPricing: []
            },
            {
                name: 'Ergonomic Mouse',
                description: 'Reduce strain with this vertical ergonomic mouse.',
                category: 'Electronics',
                image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=500',
                stock: 5, // Low stock for AI testing
                price: 59.99,
                tieredPricing: []
            },
             {
                name: 'Eco-Friendly Notebook',
                description: 'Recycled paper notebook for your daily standup notes.',
                category: 'Office',
                image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=500',
                stock: 200, 
                price: 12.99,
                tieredPricing: [
                     { quantity: 50, price: 10.00 },
                     { quantity: 100, price: 8.00 }
                ]
            }
        ];

        await Product.insertMany(products);
        console.log('Products Imported...');

        // Create Coupons
        const coupons = [
            {
                code: 'WELCOME20',
                type: 'percent',
                value: 20,
                expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                usageLimit: 100,
                isActive: true
            },
            {
                code: 'FREEHOODIE', // Logic handling needs to be robust for "free item" vs "fixed amount", but assuming fixed amount for database simplicity here as per model
                type: 'fixed',
                value: 50, // Approx value of hoodie
                expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                usageLimit: 10,
                isActive: true
            },
            {
                code: 'EXPIRED10',
                type: 'percent',
                value: 10,
                expirationDate: new Date(new Date().setMonth(new Date().getMonth() - 1)), // Expired
                isActive: true
            }
        ];

        await Coupon.insertMany(coupons);
        console.log('Coupons Imported...');

        console.log('Data Imported Successfully!');
        process.exit();

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
