const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true 
  },
  title: { 
    type: String, 
    required: [true, 'Job title is required'],
    trim: true
  },
  type: { 
    type: String, 
    enum: ['Teaching', 'Farming', 'Shop Work', 'Skilled Labor', 'Other'], 
    required: [true, 'Job type is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Job description is required'] 
  },
  location: { 
    type: String,
    trim: true
  },
  salary: { 
    type: String,
    trim: true
  },
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
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

module.exports = mongoose.model('Job', JobSchema);
