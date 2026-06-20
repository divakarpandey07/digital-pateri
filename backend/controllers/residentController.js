const Resident = require('../models/Resident');

const filterResidentFields = (resident, user) => {
  if (!resident) return null;
  const isAdmin = user && user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));
  const isOwner = user && user.residentProfile && user.residentProfile.toString() === resident._id.toString();

  const obj = resident.toObject ? resident.toObject() : resident;
  
  // Admin or profile owner → full data
  if (isAdmin || isOwner) {
    return obj;
  }
  
  if (user) {
    // Any logged-in resident → all standard profile info (no sensitive govt IDs)
    return {
      _id: obj._id,
      residentId: obj.residentId,
      name: obj.name,
      fatherName: obj.fatherName,
      dob: obj.dob,
      gender: obj.gender,
      occupation: obj.occupation,
      education: obj.education,
      bloodGroup: obj.bloodGroup,
      skills: obj.skills,
      ward: obj.ward,
      houseNo: obj.houseNo,
      address: obj.address,
      mohalla: obj.mohalla,
      mobile: obj.mobile,
      reputationPoints: obj.reputationPoints,
      verificationStatus: obj.verificationStatus,
      panchayatRole: obj.panchayatRole,
      photo: obj.photo,
      latitude: obj.latitude,
      longitude: obj.longitude,
      relations: obj.relations,
      isPublicProfile: obj.isPublicProfile
    };
  }
  
  // Guest: only basic public info
  return {
    _id: obj._id,
    name: obj.name,
    gender: obj.gender,
    occupation: obj.occupation,
    ward: obj.ward,
    verificationStatus: obj.verificationStatus,
    panchayatRole: obj.panchayatRole,
    photo: obj.photo
  };
};

