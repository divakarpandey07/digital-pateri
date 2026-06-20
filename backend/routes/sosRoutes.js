const express = require('express');
const router = express.Router();
const { triggerEmergencySOS } = require('../controllers/sosController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/trigger', optionalProtect, triggerEmergencySOS);

module.exports = router;
