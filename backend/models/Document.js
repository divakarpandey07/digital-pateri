const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  villageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Village',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Government Schemes', 'Scholarships', 'Forms', 'Certificates', 'Panchayat Notices', 'Agriculture Guides', 'Education Resources'],
    required: [true, 'Category is required']
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL or path is required']
  },
  visibility: {
    type: String,
    enum: ['Public', 'Residents Only', 'Admins Only'],
    default: 'Public'
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', DocumentSchema);
