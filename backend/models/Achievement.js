const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
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
  title: { 
    type: String, 
    required: [true, 'Achievement title is required'],
    trim: true
  },
  category: { 
    type: String, 
    enum: ['Academic', 'Sports', 'Defense', 'Arts', 'Social Service', 'Other'], 
    required: [true, 'Category is required'] 
  },
  year: { 
    type: Number, 
    required: [true, 'Year is required'] 
  },
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

module.exports = mongoose.model('Achievement', AchievementSchema);
