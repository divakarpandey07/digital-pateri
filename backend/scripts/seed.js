const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import Models
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
const BusinessCategory = require('../models/BusinessCategory');
const Business = require('../models/Business');
const Review = require('../models/Review');
const Volunteer = require('../models/Volunteer');
const VolunteerRequest = require('../models/VolunteerRequest');
const Document = require('../models/Document');
const MandiRate = require('../models/MandiRate');
const CropAlert = require('../models/CropAlert');
const FarmerProduct = require('../models/FarmerProduct');
const AgriConsultation = require('../models/AgriConsultation');
const Crop = require('../models/Crop');
const Scheme = require('../models/Scheme');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_pateri';

// Normalization helper for matching names
const normalizeName = (name) => {
  if (!name) return '';
  return name.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/devi/g, '')
    .replace(/prasad/g, '')
    .replace(/kumar/g, '')
    .replace(/singh/g, '')
    .replace(/sah/g, '')
    .replace(/shah/g, '')
    .replace(/khan/g, '')
    .replace(/ram/g, '')
    .replace(/bibi/g, '')
    .replace(/begum/g, '')
    .replace(/khatun/g, '')
    .replace(/nisha/g, '')
    .replace(/bano/g, '')
    .replace(/[^a-z0-9]/g, '');
};

