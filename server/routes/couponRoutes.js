const express = require('express');
const router = express.Router();
const { validateCoupon, createCoupon, getCoupons, deleteCoupon } = require('../controllers/couponController');

router.route('/').get(getCoupons).post(createCoupon);
router.post('/validate', validateCoupon);
router.route('/:id').delete(deleteCoupon);

module.exports = router;
