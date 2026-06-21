const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const Resident = mongoose.model('Resident', new mongoose.Schema({}, { strict: false }));
  
  // Aggregate residents by ward to see the count per ward
  const wardCounts = await Resident.aggregate([
    { $group: { _id: '$ward', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  
  console.log('Ward Counts in DB:', wardCounts);

  // Check a few samples
  const samples = await Resident.find().limit(5).select('name ward address houseNo');
  console.log('Sample Resident Wards:', JSON.stringify(samples, null, 2));

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(console.error);
