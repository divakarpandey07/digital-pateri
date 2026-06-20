const mongoose = require('mongoose');

const AgriConsultationSchema = new mongoose.Schema({
  villageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: true
  },
  farmerName: {
    type: String,
    required: true,
    trim: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  photoUrl: {
    type: String,
    default: ''
  },
  reply: {
    type: String,
    default: ''
  },
  repliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isResolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('AgriConsultation', AgriConsultationSchema);
