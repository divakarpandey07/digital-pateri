const express = require('express');
const router = express.Router();
const { getDonors, toggleAvailability } = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getDonors);
router.patch('/availability', protect, toggleAvailability);

module.exports = router;
