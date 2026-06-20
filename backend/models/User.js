const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true, 
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    minlength: 6,
    select: false // Exclude from queries by default
  },
  roles: [{ 
    type: String, 
    enum: ['Super Admin', 'Panchayat Admin', 'Resident', 'Volunteer', 'Business Owner', 'Teacher', 'Doctor'],
    default: ['Resident']
  }],
  residentProfile: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Resident' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Pre-save hook to hash password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
