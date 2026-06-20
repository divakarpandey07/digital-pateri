const Village = require('../models/Village');
const SiteConfig = require('../models/SiteConfig');
const Resident = require('../models/Resident');
const Complaint = require('../models/Complaint');
const BloodDonor = require('../models/BloodDonor');
const Job = require('../models/Job');
const VillageAsset = require('../models/VillageAsset');

// @desc    Get active villages
// @route   GET /api/v1/villages
// @access  Public
exports.getVillages = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await Village.countDocuments({ isActive: true });
    const villages = await Village.find({ isActive: true })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        records: villages,
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

// @desc    Get single village profile + configs + statistics
// @route   GET /api/v1/villages/:id
// @access  Public
exports.getVillageDetails = async (req, res, next) => {
  try {
    const villageId = req.params.id;

    // Find village
    const village = await Village.findById(villageId);
    if (!village || !village.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Village not found or inactive',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Find config
    const config = await SiteConfig.findOne({ villageId });

    // Calculate real-time KPI numbers for dashboard
    const totalResidents = await Resident.countDocuments({ villageId, isDeleted: false, verificationStatus: true });
    
    // Families count (using unique fatherNames or approximate head count)
    const totalFamilies = await Resident.countDocuments({ 
      villageId, 
      isDeleted: false, 
      relations: { $elemMatch: { relationType: 'Child' } } 
    }) + 1; // Seed fallback approximation

    const activeComplaints = await Complaint.countDocuments({ 
      villageId, 
      status: { $in: ['Pending', 'In Progress'] }, 
      isDeleted: false 
    });

    const totalDonors = await BloodDonor.countDocuments({ 
      villageId, 
      availabilityStatus: true, 
      isDeleted: false 
    });

    const totalJobs = await Job.countDocuments({ 
      villageId, 
      isDeleted: false 
    });

    res.status(200).json({
      success: true,
      data: {
        village,
        config,
        statistics: {
          totalResidents,
          totalFamilies: Math.max(totalFamilies, 1),
          activeComplaints,
          totalDonors,
          totalJobs
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get village assets list
// @route   GET /api/v1/villages/:id/assets
// @access  Public
exports.getVillageAssets = async (req, res, next) => {
  try {
    const assets = await VillageAsset.find({ villageId: req.params.id });
    res.status(200).json({
      success: true,
      data: assets
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get village historical timeline milestones
// @route   GET /api/v1/villages/:id/timeline
// @access  Public
exports.getVillageTimeline = async (req, res, next) => {
  try {
    const Timeline = require('../models/Timeline');
    const milestones = await Timeline.find({ villageId: req.params.id }).sort({ year: 1 });
    res.status(200).json({
      success: true,
      data: milestones
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get village achievement hall records
// @route   GET /api/v1/villages/:id/achievements
// @access  Public
exports.getVillageAchievements = async (req, res, next) => {
  try {
    const Achievement = require('../models/Achievement');
    const achievements = await Achievement.find({ villageId: req.params.id })
      .populate({
        path: 'residentId',
        select: 'name occupation gender residentId'
      })
      .sort({ year: -1 });

    res.status(200).json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get village demographic stats
// @route   GET /api/v1/villages/:id/demographics
// @access  Public
exports.getDemographics = async (req, res, next) => {
  try {
    const villageId = req.params.id;
    const residents = await Resident.find({ villageId, isDeleted: false });

    // Total Population by Gender
    let maleCount = 0;
    let femaleCount = 0;
    let otherGenderCount = 0;

    // Education Distribution
    const eduCounts = {
      'Illiterate': 0,
      'Primary': 0,
      'High School': 0,
      'Graduate': 0,
      'Postgraduate': 0
    };

    // Employment Distribution
    const empCounts = {
      'Student': 0,
      'Farmer': 0,
      'Government Employee': 0,
      'Private Employee': 0,
      'Business': 0,
      'Retired': 0,
      'Other': 0
    };

    // Blood Groups Distribution
    const bloodCounts = {};

    // Age Distribution Ranges
    const ageRanges = {
      '0-18': 0,
      '18-35': 0,
      '35-50': 0,
      '50-65': 0,
      '65+': 0
    };

    const currentYear = 2026;

    residents.forEach(res => {
      // Gender
      if (res.gender === 'Male') maleCount++;
      else if (res.gender === 'Female') femaleCount++;
      else otherGenderCount++;

      // Education (normalize strings)
      const edu = res.education || 'Primary';
      if (edu.includes('Postgraduate') || edu.includes('Post Graduate') || edu.includes('PG')) {
        eduCounts['Postgraduate']++;
      } else if (edu.includes('Graduate') || edu.includes('Degree') || edu.includes('UG')) {
        eduCounts['Graduate']++;
      } else if (edu.includes('High') || edu.includes('10th') || edu.includes('12th') || edu.includes('Intermediate') || edu.includes('Matric')) {
        eduCounts['High School']++;
      } else if (edu.includes('Primary') || edu.includes('Middle') || edu.includes('School')) {
        eduCounts['Primary']++;
      } else {
        eduCounts['Illiterate']++;
      }

      // Employment / Occupation
      const occ = (res.occupation || '').toLowerCase();
      if (occ.includes('student') || occ.includes('study')) {
        empCounts['Student']++;
      } else if (occ.includes('farmer') || occ.includes('agriculture') || occ.includes('kheti') || occ.includes('krishi')) {
        empCounts['Farmer']++;
      } else if (occ.includes('government') || occ.includes('sarkari') || occ.includes('officer') || occ.includes('teacher') || occ.includes('secretary') || occ.includes('police') || occ.includes('army') || occ.includes('defense') || occ.includes('mukhiya') || occ.includes('sarpanch')) {
        empCounts['Government Employee']++;
      } else if (occ.includes('private') || occ.includes('company') || occ.includes('employee') || occ.includes('labor') || occ.includes('driver')) {
        empCounts['Private Employee']++;
      } else if (occ.includes('business') || occ.includes('shop') || occ.includes('owner') || occ.includes('merchant') || occ.includes('retailer') || occ.includes('vyapari') || occ.includes('dealer')) {
        empCounts['Business']++;
      } else if (occ.includes('retired') || occ.includes('pension')) {
        empCounts['Retired']++;
      } else {
        empCounts['Other']++;
      }

      // Blood group
      const bg = res.bloodGroup || 'Unknown';
      bloodCounts[bg] = (bloodCounts[bg] || 0) + 1;

      // Age
      if (res.dob) {
        const age = currentYear - new Date(res.dob).getFullYear();
        if (age <= 18) ageRanges['0-18']++;
        else if (age <= 35) ageRanges['18-35']++;
        else if (age <= 50) ageRanges['35-50']++;
        else if (age <= 65) ageRanges['50-65']++;
        else ageRanges['65+']++;
      } else {
        ageRanges['18-35']++;
      }
    });

    // Housing statistics
    const totalHouses = 280; 
    const occupiedHousesList = [...new Set(residents.map(r => r.houseNo).filter(h => h && h !== 'Pending'))];
    const occupiedHouses = occupiedHousesList.length;
    const emptyHouses = Math.max(totalHouses - occupiedHouses, 0);

    res.status(200).json({
      success: true,
      data: {
        gender: { male: maleCount, female: femaleCount, other: otherGenderCount },
        education: eduCounts,
        employment: empCounts,
        bloodGroups: bloodCounts,
        ageGroups: ageRanges,
        housing: { totalHouses, occupiedHouses, emptyHouses }
      }
    });
  } catch (error) {
    next(error);
  }
};
