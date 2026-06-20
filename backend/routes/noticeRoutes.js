const express = require('express');
const router = express.Router();
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getNotices);
router.post('/', protect, authorize('Panchayat Admin', 'Super Admin'), createNotice);
router.delete('/:id', protect, authorize('Panchayat Admin', 'Super Admin'), deleteNotice);

module.exports = router;
