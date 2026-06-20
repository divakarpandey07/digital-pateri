const mongoose = require('mongoose');

const CertificateRequestSchema = new mongoose.Schema({
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resident',
    required: true
  },
  type: {
    type: String,
    enum: ['Residence', 'Character', 'Income', 'NOC'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reason: {
    type: String
  },
  details: {
    type: Map,
    of: String
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('CertificateRequest', CertificateRequestSchema);
