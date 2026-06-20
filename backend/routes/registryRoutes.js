const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createRegistryRecord,
  getRegistryRecords,
  updateRegistryStatus
} = require('../controllers/registryController');

router.use(protect); // All registry routes require user login

router.route('/')
  .get(getRegistryRecords)
  .post(createRegistryRecord);

router.patch('/:id/status', authorize('Super Admin', 'Panchayat Admin'), updateRegistryStatus);

module.exports = router;
