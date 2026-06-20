const express = require('express');
const router = express.Router();
const { 
  getResidents, 
  getResidentById, 
  createResident, 
  deleteResident,
  requestClaimOtp,
  verifyAndClaimResident,
  getMeResident,
  getPublicResidentProfile,
  requestCertificate,
  getLeadership,
  getHousesMapData
} = require('../controllers/residentController');
const { protect, optionalProtect, authorize } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, getResidents);
router.get('/leadership', getLeadership);
router.get('/houses', getHousesMapData);
router.post('/claim/request-otp', requestClaimOtp);
router.post('/claim/verify', protect, verifyAndClaimResident);
router.get('/me', protect, getMeResident);
router.get('/public/:residentId', getPublicResidentProfile);
router.post('/certificates', protect, requestCertificate);

router.get('/:id', optionalProtect, getResidentById);
router.post('/', protect, authorize('Panchayat Admin', 'Super Admin'), createResident);
router.delete('/:id', protect, authorize('Panchayat Admin', 'Super Admin'), deleteResident);

module.exports = router;
