const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

// @desc    Get all village complaints
// @route   GET /api/v1/complaints
// @access  Public
exports.getComplaints = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const sortField = req.query.sort || '-createdAt';

    let queryObj = { isDeleted: false };

    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }
    if (req.query.status) {
      queryObj.status = req.query.status;
    }
    if (req.query.category) {
      queryObj.category = req.query.category;
    }
    if (req.query.priority) {
      queryObj.priority = req.query.priority;
    }

    const total = await Complaint.countDocuments(queryObj);
    const complaints = await Complaint.find(queryObj)
      .sort(sortField)
      .skip(skip)
      .limit(limit)
      .populate('userId', 'email');

    res.status(200).json({
      success: true,
      data: {
        records: complaints,
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

// @desc    Get single complaint details
// @route   GET /api/v1/complaints/:id
// @access  Public
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false })
      .populate('userId', 'email')
      .populate('statusHistory.updatedBy', 'email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    File a new complaint
// @route   POST /api/v1/complaints
// @access  Private
exports.createComplaint = async (req, res, next) => {
  try {
    const { villageId, title, description, category, priority, mohalla, ward, latitude, longitude, beforeImage } = req.body;

    if (!villageId || !title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide villageId, title, description, and category',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const complaint = await Complaint.create({
      villageId,
      userId: req.user._id,
      title,
      description,
      category,
      priority: priority || 'Medium',
      mohalla,
      ward,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      beforeImage: beforeImage || '',
      statusHistory: [{
        status: 'Pending',
        comment: 'Complaint filed successfully'
      }]
    });

    // Create a global notification
    await Notification.create({
      isGlobal: true,
      title: 'New Complaint Submitted',
      message: `A new ${category} complaint has been submitted: "${title}" in Mohalla ${mohalla || 'General'}`,
      type: 'Complaint',
      link: `/complaints/${complaint._id}`
    });

    res.status(201).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote/support a complaint
// @route   POST /api/v1/complaints/:id/upvote
// @access  Private
exports.upvoteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    const index = complaint.upvotes.indexOf(req.user._id);
    if (index === -1) {
      // Upvote
      complaint.upvotes.push(req.user._id);
    } else {
      // Remove upvote
      complaint.upvotes.splice(index, 1);
    }

    await complaint.save();

    res.status(200).json({
      success: true,
      data: {
        upvotesCount: complaint.upvotes.length,
        isUpvoted: index === -1
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status (Admin only)
// @route   PATCH /api/v1/complaints/:id/status
// @access  Private (Panchayat Admin / Super Admin)
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, comment, afterImage } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status parameter is required',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const complaint = await Complaint.findOne({ _id: req.params.id, isDeleted: false });
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    complaint.status = status;
    if (afterImage) complaint.afterImage = afterImage;

    // Append to history
    complaint.statusHistory.push({
      status,
      comment: comment || `Status updated to ${status}`,
      updatedBy: req.user._id
    });

    await complaint.save();

    // Send private notification to the complainant
    await Notification.create({
      userId: complaint.userId,
      title: `Complaint ${status}`,
      message: `Your complaint "${complaint.title}" is now "${status}". Comments: ${comment || 'No comments'}`,
      type: 'Complaint',
      link: `/complaints/${complaint._id}`
    });

    res.status(200).json({
      success: true,
      data: complaint
    });
  } catch (error) {
    next(error);
  }
};
