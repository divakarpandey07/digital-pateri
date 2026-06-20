const express = require('express');
const router = express.Router();
const { triggerSeed, getDashboardStats, getDatabaseBackup } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Seed route protected for Super Admin or Panchayat Admin
router.post('/seed', protect, authorize('Panchayat Admin', 'Super Admin'), triggerSeed);

// Dashboard statistics
router.get('/dashboard', protect, authorize('Panchayat Admin', 'Super Admin'), getDashboardStats);

// Database backup download
router.get('/backup', protect, authorize('Panchayat Admin', 'Super Admin'), getDatabaseBackup);

module.exports = router;
