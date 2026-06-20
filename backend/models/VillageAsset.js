const mongoose = require('mongoose');

const VillageAssetSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true 
  },
  name: { 
    type: String, 
    required: [true, 'Asset name is required'],
    trim: true
  },
  type: { 
    type: String, 
    enum: ['Pond', 'Handpump', 'School', 'Road', 'Temple', 'Mosque', 'Anganwadi', 'Community Hall', 'Health Centre'], 
    required: [true, 'Asset type is required'] 
  },
  location: { 
    type: String,
    trim: true
  },
  latitude: { 
    type: Number 
  },
  longitude: { 
    type: Number 
  },
  condition: { 
    type: String, 
    enum: ['Good', 'Needs Repair', 'Under Maintenance'], 
    default: 'Good' 
  },
  installationDate: { 
    type: Date 
  },
  lastInspectionDate: { 
    type: Date 
  },
  maintenanceHistory: [{
    date: { type: Date, default: Date.now },
    notes: { type: String },
    cost: { type: Number }
  }],
  description: { 
    type: String 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

module.exports = mongoose.model('VillageAsset', VillageAssetSchema);
