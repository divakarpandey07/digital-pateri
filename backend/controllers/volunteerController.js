const Volunteer = require('../models/Volunteer');
const VolunteerRequest = require('../models/VolunteerRequest');
const Resident = require('../models/Resident');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Register or update volunteer status
// @route   POST /api/v1/volunteers
// @access  Private
exports.registerVolunteer = async (req, res, next) => {
  try {
    const { skills, availability, category, phoneVisible } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide volunteer category',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    if (!req.user.residentProfile) {
      return res.status(400).json({
        success: false,
        message: 'Resident profile not linked to user account. Please register your resident profile first.',
        errorCode: 'PROFILE_NOT_LINKED'
      });
    }

    const resident = await Resident.findById(req.user.residentProfile);
    if (!resident || resident.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Linked resident profile not found in directory',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    let volunteer = await Volunteer.findOne({ userId: req.user._id });

    if (volunteer) {
      // Update existing volunteer details
      volunteer.skills = skills || volunteer.skills;
      volunteer.availability = availability || volunteer.availability;
      volunteer.category = category || volunteer.category;
      volunteer.phoneVisible = phoneVisible !== undefined ? phoneVisible : volunteer.phoneVisible;
      await volunteer.save();
    } else {
      // Create new volunteer entry
      volunteer = await Volunteer.create({
        userId: req.user._id,
        residentId: resident._id,
        villageId: resident.villageId,
        skills,
        availability,
        category,
        phoneVisible: phoneVisible !== undefined ? phoneVisible : true
      });

      // Update user roles
      const user = await User.findById(req.user._id);
      if (!user.roles.includes('Volunteer')) {
        user.roles.push('Volunteer');
        await user.save();
      }

      // Award 25 reputation points
      resident.reputationPoints = (resident.reputationPoints || 0) + 25;
      await resident.save();
    }

    res.status(200).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer network directory
// @route   GET /api/v1/volunteers
// @access  Public
exports.getVolunteers = async (req, res, next) => {
  try {
    let queryObj = { isActive: true };

    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }
    if (req.query.category) {
      queryObj.category = req.query.category;
    }
    if (req.query.availability) {
      queryObj.availability = req.query.availability;
    }
    if (req.query.skill) {
      queryObj.skills = { $regex: req.query.skill, $options: 'i' };
    }

    const volunteers = await Volunteer.find(queryObj)
      .populate({
        path: 'residentId',
        select: 'name mobile photo occupation skills bloodGroup isPublicProfile'
      })
      .populate('userId', 'email');

    // Clean up visibility constraints (mask mobile numbers if phoneVisible is false)
    const cleanedVolunteers = volunteers.map(v => {
      const vObj = v.toObject();
      if (!vObj.phoneVisible && vObj.residentId) {
        vObj.residentId.mobile = 'Hidden';
      }
      return vObj;
    });

    // Sort Divakar Pandey to the very top
    cleanedVolunteers.sort((a, b) => {
      const aName = a.residentId && a.residentId.name ? a.residentId.name : '';
      const bName = b.residentId && b.residentId.name ? b.residentId.name : '';
      if (aName === 'Divakar Pandey') return -1;
      if (bName === 'Divakar Pandey') return 1;
      return 0;
    });

    res.status(200).json({
      success: true,
      data: cleanedVolunteers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volunteer help request tickets
// @route   GET /api/v1/volunteers/requests
// @access  Public
exports.getVolunteerRequests = async (req, res, next) => {
  try {
    let queryObj = {};

    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }
    if (req.query.status) {
      queryObj.status = req.query.status;
    }
    if (req.query.priority) {
      queryObj.priority = req.query.priority;
    }

    const requests = await VolunteerRequest.find(queryObj)
      .sort('-createdAt')
      .populate({
        path: 'requestedBy',
        select: 'email residentProfile',
        populate: {
          path: 'residentProfile',
          select: 'name mobile'
        }
      })
      .populate({
        path: 'assignedVolunteer',
        select: 'email residentProfile',
        populate: {
          path: 'residentProfile',
          select: 'name mobile'
        }
      });

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit a help request ticket
// @route   POST /api/v1/volunteers/requests
// @access  Private
exports.createVolunteerRequest = async (req, res, next) => {
  try {
    const { villageId, title, description, priority } = req.body;

    if (!villageId || !title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide villageId, title, and description',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const request = await VolunteerRequest.create({
      villageId,
      title,
      description,
      priority: priority || 'Medium',
      requestedBy: req.user._id,
      status: 'Pending'
    });

    // Notify volunteers
    await Notification.create({
      isGlobal: true,
      title: `Volunteer Assistance Request: ${priority || 'Medium'}`,
      message: `Help needed: "${title}". Description: ${description.substring(0, 100)}...`,
      type: 'Notice',
      link: '/volunteer'
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a help request (assignment/completion)
// @route   PATCH /api/v1/volunteers/requests/:id
// @access  Private
exports.updateVolunteerRequest = async (req, res, next) => {
  try {
    const { status, assignedVolunteer } = req.body;
    let request = await VolunteerRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer request not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    if (assignedVolunteer) {
      // Ensure volunteer user exists
      const volunteerUser = await User.findById(assignedVolunteer);
      if (!volunteerUser) {
        return res.status(404).json({
          success: false,
          message: 'Selected volunteer user not found',
          errorCode: 'RESOURCE_NOT_FOUND'
        });
      }
      request.assignedVolunteer = assignedVolunteer;
    }

    if (status) {
      if (!['Pending', 'Assigned', 'Completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value',
          errorCode: 'VALIDATION_FAILED'
        });
      }
      request.status = status;

      if (status === 'Completed') {
        request.completedAt = Date.now();
        if (request.assignedVolunteer) {
          const volObj = await Volunteer.findOne({ userId: request.assignedVolunteer });
          if (volObj) {
            const resProfile = await Resident.findById(volObj.residentId);
            if (resProfile) {
              resProfile.reputationPoints = (resProfile.reputationPoints || 0) + 25;
              await resProfile.save();
            }
          }
        }
      }
    }

    await request.save();

    res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    next(error);
  }
};
