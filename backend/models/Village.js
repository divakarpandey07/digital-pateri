const mongoose = require('mongoose');

const VillageSchema = new mongoose.Schema({
  villageCode: { 
    type: String, 
    unique: true, 
    required: [true, 'Village code is required'],
    trim: true
  },
  name: { 
    type: String, 
    required: [true, 'Village name is required'],
    trim: true
  },
  district: { 
    type: String, 
    required: [true, 'District is required'],
    trim: true
  },
  state: { 
    type: String, 
    required: [true, 'State is required'],
    trim: true
  },
  pinCode: { 
    type: String, 
    required: [true, 'PIN code is required'],
    trim: true
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

module.exports = mongoose.model('Village', VillageSchema);
