const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['Farmers', 'Students', 'Women', 'Senior Citizens', 'Labourers', 'Small Businesses'],
    required: true 
  },
  eligibility: { type: String },
  requiredDocuments: [String],
  benefits: { type: String },
  applicationProcess: { type: String },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

SchemeSchema.index({ title: 'text', description: 'text', eligibility: 'text' });

module.exports = mongoose.model('Scheme', SchemeSchema);