// @desc    Get residents directory
// @route   GET /api/v1/residents
// @access  Public (Privacy-filtered) / Private (Admin views all)
exports.getResidents = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort || 'name';

    // Base query filters out soft-deleted records
    let queryObj = { isDeleted: false };

    // Standard User Privacy Rule: Only admins see non-public profiles
    const isAdmin = req.user && req.user.roles.some(role => ['Super Admin', 'Panchayat Admin'].includes(role));
    if (!isAdmin) {
      queryObj.isPublicProfile = true;
    }

    // Tenant Village Filter
    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }

    // Filter by Mohalla
    if (req.query.mohalla) {
      queryObj.mohalla = req.query.mohalla;
    }

    // Filter by Occupation
    if (req.query.occupation) {
      if (req.query.occupation === 'Shop Owner') {
        queryObj.occupation = { $regex: /Shop|Manager|Owner/i };
      } else {
        queryObj.occupation = req.query.occupation;
      }
    }

    // Filter by Blood Group
    if (req.query.bloodGroup) {
      queryObj.bloodGroup = req.query.bloodGroup;
    }

    // Filter by Education
    if (req.query.education) {
      queryObj.education = req.query.education;
    }

    // Filter by Ward
    if (req.query.ward) {
      queryObj.ward = req.query.ward;
    }

    // Filter by House No
    if (req.query.houseNo) {
      queryObj.houseNo = req.query.houseNo;
    }

    // Filter by Resident ID
    if (req.query.residentId) {
      queryObj.residentId = req.query.residentId;
    }

    // Filter by Volunteer status / category
    if (req.query.isVolunteer === 'true' || req.query.volunteerType) {
      const Volunteer = require('../models/Volunteer');
      const vQuery = { isActive: true };
      if (req.query.volunteerType) {
        vQuery.category = req.query.volunteerType;
      }
      const volunteers = await Volunteer.find(vQuery);
      const volunteerResidentIds = volunteers.map(v => v.residentId);
      
      if (queryObj._id) {
        queryObj._id = { $and: [queryObj._id, { $in: volunteerResidentIds }] };
      } else {
        queryObj._id = { $in: volunteerResidentIds };
      }
    }

    // Filter by Blood Donor status
    if (req.query.isBloodDonor === 'true') {
      const BloodDonor = require('../models/BloodDonor');
      const donors = await BloodDonor.find({ availabilityStatus: true, isDeleted: false });
      const donorResidentIds = donors.map(d => d.residentId);
      
      if (queryObj._id) {
        if (queryObj._id.$in) {
          const existingIds = queryObj._id.$in;
          queryObj._id = { $in: existingIds.filter(id => donorResidentIds.some(did => did.toString() === id.toString())) };
        } else {
          queryObj._id = { $and: [queryObj._id, { $in: donorResidentIds }] };
        }
      } else {
        queryObj._id = { $in: donorResidentIds };
      }
    }

    // Search query (Regex search on name for exact/partial substring match)
    if (req.query.search) {
      queryObj.name = { $regex: req.query.search, $options: 'i' };
    }

    const total = await Resident.countDocuments(queryObj);
    const residents = await Resident.find(queryObj)
      .sort(sortField)
      .skip(skip)
      .limit(limit);

    const filteredResidents = residents.map(r => filterResidentFields(r, req.user));

    res.status(200).json({
      success: true,
      data: {
        records: filteredResidents,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resident profile with relations populated
// @route   GET /api/v1/residents/:id
// @access  Public (Privacy-enforced)
exports.getResidentById = async (req, res, next) => {
  try {
    const resident = await Resident.findOne({ _id: req.params.id, isDeleted: false })
      .populate('relations.relativeId', 'name residentId photo occupation');

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident profile not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Access control: Non-public profiles visible only to owners or admins
    const isAdmin = req.user && req.user.roles.some(role => ['Super Admin', 'Panchayat Admin'].includes(role));
    const isOwner = req.user && req.user.residentProfile && req.user.residentProfile.toString() === resident._id.toString();

    if (!resident.isPublicProfile && !isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'This profile is set to private by the resident',
        errorCode: 'FORBIDDEN_OPERATION'
      });
    }

    const filtered = filterResidentFields(resident, req.user);

    res.status(200).json({
      success: true,
      data: filtered
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create resident profile
// @route   POST /api/v1/residents
// @access  Private (Panchayat Admin or Registered User)
exports.createResident = async (req, res, next) => {
  try {
    const { 
      villageId, name, fatherName, dob, gender, address, mohalla, 
      ward, occupation, skills, education, bloodGroup, mobile, 
      emergencyContact, photo, isPublicProfile 
    } = req.body;

    if (!villageId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Village ID and resident Name are required',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    // Generate unique Resident ID: PAT-XXXXXX
    const count = await Resident.countDocuments({});
    const padNum = String(count + 1).padStart(6, '0');
    const residentId = `PAT-${padNum}`;

    const resident = await Resident.create({
      villageId,
      residentId,
      name,
      fatherName,
      dob,
      gender,
      address,
      mohalla,
      ward,
      occupation,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      education,
      bloodGroup,
      mobile,
      emergencyContact,
      photo: photo || '',
      isPublicProfile: isPublicProfile !== undefined ? isPublicProfile : true
    });

    res.status(201).json({
      success: true,
      data: resident
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resident profile
// @route   PUT /api/v1/residents/:id
// @access  Private (Admin: any field | Owner: limited fields)
exports.updateResident = async (req, res, next) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident || resident.isDeleted) {
      return res.status(404).json({ success: false, message: 'Resident profile not found', errorCode: 'RESOURCE_NOT_FOUND' });
    }

    const isAdmin = req.user && req.user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));
    const isOwner = req.user && req.user.residentProfile && req.user.residentProfile.toString() === resident._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile', errorCode: 'FORBIDDEN_OPERATION' });
    }

    // Admin can update all fields; owner gets a restricted list
    const adminFields = [
      'name', 'fatherName', 'dob', 'gender', 'address', 'mohalla', 'ward', 'houseNo',
      'occupation', 'skills', 'education', 'bloodGroup', 'mobile', 'emergencyContact',
      'photo', 'isPublicProfile', 'panchayatRole', 'verificationStatus', 'reputationPoints',
      'aadhaarLast4', 'voterId', 'rationCardNumber', 'cardType', 'fpsDealer', 'familyId',
      'latitude', 'longitude'
    ];

    const ownerFields = [
      'occupation', 'skills', 'education', 'bloodGroup', 'mobile', 'emergencyContact', 'photo', 'isPublicProfile'
    ];

    const allowedFields = isAdmin ? adminFields : ownerFields;
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        resident[field] = req.body[field];
      }
    });

    await resident.save();

    res.status(200).json({ success: true, data: resident });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft Delete resident profile
// @route   DELETE /api/v1/residents/:id
// @access  Private (Panchayat Admin / Super Admin)
exports.deleteResident = async (req, res, next) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident || resident.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Resident profile not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    resident.isDeleted = true;
    resident.deletedAt = new Date();
    await resident.save();

    res.status(200).json({
      success: true,
      message: 'Resident profile soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const otpStore = new Map();

// @desc    Request OTP for claiming resident profile
// @route   POST /api/v1/residents/claim/request-otp
// @access  Public
exports.requestClaimOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const resident = await Resident.findOne({ mobile, isDeleted: false });
    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'No resident profile found with this mobile number in Pateri records.',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    if (resident.ownerId) {
      return res.status(400).json({
        success: false,
        message: 'This resident profile has already been claimed.',
        errorCode: 'CLAIM_ALREADY_EXISTS'
      });
    }

    const otp = '123456';
    
    otpStore.set(mobile, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      attempts: 0
    });

    const AuditLog = require('../models/AuditLog');
    await AuditLog.create({
      action: 'CLAIM_REQUEST_OTP',
      details: `OTP requested for mobile: ${mobile}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully (Mock OTP is 123456)',
      otp: otp
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP and claim resident profile
// @route   POST /api/v1/residents/claim/verify
// @access  Private
exports.verifyAndClaimResident = async (req, res, next) => {
  try {
    const { mobile, otp, aadhaarLast4 } = req.body;
    const User = require('../models/User');
    const AuditLog = require('../models/AuditLog');

    if (!mobile || !otp || !aadhaarLast4) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number, OTP, and Aadhaar Last 4 digits are required',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const storedData = otpStore.get(mobile);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP request found for this mobile number.',
        errorCode: 'OTP_EXPIRED_OR_INVALID'
      });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
        errorCode: 'OTP_EXPIRED_OR_INVALID'
      });
    }

    if (storedData.attempts >= 3) {
      otpStore.delete(mobile);
      return res.status(429).json({
        success: false,
        message: 'Too many failed OTP attempts. This session is locked. Request a new OTP.',
        errorCode: 'OTP_ATTEMPT_LIMIT_EXCEEDED'
      });
    }

    if (otp !== storedData.otp) {
      storedData.attempts += 1;
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.`,
        errorCode: 'OTP_EXPIRED_OR_INVALID'
      });
    }

    const resident = await Resident.findOne({ mobile, aadhaarLast4, isDeleted: false });
    if (!resident) {
      storedData.attempts += 1;
      return res.status(404).json({
        success: false,
        message: 'Identity mismatch. Mobile and Aadhaar last 4 digits do not match our verified records.',
        errorCode: 'IDENTITY_MISMATCH'
      });
    }

    if (resident.ownerId && resident.ownerId.toString() !== req.user._id.toString()) {
      otpStore.delete(mobile);
      return res.status(400).json({
        success: false,
        message: 'This resident profile has already been claimed by another user.',
        errorCode: 'CLAIM_ALREADY_EXISTS'
      });
    }

    otpStore.delete(mobile);

    resident.ownerId = req.user._id;
    resident.verificationStatus = true;
    await resident.save();

    const user = await User.findById(req.user._id);
    user.residentProfile = resident._id;
    if (!user.roles.includes('Resident')) {
      user.roles.push('Resident');
    }
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'CLAIM_VERIFY_SUCCESS',
      details: `Profile claimed successfully. ResidentId: ${resident.residentId}, UserId: ${user._id}`,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Profile claimed and verified successfully!',
      data: {
        user: {
          _id: user._id,
          email: user.email,
          roles: user.roles,
          residentProfile: user.residentProfile
        },
        resident
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's claimed resident profile with family members & activity history
// @route   GET /api/v1/residents/me
// @access  Private
exports.getMeResident = async (req, res, next) => {
  try {
    if (!req.user || !req.user.residentProfile) {
      return res.status(400).json({
        success: false,
        message: 'You have not claimed a resident profile yet.',
        errorCode: 'PROFILE_NOT_CLAIMED'
      });
    }

    const resident = await Resident.findById(req.user.residentProfile);
    if (!resident || resident.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Resident profile not found.',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    let familyMembers = [];
    if (resident.familyId) {
      familyMembers = await Resident.find({ 
        familyId: resident.familyId, 
        _id: { $ne: resident._id },
        isDeleted: false 
      }).select('name residentId gender age occupation relationType');
    }

    const Complaint = require('../models/Complaint');
    const VolunteerRequest = require('../models/VolunteerRequest');
    const CertificateRequest = require('../models/CertificateRequest');

    const complaints = await Complaint.find({ residentId: resident._id }).select('title category status createdAt');
    const certificates = await CertificateRequest.find({ residentId: resident._id }).select('type status reason createdAt');

    const Volunteer = require('../models/Volunteer');
    const volunteerNode = await Volunteer.findOne({ residentId: resident._id });
    let volunteerActivities = [];
    if (volunteerNode) {
      volunteerActivities = await VolunteerRequest.find({ 
        assignedVolunteerId: volunteerNode._id 
      }).select('title category status priority createdAt');
    }

    res.status(200).json({
      success: true,
      data: {
        profile: resident,
        familyMembers,
        activities: {
          complaints,
          certificates,
          volunteer: volunteerActivities,
          isVolunteer: !!volunteerNode
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public resident profile details (filtered for QR Scan results)
// @route   GET /api/v1/residents/public/:residentId
// @access  Public
exports.getPublicResidentProfile = async (req, res, next) => {
  try {
    const { residentId } = req.params;

    const resident = await Resident.findOne({ residentId, isDeleted: false });

    if (!resident) {
      return res.status(404).json({
        success: false,
        message: 'Resident profile not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    const publicProfile = {
      residentId: resident.residentId,
      name: resident.name,
      gender: resident.gender,
      age: resident.age || (resident.dob ? (2026 - resident.dob.getFullYear()) : null),
      ward: resident.ward,
      houseNo: resident.houseNo || '',
      address: resident.address,
      occupation: resident.occupation,
      education: resident.education,
      verificationStatus: resident.verificationStatus,
      createdAt: resident.createdAt
    };

    const User = require('../models/User');
    const Volunteer = require('../models/Volunteer');
    const BloodDonor = require('../models/BloodDonor');

    const badges = {
      isVerifiedResident: resident.verificationStatus === true,
      isVolunteer: false,
      isBloodDonor: false,
      isOfficial: false
    };

    const isVolunteer = await Volunteer.exists({ residentId: resident._id, isActive: true });
    badges.isVolunteer = !!isVolunteer;

    const isBloodDonor = await BloodDonor.exists({ residentId: resident._id, isDeleted: false });
    badges.isBloodDonor = !!isBloodDonor;

    if (resident.ownerId) {
      const user = await User.findById(resident.ownerId);
      if (user && user.roles.some(role => ['Super Admin', 'Panchayat Admin'].includes(role))) {
        badges.isOfficial = true;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        profile: publicProfile,
        badges
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Lodge a digital certificate request
// @route   POST /api/v1/residents/certificates
// @access  Private
exports.requestCertificate = async (req, res, next) => {
  try {
    const { type, reason, details } = req.body;
    const CertificateRequest = require('../models/CertificateRequest');
    const AuditLog = require('../models/AuditLog');

    if (!req.user || !req.user.residentProfile) {
      return res.status(400).json({
        success: false,
        message: 'You must claim a resident profile before requesting certificates.',
        errorCode: 'PROFILE_NOT_CLAIMED'
      });
    }

    if (!type || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Certificate type and reason are required',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const certRequest = await CertificateRequest.create({
      residentId: req.user.residentProfile,
      type,
      reason,
      details: details || {}
    });

    await AuditLog.create({
      userId: req.user._id,
      action: 'CERTIFICATE_REQUEST',
      details: `Certificate of type ${type} requested by Resident: ${req.user.residentProfile}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Certificate request submitted successfully!',
      data: certRequest
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Panchayat leadership and staff
// @route   GET /api/v1/residents/leadership
// @access  Public
exports.getLeadership = async (req, res, next) => {
  try {
    const leadership = await Resident.find({
      isDeleted: false,
      panchayatRole: { $ne: 'None' }
    });

    const mukhiya = leadership.find(r => r.panchayatRole === 'Mukhiya');
    const sarpanch = leadership.find(r => r.panchayatRole === 'Sarpanch');
    const pacsAdhyaksh = leadership.find(r => r.panchayatRole === 'PACS Adhyaksh');
    const wardMembers = leadership.filter(r => r.panchayatRole === 'Ward Member').sort((a, b) => parseInt(a.ward) - parseInt(b.ward));
    const staff = leadership.filter(r => r.panchayatRole === 'Panchayat Staff');

    res.status(200).json({
      success: true,
      data: {
        mukhiya,
        sarpanch,
        pacsAdhyaksh,
        wardMembers,
        staff
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get houses map data
// @route   GET /api/v1/residents/houses
// @access  Public
exports.getHousesMapData = async (req, res, next) => {
  try {
    const residents = await Resident.find({ isDeleted: false, houseNo: { $exists: true, $ne: 'Pending' } });
    
    // Group residents by houseNo
    const housesMap = {};
    
    // Centroid of Pateri
    const baseLat = 25.0210;
    const baseLng = 83.5684;
    
    residents.forEach(r => {
      if (!r.houseNo) return;
      if (!housesMap[r.houseNo]) {
        housesMap[r.houseNo] = {
          houseNo: r.houseNo,
          residents: [],
          ward: r.ward,
          latitude: r.latitude,
          longitude: r.longitude
        };
      }
      housesMap[r.houseNo].residents.push(r);
    });

    const houseRecords = Object.values(housesMap).map((house, idx) => {
      let latitude = house.latitude;
      let longitude = house.longitude;
      
      // If coordinates are not set, fall back to deterministic offset based on houseNo hash
      if (!latitude || !longitude) {
        let hash = 0;
        for (let i = 0; i < house.houseNo.length; i++) {
          hash = house.houseNo.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Spread houses in a radius around Pateri centroid
        const angle = (hash % 360) * (Math.PI / 180);
        const radius = 0.0005 + ((Math.abs(hash) % 100) * 0.00001); // 50m to 150m radius
        
        latitude = baseLat + (Math.cos(angle) * radius);
        longitude = baseLng + (Math.sin(angle) * radius);
      }
      
      // Determine Head of Family: oldest resident in the house
      const sortedByAge = [...house.residents].sort((a, b) => {
        const ageA = a.dob ? (new Date().getFullYear() - new Date(a.dob).getFullYear()) : 0;
        const ageB = b.dob ? (new Date().getFullYear() - new Date(b.dob).getFullYear()) : 0;
        return ageB - ageA;
      });
      const headOfFamily = sortedByAge[0] ? sortedByAge[0].name : 'N/A';
      
      const verifiedResidents = house.residents.filter(r => r.verificationStatus === 'verified').length;
      
      return {
        houseNo: house.houseNo,
        latitude,
        longitude,
        residentsCount: house.residents.length,
        headOfFamily,
        verifiedResidents,
        ward: house.ward
      };
    });

    res.status(200).json({
      success: true,
      data: houseRecords
    });
  } catch (error) {
    next(error);
  }
};
