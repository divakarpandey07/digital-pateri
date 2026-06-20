const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_pateri';

// Import Models
const Village = require('../models/Village');
const Resident = require('../models/Resident');

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

const importRationData = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const village = await Village.findOne({ villageCode: 'PAT-821106' });
    if (!village) {
      console.error('Village not found! Please run npm run seed first.');
      process.exit(1);
    }

    const dataPath = path.join(__dirname, 'ration_data.json');
    if (!fs.existsSync(dataPath)) {
      console.error('ration_data.json not found! Run the python crawler first.');
      process.exit(1);
    }

    const cards = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`Loaded ${cards.length} ration card records.`);

    // 1. Load all residents from the database to build a fast lookup map
    const residents = await Resident.find({});
    console.log(`Loaded ${residents.length} existing residents from database.`);

    // Map: normalizedName_normalizedRelative -> Resident
    const residentMap = new Map();
    residents.forEach(r => {
      const key = `${normalizeName(r.name)}_${normalizeName(r.fatherName)}`;
      residentMap.set(key, r);
    });

    // Also a map of residentId to increment
    let maxNum = 0;
    residents.forEach(r => {
      const match = r.residentId.match(/PAT-RES-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        if (num > maxNum) maxNum = num;
      }
    });
    console.log(`Max Resident ID sequence: ${maxNum}`);

    // Helper to generate next residentId
    const getNextResidentId = () => {
      maxNum++;
      const padNum = String(maxNum).padStart(4, '0');
      return `PAT-RES-${padNum}`;
    };

    let matchedCount = 0;
    let createdCount = 0;

    // We will process each card sequentially
    for (const card of cards) {
      const { rationCardNumber, cardType, fpsDealer, members } = card;
      if (!members || members.length === 0) continue;

      console.log(`Processing card ${rationCardNumber} with ${members.length} members...`);

      const cardMemberProfiles = []; // Store profiles for all members of this card

      // First pass: Find existing or create new profiles for all members on this card
      for (const m of members) {
        let profile = null;
        
        // Attempt match by Name + Father's Name
        const key1 = `${normalizeName(m.nameEnglish)}_${normalizeName(m.fatherNameEnglish)}`;
        // Attempt inverse match (Husband name instead of Father name, etc.)
        const key2 = `${normalizeName(m.nameEnglish)}_${normalizeName(m.nameEnglish)}`; // Self match if relative matches name
        
        profile = residentMap.get(key1);
        
        // If not matched, try searching in DB by exact/fuzzy name and father name
        if (!profile) {
          profile = residents.find(r => 
            normalizeName(r.name) === normalizeName(m.nameEnglish) &&
            (normalizeName(r.fatherName) === normalizeName(m.fatherNameEnglish) || normalizeName(m.fatherNameEnglish).includes(normalizeName(r.fatherName)) || normalizeName(r.fatherName).includes(normalizeName(m.fatherNameEnglish)))
          );
        }

        if (profile) {
          // Matched existing resident
          matchedCount++;
          // Update card fields
          profile.rationCardNumber = rationCardNumber;
          profile.cardType = cardType;
          profile.fpsDealer = fpsDealer;
          
          // Clear old relations to rebuild strictly from ration tree
          profile.relations = [];
          
          cardMemberProfiles.push({ member: m, doc: profile, isNew: false });
        } else {
          // Create new resident profile
          createdCount++;
          const newId = getNextResidentId();
          const birthYear = 2026 - m.age;
          const dob = new Date(`${birthYear}-01-01`);

          const newDoc = new Resident({
            villageId: village._id,
            residentId: newId,
            name: m.nameEnglish,
            fatherName: m.fatherNameEnglish,
            dob: dob,
            gender: m.gender,
            address: 'House No. Unknown', // Will propagate below
            mohalla: '',
            ward: '01', // Will propagate below
            occupation: 'Resident',
            skills: [],
            education: 'Matriculation',
            bloodGroup: 'O+',
            mobile: '',
            emergencyContact: '',
            photo: '',
            isPublicProfile: true,
            relations: [],
            verificationStatus: true,
            rationCardNumber: rationCardNumber,
            cardType: cardType,
            fpsDealer: fpsDealer
          });

          // Add to local references
          residents.push(newDoc);
          const newKey = `${normalizeName(m.nameEnglish)}_${normalizeName(m.fatherNameEnglish)}`;
          residentMap.set(newKey, newDoc);

          cardMemberProfiles.push({ member: m, doc: newDoc, isNew: true });
        }
      }

      // Propagate Address & Ward from matched members to new members
      const matchedWithAddress = cardMemberProfiles.find(p => !p.isNew && p.doc.address && p.doc.address !== 'House No. Unknown');
      if (matchedWithAddress) {
        const addr = matchedWithAddress.doc.address;
        const ward = matchedWithAddress.doc.ward;
        const mohalla = matchedWithAddress.doc.mohalla;

        cardMemberProfiles.forEach(p => {
          if (p.isNew) {
            p.doc.address = addr;
            p.doc.ward = ward;
            p.doc.mohalla = mohalla;
          }
        });
      } else {
        // If no family member matched, assign to Head's card info (default House No based on last 4 digits of card)
        const lastDigits = rationCardNumber.slice(-4);
        const houseNum = parseInt(lastDigits) % 200 || 1; // map card digits to house number 1-200
        cardMemberProfiles.forEach(p => {
          if (p.doc.address === 'House No. Unknown') {
            p.doc.address = `House No. ${houseNum}`;
            p.doc.ward = '01'; // Default ward
          }
        });
      }

      // Second pass: Establish family relations
      const headProfile = cardMemberProfiles.find(p => p.member.relationHindi === 'स्वयं');
      if (headProfile) {
        cardMemberProfiles.forEach(p => {
          if (p.doc._id.toString() === headProfile.doc._id.toString()) return; // skip head

          const relHi = p.member.relationHindi;
          let relationType = ''; // relation of member from head's perspective
          let inverseRelationType = ''; // relation of head from member's perspective

          if (relHi.includes('पति') || relHi.includes('सौहर')) {
            relationType = 'Spouse';
            inverseRelationType = 'Spouse';
          } else if (relHi.includes('पत्नी') || relHi.includes('स्त्री')) {
            relationType = 'Spouse';
            inverseRelationType = 'Spouse';
          } else if (relHi.includes('पुत्र') || relHi.includes('बेटा')) {
            relationType = 'Child';
            inverseRelationType = headProfile.doc.gender === 'Male' ? 'Father' : 'Mother';
          } else if (relHi.includes('पुत्री') || relHi.includes('बेटी')) {
            relationType = 'Child';
            inverseRelationType = headProfile.doc.gender === 'Male' ? 'Father' : 'Mother';
          } else if (relHi.includes('माता') || relHi.includes('माँ')) {
            relationType = 'Mother';
            inverseRelationType = 'Child';
          } else if (relHi.includes('पिता')) {
            relationType = 'Father';
            inverseRelationType = 'Child';
          } else if (relHi.includes('भाई') || relHi.includes('बहन')) {
            relationType = 'Sibling';
            inverseRelationType = 'Sibling';
          }

          if (relationType && inverseRelationType) {
            // Link head -> member
            headProfile.doc.relations.push({
              relativeId: p.doc._id,
              relationType: relationType
            });
            // Link member -> head
            p.doc.relations.push({
              relativeId: headProfile.doc._id,
              relationType: inverseRelationType
            });
          }
        });
      }

      // Save all updated/created docs for this card
      for (const p of cardMemberProfiles) {
        await p.doc.save();
      }
    }

    console.log('\nImport Summary:');
    console.log(`- Scraped cards processed: ${cards.length}`);
    console.log(`- Database records matched & updated: ${matchedCount}`);
    console.log(`- New resident profiles created: ${createdCount}`);
    
    console.log('Finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err);
    process.exit(1);
  }
};

importRationData();
