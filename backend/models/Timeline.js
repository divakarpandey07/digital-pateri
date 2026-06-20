const mongoose = require('mongoose');

const TimelineSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true 
  },
  year: { 
    type: Number, 
    required: [true, 'Year is required']
  },
  title: { 
    type: String, 
    required: [true, 'Timeline title is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Timeline description is required'] 
  },
  image: { 
    type: String,
    default: ''
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

module.exports = mongoose.model('Timeline', TimelineSchema);
