const EmergencyLog = require('../models/EmergencyLog');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

// @desc    Trigger emergency SOS log & notifications
// @route   POST /api/v1/sos/trigger
// @access  Public (Optional Auth)
exports.triggerEmergencySOS = async (req, res, next) => {
  try {
    const { category, latitude, longitude } = req.body;

    if (!category || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide emergency category, latitude, and longitude'
      });
    }

    const senderId = req.user ? req.user._id : undefined;

    // 1. Create database log in EmergencyLog
    const sosLog = await EmergencyLog.create({
      category,
      latitude,
      longitude,
      senderId
    });

    // 2. Create Audit Log
    await AuditLog.create({
      userId: senderId,
      action: 'SOS_TRIGGERED',
      details: `Emergency category ${category} triggered at coords: ${latitude}, ${longitude}`,
      ipAddress: req.ip
    });

    // 3. Create global high-priority Notification for admins and volunteers
    const message = `🚨 EMERGENCY ALERT: A ${category} emergency has been triggered at Pateri GPS coordinates (${latitude}, ${longitude}). Please dispatch immediate assistance!`;
    
    await Notification.create({
      isGlobal: true,
      title: `🚨 SOS EMERGENCY: ${category}`,
      message,
      type: 'Notice',
      link: '/sos'
    });

    res.status(201).json({
      success: true,
      message: 'SOS alert successfully logged and broadcasted to village emergency responders.',
      data: sosLog
    });
  } catch (error) {
    next(error);
  }
};
