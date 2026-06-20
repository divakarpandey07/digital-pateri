const mongoose = require('mongoose');

const SiteConfigSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true, 
    unique: true 
  },
  emergencyContacts: {
    mukhiya: { type: String, default: '' },
    police: { type: String, default: '112' },
    ambulance: { type: String, default: '102' },
    hospital: { type: String, default: '' }
  },
  socialLinks: {
    facebook: { type: String, default: '' },
    whatsappGroup: { type: String, default: '' }
  },
  themeSettings: {
    primaryColor: { type: String, default: '#047857' }, // Forest Green
    secondaryColor: { type: String, default: '#D97706' }, // Saffron
    logoUrl: { type: String, default: '/assets/pateri-logo.png' }
  },
  aiSettings: {
    maxQueriesPerDay: { type: Number, default: 10 }
  },
  gpdpData: {
    totalBudget: { type: Number, default: 0 },
    totalExpenditure: { type: Number, default: 0 },
    sectorAllocations: [{
      sector: { type: String },
      amount: { type: Number }
    }],
    assetStatus: {
      completed: { type: Number, default: 0 },
      ongoing: { type: Number, default: 0 },
      proposed: { type: Number, default: 0 }
    }
  }
});

module.exports = mongoose.model('SiteConfig', SiteConfigSchema);
