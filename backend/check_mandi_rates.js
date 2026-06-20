const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const MandiRate = require('./models/MandiRate');

  const total = await MandiRate.countDocuments();
  console.log('Total MandiRate documents:', total);

  const kaimurCount = await MandiRate.countDocuments({ district: 'Kaimur' });
  console.log('Kaimur MandiRate documents:', kaimurCount);

  if (kaimurCount > 0) {
    const sample = await MandiRate.findOne({ district: 'Kaimur' }).sort({ arrivalDate: -1 });
    console.log('Latest Kaimur record:', JSON.stringify(sample, null, 2));
    
    // Test the logic inside getMandiRates
    const latestDate = new Date(sample.arrivalDate);
    latestDate.setHours(0, 0, 0, 0);
    console.log('latestDate:', latestDate);
    
    const records = await MandiRate.find({
      arrivalDate: { $gte: latestDate },
      district: 'Kaimur'
    });
    console.log('Number of records on latest date:', records.length);
  }

  process.exit(0);
}

run().catch(console.error);
