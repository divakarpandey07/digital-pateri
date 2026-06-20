const mongoose = require('mongoose');

const KnowledgeBaseSchema = new mongoose.Schema({
  topic: { 
    type: String, 
    required: true,
    trim: true
  },
  keywords: [{ 
    type: String 
  }],
  content: { 
    type: String, 
    required: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Setup text indexing for rapid keyword extraction
KnowledgeBaseSchema.index({ keywords: 'text', topic: 'text' });

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
