const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

const next = require('next');

dotenv.config();

connectDB();

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, dir: '../client' });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 5000;

nextApp.prepare().then(() => {
  const app = express();

  app.use(express.json({ limit: '200mb' }));
  app.use(express.urlencoded({ limit: '200mb', extended: true }));
  app.use(cors());

  // Routes Placeholder
  app.use('/api/products', require('./routes/productRoutes'));
  app.use('/api/orders', require('./routes/orderRoutes'));
  app.use('/api/coupons', require('./routes/couponRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));

  app.get('*', (req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
