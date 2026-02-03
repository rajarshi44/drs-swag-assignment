const express = require('express');
const router = express.Router();
const { createOrder, getOrders } = require('../controllers/orderController');

router.route('/').post(createOrder).get(getOrders);
router.route('/:id/status').patch(require('../controllers/orderController').updateOrderStatus);

module.exports = router;
