const express = require('express');
const router = express.Router();
const { 
  getComplaints, 
  getComplaintById, 
  createComplaint, 
  upvoteComplaint, 
  updateComplaintStatus 
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.post('/', protect, createComplaint);
router.post('/:id/upvote', protect, upvoteComplaint);
router.patch('/:id/status', protect, authorize('Panchayat Admin', 'Super Admin'), updateComplaintStatus);

module.exports = router;
