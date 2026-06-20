const express = require('express');
const router = express.Router();
const {
  registerVolunteer,
  getVolunteers,
  getVolunteerRequests,
  createVolunteerRequest,
  updateVolunteerRequest
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(getVolunteers)
  .post(protect, registerVolunteer);

router.route('/requests')
  .get(getVolunteerRequests)
  .post(protect, createVolunteerRequest);

router.route('/requests/:id')
  .patch(protect, updateVolunteerRequest);

module.exports = router;
