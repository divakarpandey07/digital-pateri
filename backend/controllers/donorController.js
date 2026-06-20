const BloodDonor = require('../models/BloodDonor');

// @desc    Get blood donors list
// @route   GET /api/v1/donors
// @access  Public
exports.getDonors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let queryObj = { 
      isDeleted: false,
      availabilityStatus: true 
    };

    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }
    if (req.query.bloodGroup) {
      queryObj.bloodGroup = req.query.bloodGroup;
    }

    const total = await BloodDonor.countDocuments(queryObj);
    const donors = await BloodDonor.find(queryObj)
      .populate({
        path: 'residentId',
        select: 'name mobile mohalla address'
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        records: donors,
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

// @desc    Toggle blood donor availability status
// @route   PATCH /api/v1/donors/availability
// @access  Private
exports.toggleAvailability = async (req, res, next) => {
  try {
    if (!req.user.residentProfile) {
      return res.status(400).json({
        success: false,
        message: 'No resident profile linked to user account to set blood donor status',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const donor = await BloodDonor.findOne({ 
      residentId: req.user.residentProfile, 
      isDeleted: false 
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'You are not registered as a blood donor',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    donor.availabilityStatus = !donor.availabilityStatus;
    await donor.save();

    res.status(200).json({
      success: true,
      data: donor
    });
  } catch (error) {
    next(error);
  }
};