const runSeeder = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Database Connected. Clearing existing collections...');

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
    await BusinessCategory.deleteMany();
    await Business.deleteMany();
    await Review.deleteMany();
    await Volunteer.deleteMany();
    await VolunteerRequest.deleteMany();
    await Document.deleteMany();
    await MandiRate.deleteMany();
    await CropAlert.deleteMany();
    await FarmerProduct.deleteMany();
    await AgriConsultation.deleteMany();
    await Crop.deleteMany();
    await Scheme.deleteMany();

    console.log('Collections cleared. Seeding default Village tenant...');

    // 1. Create Village
    const village = await Village.create({
      villageCode: 'PAT-821106',
      name: 'Pateri',
      district: 'Kaimur',
      state: 'Bihar',
      pinCode: '821106',
      isActive: true
    });

    console.log('Loading real voters roster from voters.json...');
    const votersPath = path.join(__dirname, 'voters.json');
    if (!fs.existsSync(votersPath)) {
      console.error('voters.json not found in scripts directory!');
      process.exit(1);
    }
    const rawVoters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));

    // Gyashuddin (Sarpanch) needs to be manually added since he is not in voters list
    const gyashuddinObj = {
      ac: "213",
      part: "91",
      serial: 9999,
      house: "27",
      ward: "01",
      name: "Gyashuddin",
      relationType: "Father",
      relativeName: "Late Rahimuddin",
      epic: "EPIC9999IN",
      gender: "Male",
      age: 63
    };
    rawVoters.push(gyashuddinObj);

    // Naushad Khan (PACS Adhyaksh) needs to be manually added
    const naushadKhanObj = {
      ac: "204", // Chainpur constituency
      part: "91",
      serial: 9998,
      house: "44",
      ward: "03",
      name: "Naushad Khan",
      relationType: "Father",
      relativeName: "Vakil Khan",
      epic: "EPIC9998IN",
      gender: "Male",
      age: 51
    };
    rawVoters.push(naushadKhanObj);

    // Satyam Kumar Singh (Ward No. 01)
    const satyamSinghObj = {
      ac: "213",
      part: "91",
      serial: 9997,
      house: "101",
      ward: "01",
      name: "Satyam Kumar Singh",
      relationType: "Father",
      relativeName: "Rakesh Kumar Singh",
      epic: "EPIC9997IN",
      gender: "Male",
      age: 24
    };
    rawVoters.push(satyamSinghObj);

    // Abhishek Singh (Ward No. 06)
    const abhishekSinghObj = {
      ac: "213",
      part: "91",
      serial: 9996,
      house: "102",
      ward: "06",
      name: "Abhishek Singh",
      relationType: "Father",
      relativeName: "Manoj Singh",
      epic: "EPIC9996IN",
      gender: "Male",
      age: 26
    };
    rawVoters.push(abhishekSinghObj);

    // Build the residents array
    const residentsToCreate = [];
    const nameToResidentMap = new Map();

    rawVoters.forEach((v, idx) => {
      const _id = new mongoose.Types.ObjectId();
      const padNum = String(idx + 1).padStart(6, '0');
      const residentId = `PAT-${padNum}`;

      // Calculate approximate Date of Birth based on age in 2026
      const birthYear = 2026 - v.age;
      const dob = new Date(`${birthYear}-01-01`);

      const resObj = {
        _id,
        villageId: village._id,
        residentId,
        name: v.name,
        fatherName: v.relativeName,
        dob,
        gender: v.gender,
        address: `House No. ${v.house}, Ward No. ${v.ward}, Pateri Tola`,
        houseNo: `W${v.ward}-H${v.house}`,
        mohalla: 'Pateri Tola',
        ward: v.ward,
        occupation: 'Farmer', // default occupation
        skills: [],
        education: 'Matriculation',
        bloodGroup: 'O+',
        mobile: `947338${String(idx).padStart(4, '0')}`, // seed unique mock mobiles
        emergencyContact: '9473385741',
        photo: '',
        isPublicProfile: true,
        relations: [],
        verificationStatus: 'verified',
        panchayatRole: 'None',
        isDeleted: false,
        latitude: 25.0200 + (Math.random() - 0.5) * 0.008,
        longitude: 83.5680 + (Math.random() - 0.5) * 0.008,
        aadhaarLast4: String(1000 + (idx % 9000)),
        voterId: v.epic || ''
      };

      // Set specific details for leaders and staff
      if (v.name === 'Reshad Khan') {
        resObj.panchayatRole = 'Mukhiya';
        resObj.occupation = 'Mukhiya';
        resObj.mobile = '7903752442'; // Real mobile number
        resObj.education = 'Graduate';
        resObj.bloodGroup = 'O+';
        resObj.reputationPoints = 620; // Pateri Hero!
        
        // Update DOB based on age 62
        const birthYear = 2026 - 62;
        resObj.dob = new Date(`${birthYear}-01-01`);
      } else if (v.name === 'Gyashuddin') {
        resObj.panchayatRole = 'Sarpanch';
        resObj.occupation = 'Sarpanch';
        resObj.mobile = '9473385742';
        resObj.education = 'Intermediate';
        resObj.bloodGroup = 'B+';
        resObj.reputationPoints = 450; // Gold Citizen!
      } else if (v.name === 'Naushad Khan' && v.ward === '03') {
        resObj.panchayatRole = 'PACS Adhyaksh';
        resObj.occupation = 'PACS President';
        resObj.mobile = '9473385743';
        resObj.education = 'Graduate';
        resObj.bloodGroup = 'A+';
        resObj.reputationPoints = 480; // Gold Citizen!
      } else if (v.name === 'Yogesh Pandey' || (v.name && v.name.toLowerCase().includes('yogesh') && v.name.toLowerCase().includes('pandey'))) {
        resObj.occupation = 'Priest / Pandit';
        resObj.mobile = '8004695027';
        resObj.education = 'Graduate (Economics, BHU)';
        resObj.reputationPoints = 200; // Silver Citizen
      } else if (v.name === 'Gandhi Yadav' || (v.name && v.name.toLowerCase().includes('gandhi') && v.name.toLowerCase().includes('yadav'))) {
        resObj.occupation = 'Dairy / Doodh Wale';
        resObj.mobile = '9151103687';
        resObj.reputationPoints = 150;
      }

      residentsToCreate.push(resObj);
      const key = `${v.name.trim()}_${v.house}_${v.ward}`;
      nameToResidentMap.set(key, resObj);
    });

    // Mark Ward Members dynamically (1 per Ward for Wards 1 to 5)
    const wardMap = {};
    residentsToCreate.forEach(res => {
      const w = parseInt(res.ward);
      if (w >= 1 && w <= 5 && !wardMap[w] && res.panchayatRole === 'None') {
        res.panchayatRole = 'Ward Member';
        res.occupation = 'Ward Member';
        res.reputationPoints = 120; // Bronze Citizen!
        wardMap[w] = res;
      }
    });

    // Create 3 Panchayat Staff
    const staff1 = {
      _id: new mongoose.Types.ObjectId(),
      villageId: village._id,
      residentId: 'PAT-009991',
      name: 'Amit Kumar',
      fatherName: 'Rameshwar Kumar',
      dob: new Date('1988-06-15'),
      gender: 'Male',
      address: 'House No. 102, Ward No. 03, Pateri Tola',
      houseNo: 'W03-H102',
      mohalla: 'Pateri Tola',
      ward: '03',
      occupation: 'Panchayat Secretary',
      skills: ['Office Administration', 'Local Governance Support'],
      education: 'Graduate',
      bloodGroup: 'A+',
      mobile: '9473381122',
      emergencyContact: '9473385741',
      verificationStatus: 'verified',
      panchayatRole: 'Panchayat Staff',
      reputationPoints: 160, // Silver Citizen!
      latitude: 25.0205,
      longitude: 83.5682,
      aadhaarLast4: '9991',
      relations: []
    };
    residentsToCreate.push(staff1);

    const staff2 = {
      _id: new mongoose.Types.ObjectId(),
      villageId: village._id,
      residentId: 'PAT-009992',
      name: 'Vikram Singh',
      fatherName: 'Sanjay Singh',
      dob: new Date('1992-04-12'),
      gender: 'Male',
      address: 'House No. 104, Ward No. 02, Pateri Tola',
      houseNo: 'W02-H104',
      mohalla: 'Pateri Tola',
      ward: '02',
      occupation: 'Rozgar Sewak',
      skills: ['MGNREGA Coordination', 'Labor Roster Management'],
      education: 'Intermediate',
      bloodGroup: 'B+',
      mobile: '9473381133',
      emergencyContact: '9473385741',
      verificationStatus: 'verified',
      panchayatRole: 'Panchayat Staff',
      reputationPoints: 110,
      latitude: 25.0212,
      longitude: 83.5678,
      aadhaarLast4: '9992',
      relations: []
    };
    residentsToCreate.push(staff2);

    // Link relationships
    rawVoters.forEach((v, idx) => {
      const currentRes = residentsToCreate[idx];
      if (!currentRes) return;
      const relativeName = v.relativeName.trim();
      const relationType = v.relationType;

      const relativeKey = `${relativeName}_${v.house}_${v.ward}`;
      const relativeRes = nameToResidentMap.get(relativeKey);

      let mappedRelation = 'Father';
      if (relationType === 'Husband' || relationType === 'Spouse') {
        mappedRelation = 'Spouse';
      } else if (relationType === 'Mother') {
        mappedRelation = 'Mother';
      } else if (relationType === 'Child') {
        mappedRelation = 'Child';
      } else if (relationType === 'Sibling') {
        mappedRelation = 'Sibling';
      }

      if (relativeRes && relativeRes._id.toString() !== currentRes._id.toString()) {
        currentRes.relations.push({
          relativeId: relativeRes._id,
          relationType: mappedRelation
        });
      }
    });

    // Ensure bidirectional relationships
    residentsToCreate.forEach(res => {
      res.relations.forEach(rel => {
        // Find the relative
        const relative = residentsToCreate.find(r => r._id.toString() === rel.relativeId.toString());
        if (relative) {
          // Check if reverse relation already exists
          const exists = relative.relations.some(r => r.relativeId.toString() === res._id.toString());
          if (!exists) {
            let reverseType = 'Sibling';
            if (rel.relationType === 'Father' || rel.relationType === 'Mother') {
              reverseType = 'Child';
            } else if (rel.relationType === 'Spouse') {
              reverseType = 'Spouse';
            } else if (rel.relationType === 'Child') {
              reverseType = res.gender === 'Female' ? 'Mother' : 'Father';
            } else if (rel.relationType === 'Sibling') {
              reverseType = 'Sibling';
            }
            relative.relations.push({
              relativeId: res._id,
              relationType: reverseType
            });
          }
        }
      });
    });

    // 2. Load Ration data and map matching cards
    console.log('Loading ration card data from ration_data.json...');
    const rationPath = path.join(__dirname, 'ration_data.json');
    if (fs.existsSync(rationPath)) {
      const cards = JSON.parse(fs.readFileSync(rationPath, 'utf8'));
      const residentLookupMap = new Map();
      residentsToCreate.forEach(r => {
        const key = `${normalizeName(r.name)}_${normalizeName(r.fatherName)}`;
        residentLookupMap.set(key, r);
      });

      cards.forEach(card => {
        const { rationCardNumber, cardType, fpsDealer, members } = card;
        if (!members || members.length === 0) return;

        members.forEach(m => {
          const key = `${normalizeName(m.name)}_${normalizeName(m.fatherName)}`;
          const profile = residentLookupMap.get(key);
          if (profile) {
            profile.rationCardNumber = rationCardNumber;
            profile.cardType = cardType;
            profile.fpsDealer = fpsDealer;
          }
        });
      });
    }

    // 3. Find and configure specific residents in the array before inserting
    const reshadKhan = residentsToCreate.find(r => r.name === 'Reshad Khan');
    const gyashuddin = residentsToCreate.find(r => r.name === 'Gyashuddin');
    const naushadKhan = residentsToCreate.find(r => r.name === 'Naushad Khan');
    
    // Pick other profiles
    const docProfile = residentsToCreate.find(r => r.name === 'Haidar Ali');
    if (docProfile) {
      docProfile.occupation = 'Doctor';
      docProfile.education = 'M.B.B.S.';
      docProfile.reputationPoints = 310; // Gold Citizen!
      
      // Update DOB to make him age 35 (30+)
      const birthYear = 2026 - 35;
      docProfile.dob = new Date(`${birthYear}-01-01`);
    }
    const studentProfile = residentsToCreate.find(r => r.gender === 'Male' && r.panchayatRole === 'None' && r._id !== (docProfile ? docProfile._id : null));
    if (studentProfile) {
      studentProfile.occupation = 'Student';
      studentProfile.education = 'Intermediate';
      studentProfile.reputationPoints = 180; // Silver Citizen!
    }
    const electricianProfile = residentsToCreate.find(r => r.gender === 'Male' && r.panchayatRole === 'None' && r._id !== (docProfile ? docProfile._id : null) && r._id !== (studentProfile ? studentProfile._id : null));
    if (electricianProfile) {
      electricianProfile.occupation = 'Electrician';
      electricianProfile.reputationPoints = 220; // Silver Citizen!
    }
    const shopProfile = residentsToCreate.find(r => r.gender === 'Female' && r.panchayatRole === 'None');
    if (shopProfile) {
      shopProfile.occupation = 'Shop Owner';
      shopProfile.reputationPoints = 90; // Bronze Citizen!
    }

    console.log('Writing residents to DB...');
    await Resident.insertMany(residentsToCreate);
    console.log(`Seeded ${residentsToCreate.length} verified residents.`);

    console.log('Creating user credentials...');
    // Create admin & roles
    await User.create({
      email: 'admin@pateri.in',
      password: 'admin123',
      roles: ['Super Admin']
    });

    const mukhiyaUser = await User.create({
      email: 'panchayat@pateri.in',
      password: 'panchayat123',
      roles: ['Panchayat Admin', 'Resident'],
      residentProfile: reshadKhan._id
    });

    const sarpanchUser = await User.create({
      email: 'sarpanch@pateri.in',
      password: 'sarpanch123',
      roles: ['Resident'],
      residentProfile: gyashuddin._id
    });

    const doctorUser = await User.create({
      email: 'haidar@pateri.in',
      password: 'haidar123',
      roles: ['Resident', 'Doctor'],
      residentProfile: docProfile ? docProfile._id : null
    });

    const studentUser = await User.create({
      email: 'manish@pateri.in',
      password: 'manish123',
      roles: ['Resident', 'Volunteer'],
      residentProfile: studentProfile ? studentProfile._id : null
    });

    const electricianUser = await User.create({
      email: 'pappu@pateri.in',
      password: 'pappu123',
      roles: ['Resident', 'Volunteer', 'Business Owner'],
      residentProfile: electricianProfile ? electricianProfile._id : null
    });

    const shantiUser = await User.create({
      email: 'shanti@pateri.in',
      password: 'shanti123',
      roles: ['Resident', 'Business Owner'],
      residentProfile: shopProfile ? shopProfile._id : null
    });

    const naushadUser = await User.create({
      email: 'naushad@pateri.in',
      password: 'naushad123',
      roles: ['Resident'],
      residentProfile: naushadKhan ? naushadKhan._id : null
    });

    // Update ownerId references on residents
    if (reshadKhan) await Resident.findByIdAndUpdate(reshadKhan._id, { ownerId: mukhiyaUser._id });
    if (gyashuddin) await Resident.findByIdAndUpdate(gyashuddin._id, { ownerId: sarpanchUser._id });
    if (naushadKhan) await Resident.findByIdAndUpdate(naushadKhan._id, { ownerId: naushadUser._id });
    if (docProfile) await Resident.findByIdAndUpdate(docProfile._id, { ownerId: doctorUser._id });
    if (studentProfile) await Resident.findByIdAndUpdate(studentProfile._id, { ownerId: studentUser._id });
    if (electricianProfile) await Resident.findByIdAndUpdate(electricianProfile._id, { ownerId: electricianUser._id });
    if (shopProfile) await Resident.findByIdAndUpdate(shopProfile._id, { ownerId: shantiUser._id });

    console.log('Seeding SiteConfig & emergency info...');
    await SiteConfig.create({
      villageId: village._id,
      emergencyContacts: {
        mukhiya: 'Reshad Khan (+91 7903752442)',
        police: '112 (Thana Chand)',
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
      aiSettings: { maxQueriesPerDay: 20 },
      gpdpData: {
        totalBudget: 7115218,
        totalExpenditure: 1892802,
        sectorAllocations: [
          { sector: 'Drinking Water', amount: 2085025 },
          { sector: 'Sanitation', amount: 2085029 },
          { sector: 'Roads & Connective Paths', amount: 1530030 },
          { sector: 'Rural Electrification', amount: 835000 },
          { sector: 'Community System Maintenance', amount: 400000 },
          { sector: 'Technical & Administrative Support', amount: 180000 }
        ],
        assetStatus: { completed: 1, ongoing: 6, proposed: 30 }
      }
    });

    console.log('Seeding announcements notices...');
    await Announcement.create([
      {
        villageId: village._id,
        title: 'Panchayat Budget Report 2026-27',
        content: 'Gram Panchayat Pateri ka varshik budget allocation report notice board par laga diya gaya hai. Isme naali nirman, solar light lagane, aur aanganwadi kendra ke vikas ki yojnayein shamil hain. Mukhiya Reshad Khan ne sabhi ko samiksha karne ko kaha hai.',
        priority: 'High',
        createdBy: mukhiyaUser._id,
        expiresAt: new Date('2026-08-31')
      },
      {
        villageId: village._id,
        title: 'Polio & Health Camp Vaccination Drive',
        content: 'Aagami Ravivar ko Panchayat Bhawan me subah 9 baje se sham 4 baje tak 0-5 varsh ke bacchon ke liye Polio drops aur Health checkup camp lagaya jayega.',
        priority: 'Normal',
        createdBy: mukhiyaUser._id,
        expiresAt: new Date('2026-06-15')
      }
    ]);

    console.log('Seeding default Crop Alerts...');
    await CropAlert.create([
      {
        villageId: village._id,
        title: 'Yellow Rust Disease Warning in Wheat',
        content: 'Yellow rust disease symptoms have been reported in neighboring fields. Farmers are advised to inspect wheat crops for yellow powdery spots. Spray Propiconazole 25% EC (200 ml/acre) immediately if symptoms appear.',
        crop: 'Wheat',
        severity: 'High'
      },
      {
        villageId: village._id,
        title: 'Paddy Stem Borer Alert',
        content: 'Stem borer larvae warnings issued for early Kharif paddy. Apply Cartap Hydrochloride 4G (25 kg/ha) or spray neem oil (1500 ppm) to prevent severe crop damage.',
        crop: 'Paddy',
        severity: 'High'
      },
      {
        villageId: village._id,
        title: 'Late Blight Alert for Potato',
        content: 'Cloudy weather and high humidity are highly conducive to Late Blight in potatoes. Spray Mancozeb (2.5 g/L of water) as a preventive measure.',
        crop: 'Potato',
        severity: 'Medium'
      }
    ]);

    console.log('Seeding default Farmer products...');
    await FarmerProduct.create([
      {
        villageId: village._id,
        farmerName: 'Reshad Khan',
        contactMobile: '9473385741',
        title: 'High Yield PBW-343 Wheat Seeds',
        description: 'Certified government PBW-343 seed surplus bags available for local sowing. Yield tested and verified.',
        category: 'Seeds',
        price: 45,
        unit: 'kg',
        postedBy: mukhiyaUser._id
      },
      {
        villageId: village._id,
        farmerName: docProfile ? docProfile.name : 'Ramesh Chandra',
        contactMobile: '9473381122',
        title: 'Organic Cow Dung Compost (Khad)',
        description: 'High-quality naturally decomposed vermicompost khad for vegetable farming.',
        category: 'Fertilizers',
        price: 250,
        unit: 'quintal',
        postedBy: doctorUser._id
      },
      {
        villageId: village._id,
        farmerName: electricianProfile ? electricianProfile.name : 'Pappu Kumar',
        contactMobile: '9473381133',
        title: 'Hand-operated Seed Drill Machine',
        description: 'Hardly used seed sowing machine. Sows wheat, gram, and mustard efficiently in rows.',
        category: 'Equipment',
        price: 3200,
        unit: 'piece',
        postedBy: electricianUser._id
      }
    ]);

    console.log('Seeding default Consultations...');
    await AgriConsultation.create({
      villageId: village._id,
      farmerName: 'Reshad Khan',
      farmerId: mukhiyaUser._id,
      question: 'Why are my potato leaves curling and turning yellow?',
      description: 'The symptoms are starting to spread on the younger leaves. There are tiny green bugs underneath.',
      reply: 'These are aphids sucking the sap, causing leaf curling. You can spray organic Neem Oil extract (1500ppm) at 5ml/liter of water, or apply Imidacloprid (1ml per 3 liters) during early mornings.',
      repliedBy: studentUser._id,
      isResolved: true
    });

    console.log('Seeding Mandi rates baseline...');
    const crops = ['Paddy(Dhan)', 'Wheat(Gehun)', 'Mustard(Sarso)', 'Maize(Makka)', 'Gram(Chana)'];
    const markets = ['Bhabhua', 'Mohania', 'Kudra'];
    const today = new Date();

    const ratesToCreate = [];
    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      
      crops.forEach(crop => {
        markets.forEach(mkt => {
          let baseVal = 1800;
          if (crop === 'Wheat(Gehun)') baseVal = 2100;
          else if (crop === 'Mustard(Sarso)') baseVal = 5200;
          else if (crop === 'Gram(Chana)') baseVal = 4800;
          else if (crop === 'Maize(Makka)') baseVal = 1900;

          // add random variations
          const varPct = 1 + (Math.sin(dayOffset + mkt.length) * 0.05) + (Math.cos(dayOffset) * 0.02);
          const modalPrice = Math.round(baseVal * varPct);
          const minPrice = Math.round(modalPrice * 0.95);
          const maxPrice = Math.round(modalPrice * 1.05);

          ratesToCreate.push({
            villageId: village._id,
            state: 'Bihar',
            district: 'Kaimur',
            market: mkt,
            commodity: crop,
            variety: 'Common',
            arrivalDate: date,
            minPrice,
            maxPrice,
            modalPrice,
            source: 'MOCK'
          });
        });
      });
    }
    await MandiRate.insertMany(ratesToCreate);

    console.log('Seeding Businesses, KnowledgeBase, and categories...');
    const catList = await BusinessCategory.create([
      { name: 'Grocery', icon: 'Store', description: 'Daily household essentials' },
      { name: 'Dairy', icon: 'Milk', description: 'Fresh milk and curd' },
      { name: 'Coaching', icon: 'BookOpen', description: 'Tuitions and high school guidance' },
      { name: 'Hardware', icon: 'Wrench', description: 'Electrical goods and agricultural tools' },
      { name: 'Medical', icon: 'ShieldAlert', description: 'Clinics and pharmacies' },
      { name: 'Agriculture', icon: 'Leaf', description: 'Seeds and fertilizers' }
    ]);

    const business1 = await Business.create({
      villageId: village._id,
      ownerId: shantiUser._id,
      businessName: 'Shanti Kirana & General Store',
      category: 'Grocery',
      contactMobile: '9473385745',
      address: 'House No. 12, Ward No. 01, Pateri Tola',
      verificationStatus: 'Verified',
      averageRating: 5,
      totalReviews: 1,
      latitude: 25.0202,
      longitude: 83.5674
    });

    const business2 = await Business.create({
      villageId: village._id,
      ownerId: electricianUser._id,
      businessName: 'Pappu Solar & Electrical Solutions',
      category: 'Hardware',
      contactMobile: '9473381133',
      address: 'House No. 25, Ward No. 03, Pateri Tola',
      verificationStatus: 'Verified',
      averageRating: 4,
      totalReviews: 1,
      latitude: 25.0211,
      longitude: 83.5685
    });

    await Review.create([
      { businessId: business1._id, userId: studentUser._id, rating: 5, comment: 'Achee dukan hai, sabhi gharelu samaan sahi daam par milte hain.' },
      { businessId: business2._id, userId: doctorUser._id, rating: 4, comment: 'Pappu ne mere hospital ke electrical panels bahut acche se theek kiya.' }
    ]);

    await Volunteer.create({
      userId: studentUser._id,
      residentId: studentProfile._id,
      villageId: village._id,
      skills: ['Web Development', 'Math Tutoring'],
      availability: 'Weekends Only',
      category: 'Education',
      phoneVisible: true
    });

    await Volunteer.create({
      userId: electricianUser._id,
      residentId: electricianProfile._id,
      villageId: village._id,
      skills: ['Solar street light repairing', 'House wiring'],
      availability: 'On Call',
      category: 'Disaster Relief',
      phoneVisible: true
    });

    await Document.create([
      {
        villageId: village._id,
        title: 'PM Kisan Samman Nidhi E-KYC Application Form',
        category: 'Forms',
        fileUrl: 'https://pmkisan.gov.in/Documents/KisanSchemeForm.pdf',
        visibility: 'Public',
        downloadCount: 42,
        uploadedBy: mukhiyaUser._id
      },
      {
        villageId: village._id,
        title: 'Panchayat Gram Vikas Yojana Budget Report 2026',
        category: 'Panchayat Notices',
        fileUrl: 'https://panchayat.bihar.gov.in/Reports/BudgetPateri2026.pdf',
        visibility: 'Residents Only',
        downloadCount: 15,
        uploadedBy: mukhiyaUser._id
      },
      {
        villageId: village._id,
        title: 'Organic Farming & Crop Protection Guidelines',
        category: 'Agriculture Guides',
        fileUrl: 'https://krishi.bih.nic.in/Guides/OrganicFarmingBhojpuri.pdf',
        visibility: 'Public',
        downloadCount: 8,
        uploadedBy: mukhiyaUser._id
      }
    ]);

    await KnowledgeBase.create([
      {
        topic: 'Pateri History & Basic Info',
        keywords: ['pateri', 'itihaas', 'history', 'gaav', 'basa', 'kaimur', 'bihar', 'thana chand'],
        content: 'Pateri Bihar rajya ke Kaimur (Bhabua) jile ke Chand block me sthit ek viksit Gram Panchayat hai. Iska PIN code 821106 hai. Gaon ki sthapna lagbhag 1950s me hui thi. Yahan ki mukhhya bhasha Hindi aur Bhojpuri hai. Kheti-baari yahan ke logon ka mukhhya vyavasay hai.'
      },
      {
        topic: 'Emergency Help Contacts',
        keywords: ['emergency', 'helpline', 'ambulance', 'hospital', 'police', 'mukhiya', 'doctor', 'number', 'phone'],
        content: 'Digital Pateri Emergency Contacts list: \n1. Mukhiya (Reshad Khan): +91 7903752442 \n2. Sarpanch (Gyashuddin): +91 9473385742 \n3. PACS Adhyaksh (Naushad Khan): +91 9473385743 \n4. Police Helpline: 112 (Thana Chand) \n5. Ambulance Service: 102 \n6. Sub-divisional Hospital (Bhabua): +91 6189 224488.'
      }
    ]);

    await Timeline.create([
      { villageId: village._id, year: 1955, title: 'Establishment of Pateri Roster', description: 'Kaimur pahaadiyon ke paas base Pateri gaon ki sthapna hui aur yahan par kheti-baari ki shuruat hui.' },
      { villageId: village._id, year: 1988, title: 'First Government High School', description: 'Gaon ke bacchon ki padhai ke liye pehle prathmik aur phir high school bhavan ka nirman karwaya gaya.' },
      { villageId: village._id, year: 2026, title: 'Digital Pateri Smart Village Portal Launch', description: 'MCA chhatron dwara Digital Pateri portal launch kiya gaya, jise Panchayat, Swasthya aur Shiksha ke digitalikaran ke liye viksit kiya gaya hai.' }
    ]);

    // Seed Achievements
    const achievers = residentsToCreate.filter(r => ['Reshad Khan', 'Gyashuddin'].includes(r.name));
    await Achievement.create([
      {
        villageId: village._id,
        residentId: reshadKhan ? reshadKhan._id : (achievers[0] ? achievers[0]._id : village._id),
        title: 'Mukhiya Outstanding Development Award',
        category: 'Social Service',
        year: 2026,
        description: 'Awarded for achieving 100% solar street lighting in Pateri Panchayat.'
      },
      {
        villageId: village._id,
        residentId: gyashuddin ? gyashuddin._id : (achievers[1] ? achievers[1]._id : village._id),
        title: 'Kaimur Judicial Excellence Honour',
        category: 'Social Service',
        year: 2025,
        description: 'Recognized for settling 50+ local land disputes amicably without police escalation.'
      },
      {
        villageId: village._id,
        residentId: studentProfile ? studentProfile._id : (reshadKhan ? reshadKhan._id : village._id),
        title: 'Bihar State Intermediate Scholarship Winner',
        category: 'Academic',
        year: 2026,
        description: 'Scored 94% in Intermediate science examinations, ranking top in Chand block.'
      },
      {
        villageId: village._id,
        residentId: docProfile ? docProfile._id : (reshadKhan ? reshadKhan._id : village._id),
        title: 'Corona Warrior Recognition',
        category: 'Social Service',
        year: 2021,
        description: 'Exemplary service in operating the village quarantine center and vaccination drive.'
      }
    ]);

    console.log('Seeding Village Assets with GPS coordinates...');
    const assetsData = [
      {
        villageId: village._id,
        name: 'Panchayat Bhawan Pateri',
        type: 'Community Hall',
        location: 'Near Primary School, Ward No. 03',
        latitude: 25.0205,
        longitude: 83.5672,
        condition: 'Good',
        description: 'Panchayat office, community gathering place, and digital service delivery hub.'
      },
      {
        villageId: village._id,
        name: 'Pateri High School',
        type: 'School',
        location: 'Western Outskirts, Ward No. 01',
        latitude: 25.0220,
        longitude: 83.5650,
        condition: 'Good',
        description: 'Government high school catering to students of Pateri and adjacent villages.'
      },
      {
        villageId: village._id,
        name: 'Pateri Anganwadi Kendra',
        type: 'Anganwadi',
        location: 'Harijan Tola, Ward No. 02',
        latitude: 25.0195,
        longitude: 83.5680,
        condition: 'Good',
        description: 'Child nutrition, health immunisation, and pre-school education center.'
      },
      {
        villageId: village._id,
        name: 'Primary Health Sub-Centre',
        type: 'Health Centre',
        location: 'Main Bazar Road, Ward No. 04',
        latitude: 25.0230,
        longitude: 83.5690,
        condition: 'Good',
        description: 'Basic health diagnostics, first aid, and monthly vaccination camps.'
      },
      {
        villageId: village._id,
        name: 'Shiv Mandir Pateri',
        type: 'Temple',
        location: 'Pond Bank, Ward No. 01',
        latitude: 25.0210,
        longitude: 83.5665,
        condition: 'Good',
        description: 'Ancient temple, main spiritual gathering point.'
      },
      {
        villageId: village._id,
        name: 'Jama Masjid Pateri',
        type: 'Mosque',
        location: 'Mohalla Tola, Ward No. 05',
        latitude: 25.0188,
        longitude: 83.5678,
        condition: 'Good',
        description: 'Community mosque for daily prayers.'
      },
      {
        villageId: village._id,
        name: 'Pateri Bada Pokhra (Pond)',
        type: 'Pond',
        location: 'Near Shiv Mandir, Ward No. 01',
        latitude: 25.0225,
        longitude: 83.5640,
        condition: 'Good',
        description: 'Public pond used for bathing cattle and Chhath Puja rituals.'
      },
      {
        villageId: village._id,
        name: 'Pateri Link Road (PMGSY)',
        type: 'Road',
        location: 'Connecting to Mohania-Bhabua HW, Ward 03',
        latitude: 25.0200,
        longitude: 83.5675,
        condition: 'Good',
        description: 'Tar road constructed under PMGSY providing main village connectivity.'
      },
      {
        villageId: village._id,
        name: 'Public Handpump - Panchayat Bhawan',
        type: 'Handpump',
        location: 'Panchayat Bhawan Campus, Ward No. 03',
        latitude: 25.0208,
        longitude: 83.5679,
        condition: 'Good',
        description: 'High-discharge handpump providing clean drinking water.'
      },
      {
        villageId: village._id,
        name: 'Public Handpump - Ward 2',
        type: 'Handpump',
        location: 'Near Community Chowk, Ward No. 02',
        latitude: 25.0198,
        longitude: 83.5688,
        condition: 'Needs Repair',
        description: 'Drinking water handpump currently requiring cylinder seal replacement.'
      }
    ];
    await VillageAsset.insertMany(assetsData);

    console.log('Seeding Crops and Knowledge Library...');
    const cropsData = [
      {
        cropId: 'CRP-000001',
        name: { en: 'Wheat', hi: 'गेंहू', hn: 'Gehun' },
        localName: 'Gehun',
        scientificName: 'Triticum aestivum',
        introduction: 'Wheat is the primary Rabi crop in Pateri, critical for food security and farmer livelihoods.',
        season: { en: 'Rabi', hi: 'रबी', hn: 'Rabi' },
        climate: 'Cool winter and warm spring/summer. Optimum temp 20-25°C.',
        soilRequirement: 'Well-drained fertile loamy and clayey soils.',
        seedVarieties: ['PBW-343', 'HD-2967', 'K-307', 'HD-3086'],
        seedRate: '40-50 kg per acre',
        nurseryGuide: 'Direct sowing, no nursery required.',
        sowingProcess: 'Sow between Nov 1 and Nov 25 using seed drill at 4-5 cm depth.',
        fertilizerSchedule: 'Apply N:P:K in 120:60:40 kg/ha ratio. Half N and full P, K at sowing. Remaining N at first irrigation.',
        irrigationSchedule: 'Requires 4-6 irrigations at critical stages: Crown Root Initiation (21 days), Tillering, Jointing, Flowering, Milk stage, and Dough stage.',
        weedManagement: 'Apply Sulfosulfuron (13.5 g/acre) 30-35 days after sowing to control weeds.',
        diseaseManagement: 'Yellow rust (spray Propiconazole 25% EC @ 200 ml/acre). Loose smut (treat seeds with Carboxin @ 2g/kg).',
        pestManagement: 'Aphids (spray Imidacloprid @ 100 ml/acre or Neem oil extract).',
        harvestGuide: 'Harvest when grains become hard and dry (moisture below 15%). Cut manually or with combine harvester.',
        storageGuide: 'Dry grains under sun to 12% moisture. Store in metallic bins or jute bags in a cool, dry place.',
        marketDemand: 'High. Procurement by Govt PACS and local Mandis in Kudra/Bhabua.',
        yieldEstimates: '20-25 quintals per acre',
        photoUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'
      },
      {
        cropId: 'CRP-000002',
        name: { en: 'Paddy (Rice)', hi: 'धान', hn: 'Dhan' },
        localName: 'Dhan',
        scientificName: 'Oryza sativa',
        introduction: 'Paddy is the primary Kharif crop in Pateri, heavily dependent on monsoon rains and irrigation.',
        season: { en: 'Kharif', hi: 'खरीफ', hn: 'Kharif' },
        climate: 'Hot and humid climate with plenty of water. Temp 22-32°C.',
        soilRequirement: 'Clayey or clayey loams that can retain water for long periods.',
        seedVarieties: ['MTU-7029 (Swarna)', 'IR-64', 'Rajendra Sweta', 'Pusa Basmati 1121'],
        seedRate: '6-8 kg per acre (transplanting)',
        nurseryGuide: 'Raise nursery in June. Keep wet, transplant seedlings after 21-25 days when they are 15 cm tall.',
        sowingProcess: 'Transplant 2-3 seedlings per hill at a depth of 2-3 cm with spacing of 20x15 cm.',
        fertilizerSchedule: 'N:P:K @ 100:50:50 kg/ha. Apply Zinc Sulphate (25 kg/ha) to prevent Khaira disease.',
        irrigationSchedule: 'Maintain water level of 2-5 cm during transplanting till tillering. Drain water 10 days before harvest.',
        weedManagement: 'Apply Butachlor (1.5 kg/ha) or Pretilachlor (1.0 L/ha) within 3 days of transplanting.',
        diseaseManagement: 'Blast disease (spray Tricyclazole @ 120g/acre). Bacterial Leaf Blight (spray Streptocycline @ 6g/acre).',
        pestManagement: 'Stem Borer (apply Cartap Hydrochloride 4G @ 10 kg/acre). Brown Plant Hopper (spray Buprofezin @ 330 ml/acre).',
        harvestGuide: 'Harvest when 80-85% grains turn golden yellow. Moisture level should be 20-22%.',
        storageGuide: 'Thresh and dry to 14% moisture. Store in dry, rodent-free godowns.',
        marketDemand: 'Very High. Direct purchasing at local PACS (Panchayat Level Cooperative).',
        yieldEstimates: '18-22 quintals per acre',
        photoUrl: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=400'
      },
      {
        cropId: 'CRP-000003',
        name: { en: 'Mustard', hi: 'सरसों', hn: 'Sarso' },
        localName: 'Sarso',
        scientificName: 'Brassica juncea',
        introduction: 'An important oilseed crop grown in winter. Provides cooking oil and cattle cake.',
        season: { en: 'Rabi', hi: 'रबी', hn: 'Rabi' },
        climate: 'Cool and dry climate during growth. Temp 15-25°C.',
        soilRequirement: 'Sandy loam to clay loam soils. Extremely sensitive to waterlogging.',
        seedVarieties: ['Pusa Bold', 'Kranti', 'RH-30', 'Varuna'],
        seedRate: '1.5-2 kg per acre',
        nurseryGuide: 'Direct sowing.',
        sowingProcess: 'Sow in October. Line spacing of 30 cm, depth of 2-3 cm.',
        fertilizerSchedule: 'N:P:K @ 80:40:40 kg/ha. Apply Sulphur (20-25 kg/ha) to increase oil content.',
        irrigationSchedule: 'Requires 2 critical irrigations: first at pre-flowering stage (30 days), second at pod filling stage (60 days).',
        weedManagement: 'Hand weeding at 20-25 days. Apply Pendimethalin (1.0 L/acre) as pre-emergence.',
        diseaseManagement: 'Alternaria Blight (spray Mancozeb @ 2.5 g/L). White Rust (spray Ridomil @ 2 g/L).',
        pestManagement: 'Mustard Aphid (spray Dimethoate 30 EC @ 1 ml/L or Thiamethoxam).',
        harvestGuide: 'Harvest as soon as pods turn yellow-brown. Avoid over-ripening to prevent shattering.',
        storageGuide: 'Dry seeds to 8% moisture before storing to prevent fungal growth.',
        marketDemand: 'High. Sold in local oil mills and Bhabua Mandi.',
        yieldEstimates: '6-8 quintals per acre',
        photoUrl: 'https://images.unsplash.com/photo-1529511582893-2d7e684dd128?w=400'
      },
      {
        cropId: 'CRP-000004',
        name: { en: 'Potato', hi: 'आलू', hn: 'Aloo' },
        localName: 'Aloo',
        scientificName: 'Solanum tuberosum',
        introduction: 'A high-value cash crop grown extensively during the winter months in Pateri.',
        season: { en: 'Rabi', hi: 'रबी', hn: 'Rabi' },
        climate: 'Cool night temperatures (15-20°C) are crucial for tuberization.',
        soilRequirement: 'Loose, well-aerated sandy loam rich in organic matter.',
        seedVarieties: ['Kufri Jyoti', 'Kufri Pukhraj', 'Kufri Bahar', 'Kufri Ashoka'],
        seedRate: '12-15 quintals of seed tubers per acre',
        nurseryGuide: 'Sprout seed tubers in shade before planting.',
        sowingProcess: 'Plant tubers in ridges. Spacing 60x20 cm. Planting depth 8-10 cm.',
        fertilizerSchedule: 'N:P:K @ 150:80:100 kg/ha. Apply well-decomposed FYM (15-20 tons/ha) during land prep.',
        irrigationSchedule: 'Keep soil moist. Irrigate every 10-12 days. Stop irrigation 10 days before harvesting.',
        weedManagement: 'Perform earthing up at 25-30 days to cover growing tubers. Apply Metribuzin @ 200g/acre.',
        diseaseManagement: 'Late Blight (spray Mancozeb @ 2.5 g/L preventatively, or Metalaxyl+Mancozeb if symptoms appear).',
        pestManagement: 'Aphids and Cutworms (apply Chlorpyriphos @ 2 ml/L or Chlorantraniliprole).',
        harvestGuide: 'Cut foliage (dehaulming) 10-12 days before harvest to harden skin. Dig out carefully.',
        storageGuide: 'Keep in shade for curing. Store in cold storage at 4°C for long shelf life.',
        marketDemand: 'Excellent local demand. Direct sale to cold storages and local vegetable markets.',
        yieldEstimates: '100-120 quintals per acre',
        photoUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'
      }
    ];
    await Crop.insertMany(cropsData);

    console.log('Seeding Government Schemes...');
    const schemesData = [
      {
        title: 'PM Kisan Samman Nidhi Yojana',
        description: 'Government initiative that provides up to ₹6,000 per year in three equal installments directly into the bank accounts of small and marginal farmers.',
        category: 'Farmers',
        eligibility: 'All small and marginal landholding farmer families who own cultivable land in their name.',
        requiredDocuments: ['Aadhaar Card', 'Land Registry Documents (LPC/Khasra)', 'Bank Account details', 'Mobile Number linked with Aadhaar'],
        benefits: '₹6,000 per year distributed in three installments of ₹2,000 each.',
        applicationProcess: 'Apply online through the PM-Kisan portal, or submit forms to the local Vasudha Kendra / Panchayat Secretary Amit Kumar.',
        isActive: true
      },
      {
        title: 'Bihar Post Matric Scholarship Scheme',
        description: 'Financial assistance for students belonging to SC, ST, OBC, and EBC categories pursuing higher education after matriculation (Class 10).',
        category: 'Students',
        eligibility: 'Resident of Bihar, belonging to SC/ST/OBC/EBC categories. Family income must be under ₹3 Lakh per annum.',
        requiredDocuments: ['Caste Certificate', 'Income Certificate', 'Residential Certificate', 'Fee Receipt from College', 'Bonafide Certificate', 'Class 10 Marksheet'],
        benefits: 'Reimbursement of tuition fees and academic maintenance allowance ranging from ₹2,000 to ₹15,000 per year depending on the course.',
        applicationProcess: 'Apply online on the PMS Bihar portal (pmsonline.bih.nic.in). Print the application and submit it to college authorities.',
        isActive: true
      },
      {
        title: 'Mukhyamantri Kanya Utthan Yojana',
        description: 'A scheme to promote female education and health, preventing female foeticide and child marriages by providing financial assistance to girls from birth till graduation.',
        category: 'Women',
        eligibility: 'Girl children who are permanent residents of Bihar. Applicable up to two girls per family.',
        requiredDocuments: ['Birth Certificate', 'Aadhaar Card of Child/Mother', 'Bank Account of Mother', 'Intermediate/Graduation Passing Certificate'],
        benefits: 'Total assistance of ₹50,000: ₹2,000 at birth, ₹1,000 on immunization, ₹10,000 on passing Intermediate, and ₹25,000 on completing Graduation.',
        applicationProcess: 'Apply online through the government web portal (e-Kalyan Bihar) or through local Anganwadi workers.',
        isActive: true
      },
      {
        title: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)',
        description: 'Monthly pension for senior citizens from low-income families to provide social security and dignity.',
        category: 'Senior Citizens',
        eligibility: 'Individuals aged 60 years or above, belonging to a household below the poverty line (BPL list).',
        requiredDocuments: ['Aadhaar Card', 'Age Proof Certificate', 'BPL Card / Income Proof', 'Bank Passbook copy', 'Passport size photograph'],
        benefits: '₹400 per month for individuals aged 60-79 years, and ₹500 per month for those aged 80 years or above.',
        applicationProcess: 'Fill out the physical form and submit it to the Block Development Office (RTPS Counter) or through Panchayat Secretary Amit Kumar.',
        isActive: true
      },
      {
        title: 'Bihar Labour Card Scheme',
        description: 'Registration and welfare scheme for unorganized construction workers, providing various health, accident, and marriage assistance benefits.',
        category: 'Labourers',
        eligibility: 'Unorganized construction workers (masons, painters, electricians, laborers) aged 18-60 years who worked for at least 90 days in the last year.',
        requiredDocuments: ['Aadhaar Card', '90 Days Work Certificate', 'Bank Passbook', 'Mobile Number', 'Passport size photo'],
        benefits: 'Annual medical aid of ₹3,000, cycle purchase aid, tools purchasing aid, and financial support for children\'s marriages and education.',
        applicationProcess: 'Submit registration application online at the Bihar Labour Department portal or locally through Rozgar Sewak Vikram Singh.',
        isActive: true
      }
    ];
    await Scheme.insertMany(schemesData);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database Seeding Failed:', error);
    process.exit(1);
  }
};

runSeeder();
