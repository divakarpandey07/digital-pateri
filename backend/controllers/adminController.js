const Village = require('../models/Village');
const SiteConfig = require('../models/SiteConfig');
const User = require('../models/User');
const Resident = require('../models/Resident');
const Complaint = require('../models/Complaint');
const BloodDonor = require('../models/BloodDonor');
const Announcement = require('../models/Announcement');
const Job = require('../models/Job');
const Timeline = require('../models/Timeline');
const Achievement = require('../models/Achievement');
const VillageAsset = require('../models/VillageAsset');
const KnowledgeBase = require('../models/KnowledgeBase');
const Business = require('../models/Business');
const Volunteer = require('../models/Volunteer');
const VolunteerRequest = require('../models/VolunteerRequest');
const Document = require('../models/Document');
const Scheme = require('../models/Scheme');
const Crop = require('../models/Crop');
const RegistryRecord = require('../models/RegistryRecord');
const { seedDatabase } = require('../scripts/seed');
const { importRationData } = require('../scripts/import_ration_data');

// @desc    Trigger Database Seeding
// @route   POST /api/v1/admin/seed
// @access  Private (Panchayat Admin / Super Admin)
// exports.triggerSeed = async (req, res, next) => {
exports.triggerSeed = async (req, res, next) => {
  try {
    console.log('Seeding triggered via Admin Controller API...');
    await seedDatabase();
    console.log('Importing ration card data via Admin Controller API...');
    await importRationData();
    res.status(200).json({
      success: true,
      message: 'Database seeded and ration cards imported successfully!'
    });
  } catch (error) {
    console.error('Database seeding/import failed via API:', error);
    res.status(500).json({
      success: false,
      message: 'Database seeding failed: ' + error.message
    });
  }
};

// @desc    Get aggregated admin dashboard KPIs and chart data
// @route   GET /api/v1/admin/dashboard
// @access  Private (Panchayat Admin / Super Admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Core KPIs
    const totalResidents = await Resident.countDocuments({ isDeleted: false });
    const totalComplaints = await Complaint.countDocuments({ isDeleted: false });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'Resolved', isDeleted: false });
    const totalBusinesses = await Business.countDocuments();
    const verifiedBusinesses = await Business.countDocuments({ verificationStatus: 'Verified' });
    const totalVolunteers = await Volunteer.countDocuments({ isActive: true });
    const totalBloodDonors = await BloodDonor.countDocuments({ availabilityStatus: true });

    // 2. Complaint Categories Distribution (for Recharts)
    const complaintCategories = await Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 3. Complaint Status Distribution
    const complaintStatus = await Complaint.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 4. Business Categories Distribution
    const businessCategories = await Business.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 5. Volunteer Categories Distribution
    const volunteerCategories = await Volunteer.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 6. Documents Stats
    const totalDocuments = await Document.countDocuments();
    const documentDownloadsAgg = await Document.aggregate([
      { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
    ]);
    const totalDownloads = documentDownloadsAgg.length > 0 ? documentDownloadsAgg[0].totalDownloads : 0;

    const documentCategories = await Document.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { name: '$_id', value: '$count', _id: 0 } }
    ]);

    // 7. Recent Complaints & Volunteer Requests
    const recentComplaintsList = await Complaint.find({ isDeleted: false })
      .sort('-createdAt')
      .limit(5)
      .populate('userId', 'email');

    const recentVolunteerRequests = await VolunteerRequest.find()
      .sort('-createdAt')
      .limit(5)
      .populate({
        path: 'requestedBy',
        select: 'email residentProfile',
        populate: {
          path: 'residentProfile',
          select: 'name'
        }
      });

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalResidents,
          totalComplaints,
          resolutionRate: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0,
          totalBusinesses,
          verifiedBusinesses,
          totalVolunteers,
          totalBloodDonors,
          totalDocuments,
          totalDownloads
        },
        demographics: {
          businessesByCategory: businessCategories,
          volunteersByCategory: volunteerCategories,
          documentsByCategory: documentCategories
        },
        complaints: {
          complaintsByCategory: complaintCategories,
          complaintsByStatus: complaintStatus,
          recent: recentComplaintsList,
          recentVolunteerRequests: recentVolunteerRequests
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download database backup (Admin only)
// @route   GET /api/v1/admin/backup
// @access  Private (Admin)
exports.getDatabaseBackup = async (req, res, next) => {
  try {
    const backupData = {
      timestamp: new Date(),
      residents: await Resident.find(),
      schemes: await Scheme.find(),
      crops: await Crop.find(),
      complaints: await Complaint.find(),
      announcements: await Announcement.find(),
      registry: await RegistryRecord.find(),
      volunteers: await Volunteer.find(),
      donors: await BloodDonor.find()
    };
    
    res.setHeader('Content-disposition', 'attachment; filename=pateri_db_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    next(error);
  }
};
