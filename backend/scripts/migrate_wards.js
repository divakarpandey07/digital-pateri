const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_pateri';

// Import Models
const Resident = require('../models/Resident');

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

const runMigration = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    const votersPath = path.join(__dirname, 'voters.json');
    if (!fs.existsSync(votersPath)) {
      console.error('voters.json not found! Cannot run migration.');
      process.exit(1);
    }

    const voters = JSON.parse(fs.readFileSync(votersPath, 'utf8'));
    console.log(`Loaded ${voters.length} voters from voters.json`);

    // Build voter lookup map
    const voterMap = new Map();
    voters.forEach(v => {
      // Primary key: name + relativeName
      const key = `${normalizeName(v.name)}_${normalizeName(v.relativeName)}`;
      voterMap.set(key, v);
    });

    const residents = await Resident.find({ isDeleted: false });
    console.log(`Loaded ${residents.length} active residents from database.`);

    let updatedCount = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;

    const bulkOps = [];

    for (const r of residents) {
      let ward = '01';
      let hNum = 1;
      let part = '91';
      let matched = false;

      // Special overrides for leadership profiles and manual entries
      if (r.name === 'Reshad Khan') {
        ward = '04';
        hNum = 27;
        matched = true;
      } else if (r.name === 'Gyashuddin') {
        ward = '01';
        hNum = 27;
        matched = true;
      } else if (r.name === 'Naushad Khan') {
        ward = '03';
        hNum = 44;
        matched = true;
      } else if (r.name === 'Satyam Kumar Singh') {
        ward = '01';
        hNum = 101;
        matched = true;
      } else if (r.name === 'Abhishek Singh') {
        ward = '06';
        hNum = 102;
        matched = true;
      } else if (r.name === 'Amit Kumar') {
        ward = '03';
        hNum = 102;
        matched = true;
      } else if (r.name === 'Vikram Singh') {
        ward = '05';
        hNum = 103;
        matched = true;
      } else if (r.name === 'Sunita Devi') {
        ward = '02';
        hNum = 104;
        matched = true;
      } else {
        // Find in voters list
        const key = `${normalizeName(r.name)}_${normalizeName(r.fatherName)}`;
        const voter = voterMap.get(key);

        if (voter) {
          part = voter.part;
          hNum = parseInt(voter.house, 10) || 1;
          matched = true;
          matchedCount++;
        } else {
          // Fallback name-only search
          const foundVoter = voters.find(v => normalizeName(v.name) === normalizeName(r.name));
          if (foundVoter) {
            part = foundVoter.part;
            hNum = parseInt(foundVoter.house, 10) || 1;
            matched = true;
            matchedCount++;
          }
        }
      }

      if (matched && !['Reshad Khan', 'Gyashuddin', 'Naushad Khan', 'Satyam Kumar Singh', 'Abhishek Singh', 'Amit Kumar', 'Vikram Singh', 'Sunita Devi'].includes(r.name)) {
        // Calculate ward based on part and house
        if (part === '91') {
          ward = String(Math.min(5, Math.floor((hNum - 1) / 23) + 1)).padStart(2, '0');
        } else if (part === '92') {
          ward = String(Math.min(10, Math.floor((hNum - 1) / 73) + 6)).padStart(2, '0');
        } else if (part === '93') {
          ward = String(Math.min(14, Math.floor((hNum - 1) / 7) + 11)).padStart(2, '0');
        } else {
          ward = '01';
        }
      } else if (!matched) {
        unmatchedCount++;
        // If not matched, try parsing house number from their existing houseNo/address or rationCard
        const match = (r.houseNo || '').match(/H(\d+)/i) || (r.address || '').match(/House No\.\s*(\d+)/i);
        if (match) {
          hNum = parseInt(match[1], 10) || 1;
        } else {
          hNum = 1;
        }
        // Distribute unmatched residents logically across wards 1-14
        const wNum = Math.min(14, ((hNum - 1) % 14) + 1);
        ward = String(wNum).padStart(2, '0');
      }

      // Determine mohalla based on ward
      const w = parseInt(ward, 10);
      let mohalla = 'Pateri Central';
      if (w === 1) mohalla = 'Dada Patti';
      else if (w === 5 || w === 9 || w === 13) mohalla = 'Dalit Basti';
      else if (w === 2 || w === 6 || w === 10 || w === 14) mohalla = 'Pipra Tola';
      else if (w === 3 || w === 7 || w === 11) mohalla = 'Market Area';
      else if (w === 4 || w === 8 || w === 12) mohalla = 'Purab Tola';

      // Fix verification status schema mismatch (convert boolean to string if any exists)
      let verificationStatus = r.verificationStatus;
      if (verificationStatus === true || verificationStatus === 'true') {
        verificationStatus = 'verified';
      } else if (verificationStatus === false || verificationStatus === 'false') {
        verificationStatus = 'unverified';
      }

      bulkOps.push({
        updateOne: {
          filter: { _id: r._id },
          update: {
            $set: {
              ward,
              houseNo: `W${ward}-H${hNum}`,
              mohalla,
              address: `House No. ${hNum}, Ward No. ${ward}, Mohalla ${mohalla}, Pateri`,
              verificationStatus
            }
          }
        }
      });
      updatedCount++;
    }

    if (bulkOps.length > 0) {
      console.log(`Executing bulkWrite of ${bulkOps.length} updates...`);
      await Resident.bulkWrite(bulkOps);
      console.log('bulkWrite complete.');
    }

    console.log('\nMigration Summary:');
    console.log(`- Total residents processed: ${residents.length}`);
    console.log(`- Residents successfully updated: ${updatedCount}`);
    console.log(`- Matched to voters list: ${matchedCount}`);
    console.log(`- Unmatched (allocated via fallback): ${unmatchedCount}`);

    console.log('\nVerifying current ward distribution in DB...');
    const dbCounts = await Resident.aggregate([
      { $group: { _id: '$ward', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('New Ward Counts in DB:', dbCounts);

    await mongoose.disconnect();
    console.log('Disconnected. Migration complete.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
