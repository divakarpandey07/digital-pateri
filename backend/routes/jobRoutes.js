const express = require('express');
const router = express.Router();
const { getJobs, createJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getJobs);
router.post('/', protect, authorize('Panchayat Admin', 'Super Admin'), createJob);
router.delete('/:id', protect, authorize('Panchayat Admin', 'Super Admin'), deleteJob);

module.exports = router;
