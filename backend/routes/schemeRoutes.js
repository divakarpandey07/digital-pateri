const express = require('express');
const router = express.Router();
const Scheme = require('../models/Scheme');

// @desc    Get schemes from DB (optionally filtered by category)
// @route   GET /api/v1/schemes
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    const schemes = await Scheme.find(query).sort({ title: 1 });
    res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
