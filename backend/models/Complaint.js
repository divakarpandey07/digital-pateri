const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Complaint description is required'] 
  },
  category: { 
    type: String, 
    enum: ['Road', 'Water', 'Electricity', 'Sanitation', 'Drainage', 'Internet'], 
    required: [true, 'Complaint category is required'] 
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Emergency'], 
    default: 'Medium' 
  },
  mohalla: { 
    type: String,
    trim: true
  },
  ward: { 
    type: String,
    trim: true
  },
  latitude: { 
    type: Number 
  },
  longitude: { 
    type: Number 
  },
  beforeImage: { 
    type: String,
    default: ''
  },
  afterImage: { 
    type: String,
    default: ''
  },
  upvotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  statusHistory: [{
    status: { type: String },
    updatedAt: { type: Date, default: Date.now },
    comment: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Fast query index for admin dashboards and heatmaps
ComplaintSchema.index({ villageId: 1, status: 1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
