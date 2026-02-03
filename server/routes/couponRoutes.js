const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon } = require('../controllers/couponController');

router.post('/validate', validateCoupon);
router.post('/', createCoupon);

module.exports = router;
