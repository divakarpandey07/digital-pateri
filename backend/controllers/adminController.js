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

// @desc    Trigger Database Seeding
// @route   POST /api/v1/admin/seed
// @access  Private (Panchayat Admin / Super Admin)
exports.triggerSeed = async (req, res, next) => {
  try {
    console.log('Seeding triggered via Admin Controller API...');

    // Clear existing data
    await Village.deleteMany();
    await SiteConfig.deleteMany();
    await User.deleteMany();
    await Resident.deleteMany();
    await Complaint.deleteMany();
    await BloodDonor.deleteMany();
    await Announcement.deleteMany();
    await Job.deleteMany();
    await Timeline.deleteMany();
    await Achievement.deleteMany();
    await VillageAsset.deleteMany();
    await KnowledgeBase.deleteMany();

    // 1. Create Village
    const village = await Village.create({
      villageCode: 'PAT-821106',
      name: 'Pateri',
      district: 'Kaimur',
      state: 'Bihar',
      pinCode: '821106',
      isActive: true
    });

    // 2. Create SiteConfig
    const siteConfig = await SiteConfig.create({
      villageId: village._id,
      emergencyContacts: {
        mukhiya: '+91 7903752442',
        police: '112',
        ambulance: '102',
        hospital: '+91 6189 224488'
      },
      socialLinks: {
        facebook: 'https://facebook.com/digitalpateri',
        whatsappGroup: 'https://chat.whatsapp.com/digitalpateri'
      },
      themeSettings: {
        primaryColor: '#047857',
        secondaryColor: '#D97706',
        logoUrl: '/assets/pateri-logo.png'
      },
      aiSettings: {
        maxQueriesPerDay: 10
      },
      gpdpData: {
        totalBudget: 7115218,
        totalExpenditure: 1892802,
        sectorAllocations: [
          { sector: 'Drinking Water', amount: 2085025 },
          { sector: 'Sanitation', amount: 2085029 },
          { sector: 'Roads & Connective Paths', amount: 1530030 },
          { sector: 'Rural Electrification', amount: 835000 },
          { sector: 'Community System Maintenance', amount: 400000 },
          { sector: 'Technical & Administrative Support', amount: 180000 },
          { sector: 'Land Improvement', amount: 31 },
          { sector: 'Health Support', amount: 3 },
          { sector: 'Social Forestry', amount: 100 }
        ],
        assetStatus: {
          completed: 1,
          ongoing: 6,
          proposed: 30
        }
      }
    });

    // 3. Seed Residents
    const residentsData = [
      {
        residentId: 'PAT-RES-0001',
        name: 'Ramakant Pandey',
        fatherName: 'Late Shivshankar Pandey',
        dob: new Date('1965-08-15'),
        gender: 'Male',
        address: 'Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Farmer',
        skills: ['Organic Farming', 'Soil Management', 'Cattle Breeding'],
        education: 'Intermediate',
        bloodGroup: 'O+',
        mobile: '9473385741',
        emergencyContact: '9431102299',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=150'
      },
      {
        residentId: 'PAT-RES-0002',
        name: 'Dr. Ramesh Chandra',
        fatherName: 'Ramakant Pandey',
        dob: new Date('1990-05-12'),
        gender: 'Male',
        address: 'Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Doctor',
        skills: ['General Medicine', 'Emergency Care', 'Child Healthcare'],
        education: 'MBBS, MD',
        bloodGroup: 'AB+',
        mobile: '9431102299',
        emergencyContact: '9473385741',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'
      },
      {
        residentId: 'PAT-RES-0003',
        name: 'Sunita Devi',
        fatherName: 'Kapildev Singh',
        dob: new Date('1985-02-28'),
        gender: 'Female',
        address: 'Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Teacher',
        skills: ['Primary Education', 'Bhojpuri Literature', 'Women SHG Organizing'],
        education: 'B.Ed, MA',
        bloodGroup: 'B+',
        mobile: '9934421155',
        emergencyContact: '9955511223',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      },
      {
        residentId: 'PAT-RES-0004',
        name: 'Pappu Kumar',
        fatherName: 'Basawan Ram',
        dob: new Date('1995-10-10'),
        gender: 'Male',
        address: 'Ward No. 01, Mohalla Dalit Basti',
        mohalla: 'Dalit Basti',
        ward: '01',
        occupation: 'Electrician',
        skills: ['House Wiring', 'Solar Panel Installation', 'Motor Repair'],
        education: 'ITI Electrician',
        bloodGroup: 'A+',
        mobile: '8877554422',
        emergencyContact: '8877554411',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        residentId: 'PAT-RES-0005',
        name: 'Manish Kumar Singh',
        fatherName: 'Vaidyanath Singh',
        dob: new Date('2002-04-18'),
        gender: 'Male',
        address: 'Ward No. 03, Mohalla Market Area',
        mohalla: 'Market Area',
        ward: '03',
        occupation: 'Student',
        skills: ['Web Development', 'Video Editing'],
        education: 'MCA Student',
        bloodGroup: 'O-',
        mobile: '7766554433',
        emergencyContact: '9934421155',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
      }
    ];

    const residents = [];
    for (const data of residentsData) {
      const resident = await Resident.create({
        ...data,
        villageId: village._id
      });
      residents.push(resident);
    }

    // Connect relations
    residents[0].relations.push({ relativeId: residents[1]._id, relationType: 'Child' });
    await residents[0].save();
    residents[1].relations.push({ relativeId: residents[0]._id, relationType: 'Father' });
    await residents[1].save();

    // 5. Seed Users
    const superAdminUser = await User.create({
      email: 'admin@pateri.in',
      password: 'admin123',
      roles: ['Super Admin']
    });

    const panchayatUser = await User.create({
      email: 'panchayat@pateri.in',
      password: 'panchayat123',
      roles: ['Panchayat Admin', 'Resident'],
      residentProfile: residents[0]._id
    });

    const studentUser = await User.create({
      email: 'manish@pateri.in',
      password: 'manish123',
      roles: ['Resident', 'Volunteer'],
      residentProfile: residents[4]._id
    });

    const electricianUser = await User.create({
      email: 'pappu@pateri.in',
      password: 'pappu123',
      roles: ['Resident', 'Volunteer'],
      residentProfile: residents[3]._id
    });

    // 6. Seed Announcements
    await Announcement.create([
      {
        villageId: village._id,
        title: 'Panchayat Budget Report 2026-27',
        content: 'Gram Panchayat Pateri ka varshik budget allocation report notice board par laga diya gaya hai. Isme naali nirman, solar light lagane, aur aanganwadi kendra ke vikas ki yojnayein shamil hain.',
        priority: 'High',
        createdBy: panchayatUser._id,
        expiresAt: new Date('2026-08-31')
      },
      {
        villageId: village._id,
        title: 'Polio & Health Camp Vaccination Drive',
        content: 'Aagami Ravivar, 14 June 2026 ko Panchayat Bhawan me subah 9 baje se sham 4 baje tak 0-5 varsh ke bacchon ke liye Polio drops aur Health checkup camp lagaya jayega.',
        priority: 'Normal',
        createdBy: panchayatUser._id,
        expiresAt: new Date('2026-06-15')
      }
    ]);

    // 7. Seed Jobs
    await Job.create([
      {
        villageId: village._id,
        title: 'Guest High School Science Teacher',
        type: 'Teaching',
        description: 'Pateri High School me kaksha 9 aur 10 ke chhatron ko padhane ke liye part-time Vigyan (Science) shikshak ki avashyakta hai. Qualification: B.Sc / B.Ed.',
        location: 'Pateri High School Campus',
        salary: '₹12,000 / month',
        postedBy: panchayatUser._id
      }
    ]);

    // 8. Seed Blood Donors
    await BloodDonor.create([
      {
        villageId: village._id,
        residentId: residents[1]._id, // Dr. Ramesh (AB+)
        bloodGroup: 'AB+',
        availabilityStatus: true,
        lastDonationDate: new Date('2026-02-10')
      },
      {
        villageId: village._id,
        residentId: residents[3]._id, // Pappu Kumar (A+)
        bloodGroup: 'A+',
        availabilityStatus: true,
        lastDonationDate: new Date('2025-12-05')
      }
    ]);

    // 9. Seed Complaints
    const complaint1 = await Complaint.create({
      villageId: village._id,
      userId: studentUser._id,
      title: 'Water Leakage in Pipeline near Purab Tola Well',
      description: 'Purab Tola ke kuan ke paas jo mukhiya dwara naya pipeline lagaya gaya hai, usme pichle do dinon se bhot pani leak ho raha hai.',
      category: 'Water',
      priority: 'High',
      mohalla: 'Purab Tola',
      ward: '04',
      latitude: 25.0215,
      longitude: 83.5691,
      beforeImage: 'https://images.unsplash.com/photo-1542013936693-8848e5744a9b?w=300',
      status: 'In Progress',
      statusHistory: [
        {
          status: 'Pending',
          comment: 'Complaint registered'
        }
      ]
    });

    // 10. Seed Timeline
    await Timeline.create([
      {
        villageId: village._id,
        year: 1955,
        title: 'Establishment of Pateri Roster',
        description: 'Kaimur pahaadiyon ke paas base Pateri gaon ki sthapna hui aur yahan par kheti-baari ki shuruat hui.'
      },
      {
        villageId: village._id,
        year: 1988,
        title: 'First Government High School',
        description: 'Gaon ke bacchon ki padhai ke liye pehle prathmik aur phir school bhavan ka nirman karwaya gaya.'
      },
      {
        villageId: village._id,
        year: 2026,
        title: 'Digital Pateri Smart Village Portal Launch',
        description: 'MCA chhatron dwara Digital Pateri portal launch kiya gaya, jise Panchayat, Swasthya aur Shiksha ke digitalikaran ke liye viksit kiya gaya hai.'
      }
    ]);

    // 11. Seed Achievements
    await Achievement.create([
      {
        villageId: village._id,
        residentId: residents[4]._id,
        title: 'Qualified Bihar State Merit Scholarship',
        category: 'Academic',
        year: 2025,
        description: 'Manish Kumar ne statewide BCA examination me rank 15 laakar MCA ke liye Bihar state government scholar support haasil kiya.'
      }
    ]);

    // 12. Seed Village Assets
    await VillageAsset.create([
      {
        villageId: village._id,
        name: 'Government High School Building',
        type: 'School',
        location: 'North Area, Ward No. 02',
        latitude: 25.0225,
        longitude: 83.5681,
        condition: 'Good',
        installationDate: new Date('1988-06-01'),
        lastInspectionDate: new Date('2026-03-15'),
        description: 'Pateri high school blocks building with 8 classes and science lab.'
      }
    ]);

    // 13. Seed KnowledgeBase
    await KnowledgeBase.create([
      {
        topic: 'Pateri History & Basic Info',
        keywords: ['pateri', 'itihaas', 'history', 'gaav', 'basa', 'kaimur', 'bihar', 'thana chand'],
        content: 'Pateri Bihar rajya ke Kaimur (Bhabua) jile ke Chand block me sthit ek viksit Gram Panchayat hai. PIN: 821106. Yahan ki mukhhya bhasha Hindi aur Bhojpuri hai.'
      },
      {
        topic: 'Emergency Help Contacts',
        keywords: ['emergency', 'helpline', 'ambulance', 'hospital', 'police', 'mukhiya', 'doctor', 'number', 'phone'],
        content: 'Digital Pateri Emergency Contacts list: \n1. Mukhiya: +91 7903752442 \n2. Police Helpline: 112 \n3. Ambulance Service: 102.'
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully'
    });

  } catch (error) {
    next(error);
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
    const Resident = require('../models/Resident');
    const Scheme = require('../models/Scheme');
    const Crop = require('../models/Crop');
    const Complaint = require('../models/Complaint');
    const Announcement = require('../models/Announcement');
    const RegistryRecord = require('../models/RegistryRecord');
    const Volunteer = require('../models/Volunteer');
    const BloodDonor = require('../models/BloodDonor');
    
    const residents = await Resident.find();
    const schemes = await Scheme.find();
    const crops = await Crop.find();
    const complaints = await Complaint.find();
    const announcements = await Announcement.find();
    const registry = await RegistryRecord.find();
    const volunteers = await Volunteer.find();
    const donors = await BloodDonor.find();
    
    const backupData = {
      timestamp: new Date(),
      residents,
      schemes,
      crops,
      complaints,
      announcements,
      registry,
      volunteers,
      donors
    };
    
    res.setHeader('Content-disposition', 'attachment; filename=pateri_db_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.status(200).send(JSON.stringify(backupData, null, 2));
  } catch (error) {
    next(error);
  }
};

