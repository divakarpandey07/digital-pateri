const mongoose = require('mongoose');

const ChatHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  sessionId: {
    type: String
  },
  question: { 
    type: String, 
    required: true 
  },
  answer: { 
    type: String, 
    required: true 
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('ChatHistory', ChatHistorySchema);
