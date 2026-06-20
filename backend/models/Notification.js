const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' // Nullable if isGlobal is true
  },
  isGlobal: { 
    type: Boolean, 
    default: false 
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['Complaint', 'Notice', 'Job', 'Scholarship', 'Event'], 
    required: true 
  },
  link: { 
    type: String // Frontend router redirection path
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Notification', NotificationSchema);
