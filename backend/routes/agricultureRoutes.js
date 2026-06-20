const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');
const {
  getMandiRates,
  getPriceHistory,
  getFarmingAdvisories,
  refreshMandiRates,
  getCropAlerts,
  createCropAlert,
  getFarmerProducts,
  createFarmerProduct,
  getConsultations,
  createConsultation,
  replyConsultation,
  aiAsk,
  cropDoctor
} = require('../controllers/agricultureController');

// Rate limiter for manual refresh to prevent API spamming (Max 5 manual refreshes per hour)
const refreshLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5,
  message: {
    success: false,
    message: 'Too many manual refresh requests. Please wait an hour before refreshing again.',
    errorCode: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.get('/mandi-rates', getMandiRates);
router.get('/price-history', getPriceHistory);
router.get('/advisories', getFarmingAdvisories);

router.get('/alerts', getCropAlerts);
router.post('/alerts', protect, authorize('Super Admin', 'Panchayat Admin'), createCropAlert);

router.get('/products', getFarmerProducts);
router.post('/products', protect, createFarmerProduct);

router.get('/consultations', optionalProtect, getConsultations);
router.post('/consultations', protect, createConsultation);
router.patch('/consultations/:id/reply', protect, replyConsultation);

router.post('/ai-ask', aiAsk);
router.post('/crop-doctor', cropDoctor);

// Protected Admin-only refresh trigger with rate limiting
router.post(
  '/refresh',
  protect,
  authorize('Super Admin', 'Panchayat Admin'),
  refreshLimiter,
  refreshMandiRates
);

module.exports = router;
