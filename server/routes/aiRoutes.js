const express = require('express');
const router = express.Router();
const { chatWithAI, chatWithShopper } = require('../controllers/aiController');

router.post('/chat', chatWithAI);
router.post('/public-chat', chatWithShopper);

module.exports = router;
