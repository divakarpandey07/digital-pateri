const mongoose = require('mongoose');

const BloodDonorSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true 
  },
  residentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resident', 
    required: true 
  },
  bloodGroup: { 
    type: String, 
    required: [true, 'Blood group is required'],
    trim: true
  },
  availabilityStatus: { 
    type: Boolean, 
    default: true 
  },
  lastDonationDate: { 
    type: Date 
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  }
}, { timestamps: true });

// Optimize blood group searches
BloodDonorSchema.index({ bloodGroup: 1 });

module.exports = mongoose.model('BloodDonor', BloodDonorSchema);
