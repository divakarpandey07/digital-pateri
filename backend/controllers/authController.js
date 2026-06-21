const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Resident = require('../models/Resident');

const otpStore = new Map();

// Helper to sign JWT token
const signToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'pateri_smart_village_secret_key_2026_xyz', 
    { expiresIn: '30d' }
  );
};

const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/devi/g, '')
    .replace(/prasad/g, '')
    .replace(/kumar/g, '')
    .replace(/singh/g, '')
    .replace(/sah/g, '')
    .replace(/shah/g, '')
    .replace(/khan/g, '')
    .replace(/ram/g, '')
    .replace(/bibi/g, '')
    .replace(/begum/g, '')
    .replace(/khatun/g, '')
    .replace(/nisha/g, '')
    .replace(/bano/g, '')
    .replace(/[^a-z0-9]/g, '');
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, ward, voterId, mobile } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    if (!voterId && !ward) {
      return res.status(400).json({
        success: false,
        message: 'Please provide either Voter ID Card Number or Ward Number to verify your registration',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    let resident = null;

    if (voterId) {
      // Match by voterId (case-insensitive)
      resident = await Resident.findOne({
        voterId: { $regex: new RegExp('^' + voterId.trim() + '$', 'i') },
        isDeleted: false
      });

      if (resident) {
        // Verify name matches loosely
        if (normalizeName(resident.name) !== normalizeName(name)) {
          return res.status(400).json({
            success: false,
            message: `The name '${name}' does not match the official record for Voter ID '${voterId}'.`,
            errorCode: 'VALIDATION_FAILED'
          });
        }
      }
    } else if (ward) {
      // Match by name and ward
      // Fetch residents in the specified ward to do a loose name matching
      const targetWard = String(ward).trim().padStart(2, '0');
      const residentsInWard = await Resident.find({
        ward: { $in: [targetWard, String(ward).trim()] },
        isDeleted: false
      });

      resident = residentsInWard.find(r => normalizeName(r.name) === normalizeName(name));
    }

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'No matching resident profile found in the village directory with the provided details.',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    // Check if resident is already linked to a user account
    const residentLinked = await User.findOne({ residentProfile: resident._id });
    if (residentLinked) {
      return res.status(400).json({
        success: false,
        message: 'This resident profile is already linked to another user account',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      residentProfile: resident._id,
      roles: ['Resident']
    });

    // Link the resident profile to the user, and optionally update mobile
    resident.ownerId = user._id;
    if (mobile && mobile.trim()) {
      // Only update if resident doesn't already have a mobile number, or always override
      resident.mobile = mobile.trim().replace(/^\+91\s?/, '').replace(/\s/g, '');
    }
    await resident.save();

    // Generate token
    const token = signToken(user._id);

    const welcomeMessage = `नमस्ते, ${resident.name}! डिजिटल पटेरी स्मार्ट विलेज पोर्टल पर आपका हार्दिक स्वागत है। 🌟\nगाँव के विकास, योजनाओं और सुविधाओं से जुड़ने के लिए धन्यवाद। आइये मिलकर पटेरी को एक आदर्श और डिजिटल गाँव बनायें।`;

    res.status(201).json({
      success: true,
      welcomeMessage,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          roles: user.roles,
          residentProfile: resident
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password').populate('residentProfile');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
        errorCode: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
        errorCode: 'UNAUTHORIZED_ACCESS'
      });
    }

    // Generate token
    const token = signToken(user._id);

    const name = user.residentProfile ? user.residentProfile.name : 'Citizen';
    const welcomeMessage = `नमस्ते, ${name}! डिजिटल पटेरी स्मार्ट विलेज पोर्टल पर आपका हार्दिक स्वागत है। 🌟\nगाँव के विकास, योजनाओं और सुविधाओं से जुड़ने के लिए धन्यवाद। आइये मिलकर पटेरी को एक आदर्श और डिजिटल गाँव बनायें।`;

    res.status(200).json({
      success: true,
      welcomeMessage,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          roles: user.roles,
          residentProfile: user.residentProfile
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user session
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('residentProfile');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request OTP for login/claim profile
// @route   POST /api/v1/auth/otp/request
// @access  Public
exports.requestOtp = async (req, res, next) => {
  try {
    const { mobile, residentId } = req.body;
    let resident;
    
    if (residentId) {
      resident = await Resident.findOne({ residentId, isDeleted: false });
      if (!resident) {
        return res.status(404).json({ success: false, message: 'Resident ID not found' });
      }
    } else if (mobile) {
      resident = await Resident.findOne({ mobile, isDeleted: false });
      if (!resident) {
        return res.status(404).json({ success: false, message: 'Mobile number not found in directory' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Please provide mobile or residentId' });
    }

    const regMobile = resident.mobile;
    const maskedMobile = regMobile.slice(0, 3) + '******' + regMobile.slice(-2);
    
    // Store mock OTP
    const otp = '123456';
    otpStore.set(regMobile, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      residentId: resident.residentId
    });

    res.status(200).json({
      success: true,
      message: `OTP sent successfully to ${maskedMobile}`,
      mobile: regMobile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP for login/claim profile
// @route   POST /api/v1/auth/otp/verify
// @access  Public
exports.verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp, aadhaarLast4 } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide mobile and otp' });
    }

    const storedData = otpStore.get(mobile);
    if (!storedData || storedData.otp !== otp || Date.now() > storedData.expiresAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    const resident = await Resident.findOne({ residentId: storedData.residentId, isDeleted: false });
    if (!resident) {
      return res.status(404).json({ success: false, message: 'Resident not found' });
    }

    // Check if resident already has an owner
    let user;
    if (resident.ownerId) {
      user = await User.findById(resident.ownerId);
    }

    if (!user) {
      // First time claiming! Require Aadhaar Last 4 verification
      if (!aadhaarLast4) {
        return res.status(200).json({ 
          success: true, 
          needsAadhaar: true,
          message: 'First time claiming profile. Please verify with Aadhaar Last 4 digits.' 
        });
      }
      
      if (resident.aadhaarLast4 !== aadhaarLast4) {
        return res.status(400).json({ success: false, message: 'Aadhaar Last 4 digits do not match our records.' });
      }

      // Create a new User account dynamically
      const email = `${resident.residentId.toLowerCase()}@digitalpateri.in`;
      const tempPassword = Math.random().toString(36).slice(-8); // random password
      
      user = await User.create({
        email,
        password: tempPassword,
        residentProfile: resident._id,
        roles: ['Resident']
      });

      resident.ownerId = user._id;
      resident.verificationStatus = 'verified'; // Mark as verified
      await resident.save();
    }

    // Clear OTP
    otpStore.delete(mobile);

    // Sign token
    const token = signToken(user._id);

    const name = resident ? resident.name : 'Citizen';
    const welcomeMessage = `नमस्ते, ${name}! डिजिटल पटेरी स्मार्ट विलेज पोर्टल पर आपका हार्दिक स्वागत है। 🌟\nगाँव के विकास, योजनाओं और सुविधाओं से जुड़ने के लिए धन्यवाद। आइये मिलकर पटेरी को एक आदर्श और डिजिटल गाँव बनायें।`;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      welcomeMessage,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          roles: user.roles,
          residentProfile: resident
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
