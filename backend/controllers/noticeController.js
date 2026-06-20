const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');

// @desc    Get notices / announcements
// @route   GET /api/v1/notices
// @access  Public
exports.getNotices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let queryObj = { 
      isDeleted: false,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    };

    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }

    const total = await Announcement.countDocuments(queryObj);
    const notices = await Announcement.find(queryObj)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        records: notices,
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

// @desc    Create an announcement notice
// @route   POST /api/v1/notices
// @access  Private (Panchayat Admin / Super Admin)
exports.createNotice = async (req, res, next) => {
  try {
    const { villageId, title, content, priority, expiresAt } = req.body;

    if (!villageId || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide villageId, title, and content',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const notice = await Announcement.create({
      villageId,
      title,
      content,
      priority: priority || 'Normal',
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      createdBy: req.user._id
    });

    // Create a global notification
    await Notification.create({
      isGlobal: true,
      title: 'New Panchayat Notice',
      message: `Announcement: "${title}" has been posted.`,
      type: 'Notice',
      link: '/notices'
    });

    res.status(201).json({
      success: true,
      data: notice
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete an announcement
// @route   DELETE /api/v1/notices/:id
// @access  Private (Panchayat Admin / Super Admin)
exports.deleteNotice = async (req, res, next) => {
  try {
    const notice = await Announcement.findById(req.params.id);
    if (!notice || notice.isDeleted) {
      return res.status(404).json({
        success: false,
        message: 'Notice announcement not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    notice.isDeleted = true;
    notice.deletedAt = new Date();
    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice announcement soft deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
