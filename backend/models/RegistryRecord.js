const mongoose = require('mongoose');

const RegistryRecordSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Birth', 'Death'], 
    required: true 
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  dateOfEvent: { 
    type: Date,
    required: [true, 'Date of event is required']
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  fatherName: { 
    type: String,
    trim: true
  },
  motherName: { 
    type: String,
    trim: true
  },
  spouseName: { 
    type: String,
    trim: true
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  registrationNumber: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('RegistryRecord', RegistryRecordSchema);
