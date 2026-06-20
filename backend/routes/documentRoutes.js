const express = require('express');
const router = express.Router();
const {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument
} = require('../controllers/documentController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(optionalProtect, getDocuments)
  .post(protect, authorize('Panchayat Admin', 'Super Admin'), uploadDocument);

router.get('/:id/download', downloadDocument);

router.delete('/:id', protect, authorize('Panchayat Admin', 'Super Admin'), deleteDocument);

module.exports = router;
