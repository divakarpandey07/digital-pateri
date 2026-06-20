const mongoose = require('mongoose');

const MandiRateSchema = new mongoose.Schema({
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  market: {
    type: String,
    required: [true, 'Market name is required'],
    trim: true
  },
  commodity: {
    type: String,
    required: [true, 'Commodity is required'],
    trim: true
  },
  variety: {
    type: String,
    required: [true, 'Variety is required'],
    trim: true
  },
  minPrice: {
    type: Number,
    required: [true, 'Minimum price is required']
  },
  maxPrice: {
    type: Number,
    required: [true, 'Maximum price is required']
  },
  modalPrice: {
    type: Number,
    required: [true, 'Modal price is required']
  },
  arrivalDate: {
    type: Date,
    required: [true, 'Arrival date is required']
  },
  source: {
    type: String,
    enum: ['API', 'MOCK'],
    default: 'API'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Database optimization: index for sorting by arrival date and filtering by district/commodity
MandiRateSchema.index({ district: 1, commodity: 1, arrivalDate: -1 });

module.exports = mongoose.model('MandiRate', MandiRateSchema);
