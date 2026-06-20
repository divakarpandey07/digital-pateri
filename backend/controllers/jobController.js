const Job = require('../models/Job');
const Notification = require('../models/Notification');

// @desc    Get job openings
// @route   GET /api/v1/jobs
// @access  Public
exports.getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let queryObj = { isDeleted: false };

    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }
    if (req.query.type) {
      queryObj.type = req.query.type;
    }

    const total = await Job.countDocuments(queryObj);
    const jobs = await Job.find(queryObj)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        records: jobs,
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

// @desc    Create a job opening
// @route   POST /api/v1/jobs
// @access  Private (Panchayat Admin / Super Admin)
exports.createJob = async (req, res, next) => {
  try {
    const { villageId, title, type, description, location, salary } = req.body;

    if (!villageId || !title || !type || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide villageId, title, type, and description',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const job = await Job.create({
      villageId,
      title,
      type,
      description,
      location,
      salary,
      postedBy: req.user._id
    });

    // Create a global notification
    await Notification.create({
      isGlobal: true,
      title: 'New Job Opening Posted',
      message: `New employment opportunity: "${title}" is now open. Category: ${type}`,
      type: 'Job',
      link: '/jobs'
    });

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete a job
// @route   DELETE /api/v1/jobs/:id
// @access  Private (Admin / Owner)
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job || job.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Job posting not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    job.isDeleted = true;
    job.deletedAt = new Date();
    await job.save();

    res.status(200).json({
      success: true,
      message: 'Job posting soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
