const mongoose = require('mongoose');

const ResidentSchema = new mongoose.Schema({
  villageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Village', 
    required: true 
  },
  residentId: { 
    type: String, 
    unique: true, 
    required: [true, 'Resident ID is required'] 
  },
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  fatherName: { 
    type: String,
    trim: true
  },
  dob: { 
    type: Date 
  },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'] 
  },
  address: { 
    type: String,
    trim: true
  },
  rationCardNumber: {
    type: String,
    trim: true
  },
  cardType: {
    type: String,
    trim: true
  },
  fpsDealer: {
    type: String,
    trim: true
  },
  mohalla: { 
    type: String,
    trim: true
  },
  ward: { 
    type: String,
    trim: true
  },
  occupation: { 
    type: String,
    trim: true
  },
  skills: [{ 
    type: String 
  }],
  education: { 
    type: String,
    trim: true
  },
  bloodGroup: { 
    type: String,
    trim: true
  },
  mobile: { 
    type: String,
    trim: true
  },
  emergencyContact: { 
    type: String,
    trim: true
  },
  photo: { 
    type: String,
    default: ''
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  aadhaarLast4: {
    type: String,
    trim: true
  },
  voterId: {
    type: String,
    trim: true
  },
  familyId: {
    type: String,
    trim: true
  },
  houseNo: {
    type: String,
    trim: true
  },
  isPublicProfile: { 
    type: Boolean, 
    default: true 
  },
  relations: [{
    relativeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resident' },
    relationType: { 
      type: String, 
      enum: ['Father', 'Mother', 'Spouse', 'Child', 'Sibling'] 
    }
  }],
  verificationStatus: { 
    type: String, 
    enum: ['unverified', 'verified', 'deceased'], 
    default: 'unverified' 
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  digilockerId: {
    type: String,
    trim: true
  },
  ayushmanId: {
    type: String,
    trim: true
  },
  pmKisanId: {
    type: String,
    trim: true
  },
  landRecordId: {
    type: String,
    trim: true
  },
  eshramId: {
    type: String,
    trim: true
  },
  soilHealthCardId: {
    type: String,
    trim: true
  },
  panchayatRole: {
    type: String,
    enum: ['Mukhiya', 'Sarpanch', 'PACS Adhyaksh', 'Ward Member', 'Panchayat Staff', 'None'],
    default: 'None'
  },
  reputationPoints: {
    type: Number,
    default: 0
  },
  isDeleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  }
}, { timestamps: true });

// Create text index for global search
ResidentSchema.index({ name: 'text', mohalla: 'text', occupation: 'text' });

module.exports = mongoose.model('Resident', ResidentSchema);
