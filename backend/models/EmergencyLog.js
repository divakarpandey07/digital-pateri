const mongoose = require('mongoose');

const EmergencyLogSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Medical', 'Fire', 'Accident', 'Women Safety', 'Electricity', 'Water Crisis'],
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedStatus: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmergencyLog', EmergencyLogSchema);
