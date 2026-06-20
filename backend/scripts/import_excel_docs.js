const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_pateri';

// Import Models
const Village = require('../models/Village');
const Document = require('../models/Document');
const User = require('../models/User');

const importExcelDocs = async () => {
  try {
    console.log('Connecting to database for document import...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const village = await Village.findOne({ villageCode: 'PAT-821106' });
    if (!village) {
      console.error('Village not found! Run npm run seed first.');
      process.exit(1);
    }

    const adminUser = await User.findOne({ email: 'admin@pateri.in' });

    const dataDir = path.join(__dirname, '../../data');
    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.xls') || f.endsWith('.xlsx'));

    console.log(`Found ${files.length} Excel reports. Importing to Document Vault...`);

    let count = 0;
    for (const filename of files) {
      // Check if document already exists
      const title = filename.replace(/\.xls[x]?$/, '');
      const existingDoc = await Document.findOne({ title, villageId: village._id });
      
      if (existingDoc) {
        console.log(`Document already exists: "${title}". Skipping.`);
        continue;
      }

      // We save the path relative to the workspace, or we can copy them to public folder of backend
      // Let's create a public uploads folder in the backend, or just make it direct file link.
      // To keep it simple, we point to /data/filename which is served or can be downloaded.
      await Document.create({
        villageId: village._id,
        title,
        category: 'Panchayat Notices',
        fileUrl: `/data/${filename}`, // Link pointing to the workspace folder
        visibility: 'Public',
        downloadCount: 0,
        uploadedBy: adminUser ? adminUser._id : null
      });
      count++;
    }

    console.log(`Successfully imported ${count} GPDP Excel reports into the Document Vault!`);
    process.exit(0);
  } catch (error) {
    console.error('Document import failed:', error);
    process.exit(1);
  }
};

importExcelDocs();
