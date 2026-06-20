const express = require('express');
const router = express.Router();
const { queryChatbot } = require('../controllers/chatbotController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/query', optionalProtect, queryChatbot);

module.exports = router;
