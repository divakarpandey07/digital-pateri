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
    // Run all aggregation and count queries in parallel using Promise.all
    const [
      totalResidents,
      totalComplaints,
      resolvedComplaints,
      totalBusinesses,
      verifiedBusinesses,
      totalVolunteers,
      totalBloodDonors,
      complaintCategories,
      complaintStatus,
      businessCategories,
      volunteerCategories,
      totalDocuments,
      documentDownloadsAgg,
      documentCategories,
      recentComplaintsList,
      recentVolunteerRequests
    ] = await Promise.all([
      Resident.countDocuments({ isDeleted: false }),
      Complaint.countDocuments({ isDeleted: false }),
      Complaint.countDocuments({ status: 'Resolved', isDeleted: false }),
      Business.countDocuments(),
      Business.countDocuments({ verificationStatus: 'Verified' }),
      Volunteer.countDocuments({ isActive: true }),
      BloodDonor.countDocuments({ availabilityStatus: true }),
      Complaint.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
      ]),
      Complaint.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
      ]),
      Business.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
      ]),
      Volunteer.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
      ]),
      Document.countDocuments(),
      Document.aggregate([
        { $group: { _id: null, totalDownloads: { $sum: '$downloadCount' } } }
      ]),
      Document.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } }
      ]),
      Complaint.find({ isDeleted: false })
        .sort('-createdAt')
        .limit(5)
        .populate('userId', 'email'),
      VolunteerRequest.find()
        .sort('-createdAt')
        .limit(5)
        .populate({
          path: 'requestedBy',
          select: 'email residentProfile',
          populate: {
            path: 'residentProfile',
            select: 'name'
          }
        })
    ]);

    const totalDownloads = documentDownloadsAgg.length > 0 ? documentDownloadsAgg[0].totalDownloads : 0;

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
          businessesByCategory: businessCategories || [],
          volunteersByCategory: volunteerCategories || [],
          documentsByCategory: documentCategories || []
        },
        complaints: {
          complaintsByCategory: complaintCategories || [],
          complaintsByStatus: complaintStatus || [],
          recent: recentComplaintsList || [],
          recentVolunteerRequests: recentVolunteerRequests || []
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
