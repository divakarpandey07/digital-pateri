const express = require('express');
const router = express.Router();
const {
  getCategories,
  getBusinesses,
  createBusiness,
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  verifyBusiness
} = require('../controllers/marketplaceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public categories lookup
router.get('/categories', getCategories);

// Business list & registration
router.route('/businesses')
  .get(getBusinesses)
  .post(protect, createBusiness);

// Business reviews
router.route('/businesses/:id/reviews')
  .get(getReviews)
  .post(protect, createReview);

// Review updates and deletion
router.route('/reviews/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);

// Business verification approval (Admins only)
router.patch('/businesses/:id/verify', protect, authorize('Panchayat Admin', 'Super Admin'), verifyBusiness);

module.exports = router;
