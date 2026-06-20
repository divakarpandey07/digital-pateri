const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

// @desc    Get all crops from DB
// @route   GET /api/v1/crops
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const crops = await Crop.find().sort({ 'name.en': 1 });
    res.status(200).json({ success: true, data: crops });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
