const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');

router.route('/').post(createOrder).get(getOrders);

module.exports = router;
