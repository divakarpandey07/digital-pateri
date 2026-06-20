const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_pateri';

// Import Models
const Village = require('../models/Village');
const Resident = require('../models/Resident');
const User = require('../models/User');

const seedRealVoters = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const village = await Village.findOne({ villageCode: 'PAT-821106' });
    if (!village) {
      console.error('Village not found! Please run npm run seed first.');
      process.exit(1);
    }

    // Load voters.json
    const votersPath = path.join(__dirname, 'voters.json');
    if (!fs.existsSync(votersPath)) {
      console.error('voters.json not found! Run parse_and_export_voters.py first.');
      process.exit(1);
    }

    const rawVoters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
    console.log(`Loaded ${rawVoters.length} voter records from voters.json`);

    // Clear existing residents and user profiles
    console.log('Clearing old residents and user accounts...');
    await Resident.deleteMany({});
    await User.deleteMany({});

    console.log('Inserting real resident profiles...');

    // We will build the residents array first with new ObjectIds
    const residentsToCreate = [];
    const nameToResidentMap = new Map(); // Key: name_house_ward, Value: resident object

    // Helper to map Mohalla based on Ward
    const getMohalla = (ward) => {
      const w = parseInt(ward);
      if (w === 1 || w === 5 || w === 9) return 'Dalit Basti';
      if (w === 2 || w === 6 || w === 10) return 'Pipra Tola';
      if (w === 3 || w === 7 || w === 11) return 'Market Area';
      if (w === 4 || w === 8 || w === 12) return 'Purab Tola';
      return 'Pateri Central';
    };

    rawVoters.forEach((v, idx) => {
      const _id = new mongoose.Types.ObjectId();
      const padNum = String(idx + 1).padStart(4, '0');
      const residentId = `PAT-RES-${padNum}`;

      // Calculate approximate Date of Birth
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
        address: `House No. ${v.house}`,
        mohalla: '',
        ward: v.ward,
        occupation: 'Resident', // default occupation, blank skills as requested
        skills: [],
        education: 'Matriculation',
        bloodGroup: 'O+',
        mobile: '',
        emergencyContact: '',
        photo: '',
        isPublicProfile: true,
        relations: [],
        verificationStatus: true,
        isDeleted: false
      };

      residentsToCreate.push(resObj);

      // Save to map for relationship linking later
      const key = `${v.name.trim()}_${v.house}_${v.ward}`;
      nameToResidentMap.set(key, resObj);
    });

    console.log('Linking family relationships (Spouses & Parents)...');

    // Build the bi-directional relationship links
    rawVoters.forEach((v, idx) => {
      const currentRes = residentsToCreate[idx];
      const relativeName = v.relativeName.trim();
      const relationType = v.relationType; // 'Father' or 'Spouse' or 'Mother'

      // Search for the relative in the same house and ward
      const relativeKey = `${relativeName}_${v.house}_${v.ward}`;
      const relativeRes = nameToResidentMap.get(relativeKey);

      if (relativeRes && relativeRes._id.toString() !== currentRes._id.toString()) {
        // Link current resident to relative
        currentRes.relations.push({
          relativeId: relativeRes._id,
          relationType: relationType
        });

        // Link relative back to current resident
        let inverseRelation = 'Child';
        if (relationType === 'Spouse') {
          inverseRelation = 'Spouse';
        }
        
        relativeRes.relations.push({
          relativeId: currentRes._id,
          relationType: inverseRelation
        });
      }
    });

    // Bulk insert the residents
    console.log('Writing residents to database...');
    await Resident.insertMany(residentsToCreate);
    console.log(`Successfully seeded ${residentsToCreate.length} residents.`);

    // Recreate User logins
    console.log('Recreating user credentials for system evaluation...');

    // 1. Super Admin
    await User.create({
      email: 'admin@pateri.in',
      password: 'admin123',
      roles: ['Super Admin']
    });

    // Link other roles to actual residents in the database
    // We'll pick residents from different parts of the list
    const findResidentByName = (name) => {
      return residentsToCreate.find(r => r.name.includes(name));
    };

    // Pick some names to link
    const firstMale = residentsToCreate.find(r => r.gender === 'Male');
    const firstFemale = residentsToCreate.find(r => r.gender === 'Female');
    const secondMale = residentsToCreate.find(r => r.gender === 'Male' && r._id !== firstMale._id);
    const thirdMale = residentsToCreate.find(r => r.gender === 'Male' && r._id !== firstMale._id && r._id !== secondMale._id);
    const secondFemale = residentsToCreate.find(r => r.gender === 'Female' && r._id !== firstFemale._id);

    // Panchayat Admin (First Male)
    await User.create({
      email: 'panchayat@pateri.in',
      password: 'panchayat123',
      roles: ['Panchayat Admin'],
      residentProfile: firstMale ? firstMale._id : null
    });

    // Doctor (Second Male)
    await User.create({
      email: 'ramesh@pateri.in',
      password: 'ramesh123',
      roles: ['Resident'],
      residentProfile: secondMale ? secondMale._id : null
    });
    // Update his occupation to Doctor
    if (secondMale) {
      await Resident.findByIdAndUpdate(secondMale._id, { occupation: 'Doctor' });
    }

    // Student (Third Male)
    await User.create({
      email: 'manish@pateri.in',
      password: 'manish123',
      roles: ['Resident', 'Volunteer'],
      residentProfile: thirdMale ? thirdMale._id : null
    });
    // Update his occupation to Student
    if (thirdMale) {
      await Resident.findByIdAndUpdate(thirdMale._id, { occupation: 'Student' });
    }

    // Electrician (First Female or another resident)
    const fourthMale = residentsToCreate.find(r => r.gender === 'Male' && ![firstMale, secondMale, thirdMale].includes(r));
    await User.create({
      email: 'pappu@pateri.in',
      password: 'pappu123',
      roles: ['Resident', 'Volunteer'],
      residentProfile: fourthMale ? fourthMale._id : null
    });
    // Update his occupation to Electrician
    if (fourthMale) {
      await Resident.findByIdAndUpdate(fourthMale._id, { occupation: 'Electrician' });
    }

    // Shop Owner (First Female)
    await User.create({
      email: 'shanti@pateri.in',
      password: 'shanti123',
      roles: ['Resident'],
      residentProfile: firstFemale ? firstFemale._id : null
    });
    // Update her occupation to Shop Owner
    if (firstFemale) {
      await Resident.findByIdAndUpdate(firstFemale._id, { occupation: 'Shop Owner' });
    }

    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed real voters failed:', error);
    process.exit(1);
  }
};

seedRealVoters();
