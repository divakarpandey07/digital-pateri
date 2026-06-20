const mongoose = require('mongoose');

const VolunteerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  villageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: true
  },
  skills: [{
    type: String
  }],
  availability: {
    type: String,
    enum: ['Daily', 'Weekends Only', 'On Call', 'None'],
    default: 'On Call'
  },
  category: {
    type: String,
    enum: ['Education', 'Health', 'Disaster Relief', 'Blood Donation', 'Social Service'],
    required: true
  },
  phoneVisible: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Volunteer', VolunteerSchema);
