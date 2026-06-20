const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital_pateri';

// Import Models
const Village = require('../models/Village');
const Resident = require('../models/Resident');
const User = require('../models/User');

const seedFamilyRoster = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const village = await Village.findOne({ villageCode: 'PAT-821106' });
    if (!village) {
      console.error('Village not found! Run npm run seed first.');
      process.exit(1);
    }

    // Clear existing residents and links
    console.log('Clearing existing residents and references...');
    await Resident.deleteMany({});
    
    // We also need to clear all user accounts
    await User.deleteMany({});

    console.log('Inserting 30 detailed residents...');

    const nowYear = 2026;
    
    // Raw definitions of 30 residents grouped by family/house
    const rawResidents = [
      // === FAMILY 1: Pandey Family (House 101, Ward 04, Mohalla Purab Tola) ===
      {
        residentId: 'PAT-RES-0001',
        name: 'Ramakant Pandey',
        fatherName: 'Late Shivshankar Pandey',
        dob: new Date(`${nowYear - 61}-08-15`),
        gender: 'Male',
        address: 'House No. 101, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Farmer',
        skills: ['Organic Farming', 'Soil Management', 'Cattle Breeding'],
        education: 'Intermediate',
        bloodGroup: 'O+',
        mobile: '9473385741',
        emergencyContact: '9431102299',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        residentId: 'PAT-RES-0002',
        name: 'Kanti Devi',
        fatherName: 'Ramprasad Tiwari',
        dob: new Date(`${nowYear - 56}-04-10`),
        gender: 'Female',
        address: 'House No. 101, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Housewife',
        skills: ['Traditional Sewing', 'Pickle Making', 'Animal Husbandry'],
        education: 'Matriculation',
        bloodGroup: 'A+',
        mobile: '9473385742',
        emergencyContact: '9473385741',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      },
      {
        residentId: 'PAT-RES-0003',
        name: 'Dr. Ramesh Chandra',
        fatherName: 'Ramakant Pandey',
        dob: new Date(`${nowYear - 36}-05-12`),
        gender: 'Male',
        address: 'House No. 101, Ward No. 04, Mohalla Purab Tola',
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
        residentId: 'PAT-RES-0004',
        name: 'Dr. Neha Chandra',
        fatherName: 'Satish Dubey',
        dob: new Date(`${nowYear - 32}-09-20`),
        gender: 'Female',
        address: 'House No. 101, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Doctor',
        skills: ['Gynecology', 'Maternal Care', 'Nutrition Counselling'],
        education: 'MBBS, DGO',
        bloodGroup: 'B+',
        mobile: '9431102290',
        emergencyContact: '9431102299',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150'
      },
      {
        residentId: 'PAT-RES-0005',
        name: 'Aarav Pandey',
        fatherName: 'Ramesh Chandra',
        dob: new Date(`${nowYear - 8}-11-05`),
        gender: 'Male',
        address: 'House No. 101, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Student',
        skills: ['Drawing', 'Chess', 'Computer Basics'],
        education: 'Primary School (Class 3)',
        bloodGroup: 'O+',
        mobile: '',
        emergencyContact: '9431102299',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
      },

      // === FAMILY 2: Singh Family (House 102, Ward 02, Mohalla Pipra Tola) ===
      {
        residentId: 'PAT-RES-0006',
        name: 'Vaidyanath Singh',
        fatherName: 'Late Kedar Singh',
        dob: new Date(`${nowYear - 55}-01-25`),
        gender: 'Male',
        address: 'House No. 102, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Teacher',
        skills: ['School Administration', 'Mathematics Coaching', 'Hindi Literature'],
        education: 'M.Sc, B.Ed',
        bloodGroup: 'B+',
        mobile: '9955511221',
        emergencyContact: '9934421155',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        residentId: 'PAT-RES-0007',
        name: 'Shanti Devi',
        fatherName: 'Late Haridwar Singh',
        dob: new Date(`${nowYear - 48}-07-14`),
        gender: 'Female',
        address: 'House No. 102, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Shop Owner',
        skills: ['Micro-finance Management', 'Women SHG Organizing', 'Tailoring'],
        education: 'Intermediate',
        bloodGroup: 'A+',
        mobile: '9934421155',
        emergencyContact: '9955511221',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=150'
      },
      {
        residentId: 'PAT-RES-0008',
        name: 'Sunita Devi',
        fatherName: 'Late Kedar Singh',
        dob: new Date(`${nowYear - 41}-02-28`),
        gender: 'Female',
        address: 'House No. 102, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Teacher',
        skills: ['Primary Education', 'Bhojpuri Literature', 'Creative Writing'],
        education: 'B.Ed, MA',
        bloodGroup: 'B+',
        mobile: '9955511223',
        emergencyContact: '9955511221',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      },
      {
        residentId: 'PAT-RES-0009',
        name: 'Manish Kumar Singh',
        fatherName: 'Vaidyanath Singh',
        dob: new Date(`${nowYear - 24}-04-18`),
        gender: 'Male',
        address: 'House No. 102, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Student',
        skills: ['Web Design', 'Social Media Coordination', 'Cricket Coaching'],
        education: 'B.Sc Computer Science (Final Year)',
        bloodGroup: 'O+',
        mobile: '9955511224',
        emergencyContact: '9955511221',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
      },
      {
        residentId: 'PAT-RES-0010',
        name: 'Pooja Singh',
        fatherName: 'Vaidyanath Singh',
        dob: new Date(`${nowYear - 22}-12-10`),
        gender: 'Female',
        address: 'House No. 102, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Student',
        skills: ['Debating', 'Rangoli Making', 'Basic Nursing'],
        education: 'B.A English Hons.',
        bloodGroup: 'B+',
        mobile: '9955511225',
        emergencyContact: '9955511221',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },

      // === FAMILY 3: Ram Family (House 103, Ward 01, Mohalla Dalit Basti) ===
      {
        residentId: 'PAT-RES-0011',
        name: 'Basawan Ram',
        fatherName: 'Late Somar Ram',
        dob: new Date(`${nowYear - 58}-10-05`),
        gender: 'Male',
        address: 'House No. 103, Ward No. 01, Mohalla Dalit Basti',
        mohalla: 'Dalit Basti',
        ward: '01',
        occupation: 'Laborer',
        skills: ['Masonry', 'Plumbing', 'Crop Harvesting'],
        education: 'Literate',
        bloodGroup: 'O-',
        mobile: '8877554411',
        emergencyContact: '8877554422',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
      },
      {
        residentId: 'PAT-RES-0012',
        name: 'Radhika Devi',
        fatherName: 'Jagdish Ram',
        dob: new Date(`${nowYear - 53}-03-12`),
        gender: 'Female',
        address: 'House No. 103, Ward No. 01, Mohalla Dalit Basti',
        mohalla: 'Dalit Basti',
        ward: '01',
        occupation: 'Helper',
        skills: ['Anganwadi Care', 'Childcare', 'Midwifery Assistant'],
        education: 'Primary School',
        bloodGroup: 'A+',
        mobile: '8877554412',
        emergencyContact: '8877554411',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150'
      },
      {
        residentId: 'PAT-RES-0013',
        name: 'Pappu Kumar',
        fatherName: 'Basawan Ram',
        dob: new Date(`${nowYear - 31}-10-10`),
        gender: 'Male',
        address: 'House No. 103, Ward No. 01, Mohalla Dalit Basti',
        mohalla: 'Dalit Basti',
        ward: '01',
        occupation: 'Electrician',
        skills: ['House Wiring', 'Solar Panel Installation', 'Motor Repair'],
        education: 'ITI Electrician',
        bloodGroup: 'A+',
        mobile: '8877554422',
        emergencyContact: '8877554411',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1542156822-6924d1a71aba?w=150'
      },
      {
        residentId: 'PAT-RES-0014',
        name: 'Gita Kumari',
        fatherName: 'Ramchandra Ram',
        dob: new Date(`${nowYear - 28}-06-08`),
        gender: 'Female',
        address: 'House No. 103, Ward No. 01, Mohalla Dalit Basti',
        mohalla: 'Dalit Basti',
        ward: '01',
        occupation: 'Artisan',
        skills: ['Sujini Embroidery', 'Bangle Crafting', 'Vegetable Preservation'],
        education: 'Middle School',
        bloodGroup: 'B+',
        mobile: '8877554423',
        emergencyContact: '8877554422',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150'
      },
      {
        residentId: 'PAT-RES-0015',
        name: 'Chintu Kumar',
        fatherName: 'Pappu Kumar',
        dob: new Date(`${nowYear - 6}-02-14`),
        gender: 'Male',
        address: 'House No. 103, Ward No. 01, Mohalla Dalit Basti',
        mohalla: 'Dalit Basti',
        ward: '01',
        occupation: 'Student',
        skills: ['Poetry Recitation', 'Singing'],
        education: 'Nursery',
        bloodGroup: 'A+',
        mobile: '',
        emergencyContact: '8877554422',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=150'
      },

      // === FAMILY 4: Verma Family (House 104, Ward 03, Mohalla Market Area) ===
      {
        residentId: 'PAT-RES-0016',
        name: 'Rajesh Verma',
        fatherName: 'Late Nandlal Prasad',
        dob: new Date(`${nowYear - 50}-09-18`),
        gender: 'Male',
        address: 'House No. 104, Ward No. 03, Mohalla Market Area',
        mohalla: 'Market Area',
        ward: '03',
        occupation: 'Shop Owner',
        skills: ['Retail Management', 'Wholesale Accounts', 'Bhojpuri Cuisine'],
        education: 'B.Com',
        bloodGroup: 'AB-',
        mobile: '7766554411',
        emergencyContact: '7766554422',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        residentId: 'PAT-RES-0017',
        name: 'Meena Verma',
        fatherName: 'Kapil Prasad',
        dob: new Date(`${nowYear - 45}-11-05`),
        gender: 'Female',
        address: 'House No. 104, Ward No. 03, Mohalla Market Area',
        mohalla: 'Market Area',
        ward: '03',
        occupation: 'Shop Owner',
        skills: ['Inventory Management', 'Billing', 'Embroidery'],
        education: 'Intermediate',
        bloodGroup: 'B+',
        mobile: '7766554412',
        emergencyContact: '7766554411',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'
      },
      {
        residentId: 'PAT-RES-0018',
        name: 'Suresh Verma',
        fatherName: 'Rajesh Verma',
        dob: new Date(`${nowYear - 26}-01-14`),
        gender: 'Male',
        address: 'House No. 104, Ward No. 03, Mohalla Market Area',
        mohalla: 'Market Area',
        ward: '03',
        occupation: 'Shop Manager',
        skills: ['Tally ERP', 'E-commerce Listing', 'Scooter Repair'],
        education: 'B.Com Hons.',
        bloodGroup: 'AB-',
        mobile: '7766554422',
        emergencyContact: '7766554411',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=150'
      },
      {
        residentId: 'PAT-RES-0019',
        name: 'Rani Verma',
        fatherName: 'Rajesh Verma',
        dob: new Date(`${nowYear - 20}-08-20`),
        gender: 'Female',
        address: 'House No. 104, Ward No. 03, Mohalla Market Area',
        mohalla: 'Market Area',
        ward: '03',
        occupation: 'Student',
        skills: ['Painting', 'English Typing', 'Drama & Skits'],
        education: 'B.Sc (Physics Hons.) - 1st Year',
        bloodGroup: 'B+',
        mobile: '7766554423',
        emergencyContact: '7766554411',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=150'
      },

      // === FAMILY 5: Yadav Family (House 105, Ward 04, Mohalla Purab Tola) ===
      {
        residentId: 'PAT-RES-0020',
        name: 'Dharmanath Yadav',
        fatherName: 'Late Ramsharan Yadav',
        dob: new Date(`${nowYear - 63}-02-12`),
        gender: 'Male',
        address: 'House No. 105, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Farmer',
        skills: ['Dairy Farming', 'Cow Insemination', 'Fodder Cultivation'],
        education: 'Middle School',
        bloodGroup: 'O+',
        mobile: '9546021481',
        emergencyContact: '9546021482',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150'
      },
      {
        residentId: 'PAT-RES-0021',
        name: 'Lilawati Devi',
        fatherName: 'Shambhu Yadav',
        dob: new Date(`${nowYear - 58}-12-10`),
        gender: 'Female',
        address: 'House No. 105, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Dairy Assistant',
        skills: ['Milking Machinery', 'Butter Churning', 'Local Grass Identification'],
        education: 'Primary School',
        bloodGroup: 'A+',
        mobile: '9546021480',
        emergencyContact: '9546021481',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1590649880765-91b1956b8276?w=150'
      },
      {
        residentId: 'PAT-RES-0022',
        name: 'Subhash Yadav',
        fatherName: 'Dharmanath Yadav',
        dob: new Date(`${nowYear - 38}-05-24`),
        gender: 'Male',
        address: 'House No. 105, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Dairy Manager',
        skills: ['Cold Chain Logistics', 'Cattle Feed Formulation', 'Biogas Operation'],
        education: 'Intermediate Science',
        bloodGroup: 'O+',
        mobile: '9546021482',
        emergencyContact: '9546021481',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150'
      },
      {
        residentId: 'PAT-RES-0023',
        name: 'Kiran Yadav',
        fatherName: 'Laxmi Prasad Yadav',
        dob: new Date(`${nowYear - 34}-07-30`),
        gender: 'Female',
        address: 'House No. 105, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Tailor',
        skills: ['Blouse Stitching', 'Sewing Machine Maintenance', 'Bangle Matching'],
        education: 'High School',
        bloodGroup: 'B+',
        mobile: '9546021483',
        emergencyContact: '9546021482',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=150'
      },
      {
        residentId: 'PAT-RES-0024',
        name: 'Amit Yadav',
        fatherName: 'Subhash Yadav',
        dob: new Date(`${nowYear - 12}-03-15`),
        gender: 'Male',
        address: 'House No. 105, Ward No. 04, Mohalla Purab Tola',
        mohalla: 'Purab Tola',
        ward: '04',
        occupation: 'Student',
        skills: ['Cricket batting', 'Cycle riding'],
        education: 'Middle School (Class 7)',
        bloodGroup: 'O+',
        mobile: '',
        emergencyContact: '9546021482',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },

      // === FAMILY 6: Choudhary Family (House 106, Ward 02, Mohalla Pipra Tola) ===
      {
        residentId: 'PAT-RES-0025',
        name: 'Ramashankar Choudhary',
        fatherName: 'Late Brijnandan Choudhary',
        dob: new Date(`${nowYear - 65}-08-20`),
        gender: 'Male',
        address: 'House No. 106, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Farmer',
        skills: ['Post Office Schemes Advisory', 'Panchayat Arbitration', 'Land Valuation'],
        education: 'BA History',
        bloodGroup: 'A+',
        mobile: '9876543210',
        emergencyContact: '9876543211',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1489980508314-941910ded1f4?w=150'
      },
      {
        residentId: 'PAT-RES-0026',
        name: 'Kaushalya Devi',
        fatherName: 'Jagannath Singh',
        dob: new Date(`${nowYear - 60}-05-18`),
        gender: 'Female',
        address: 'House No. 106, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Housewife',
        skills: ['Midwifery', 'Devotional Singing', 'Plant Nursery'],
        education: 'Primary School',
        bloodGroup: 'B+',
        mobile: '9876543212',
        emergencyContact: '9876543210',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150'
      },
      {
        residentId: 'PAT-RES-0027',
        name: 'Vikram Choudhary',
        fatherName: 'Ramashankar Choudhary',
        dob: new Date(`${nowYear - 40}-11-04`),
        gender: 'Male',
        address: 'House No. 106, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Driver',
        skills: ['Tractor Driving', 'Diesel Engine Repair', 'Well Digging'],
        education: 'Matriculation',
        bloodGroup: 'A+',
        mobile: '9876543211',
        emergencyContact: '9876543210',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'
      },
      {
        residentId: 'PAT-RES-0028',
        name: 'Sushma Choudhary',
        fatherName: 'Ramvilas Singh',
        dob: new Date(`${nowYear - 35}-03-16`),
        gender: 'Female',
        address: 'House No. 106, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Teacher',
        skills: ['Tailoring Training', 'Self Help Group Accounts', 'Bhojpuri Folklore'],
        education: 'MA Education',
        bloodGroup: 'O+',
        mobile: '9876543213',
        emergencyContact: '9876543211',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
      },
      {
        residentId: 'PAT-RES-0029',
        name: 'Ravi Choudhary',
        fatherName: 'Vikram Choudhary',
        dob: new Date(`${nowYear - 14}-06-12`),
        gender: 'Male',
        address: 'House No. 106, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Student',
        skills: ['Kabbadi', 'Science Projects', 'Smart Phone Basics'],
        education: 'High School (Class 9)',
        bloodGroup: 'A+',
        mobile: '',
        emergencyContact: '9876543211',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
      },
      {
        residentId: 'PAT-RES-0030',
        name: 'Riya Choudhary',
        fatherName: 'Vikram Choudhary',
        dob: new Date(`${nowYear - 10}-09-22`),
        gender: 'Female',
        address: 'House No. 106, Ward No. 02, Mohalla Pipra Tola',
        mohalla: 'Pipra Tola',
        ward: '02',
        occupation: 'Student',
        skills: ['Bhojpuri Dance', 'Story Telling', 'Skipping Rope'],
        education: 'Primary School (Class 5)',
        bloodGroup: 'O+',
        mobile: '',
        emergencyContact: '9876543211',
        verificationStatus: true,
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      }
    ];

    const seededResidents = [];
    for (const rData of rawResidents) {
      const houseMatch = rData.address.match(/House No\.\s*(\d+)/);
      const houseNo = houseMatch ? houseMatch[1] : '101';
      
      const aadhaarLast4 = rData.mobile && rData.mobile.length >= 4 
        ? rData.mobile.substring(rData.mobile.length - 4) 
        : rData.residentId.substring(rData.residentId.length - 4);
      
      const seq = rData.residentId.split('-')[2];
      const voterId = `EPIC${seq}IN`;
      const familyId = `FAM-${houseNo}`;

      const { photo, ...cleanData } = rData;

      const resident = await Resident.create({
        ...cleanData,
        photo: '',
        houseNo,
        aadhaarLast4,
        voterId,
        familyId,
        villageId: village._id
      });
      seededResidents.push(resident);
    }

    console.log(`Inserted ${seededResidents.length} residents successfully. Linking family relations...`);

    // Helper mapping indices
    // 0: Ramakant, 1: Kanti, 2: Ramesh, 3: Neha, 4: Aarav
    // 5: Vaidyanath, 6: Shanti, 7: Sunita, 8: Manish, 9: Pooja
    // 10: Basawan, 11: Radhika, 12: Pappu, 13: Gita, 14: Chintu
    // 15: Rajesh, 16: Meena, 17: Suresh, 18: Rani
    // 19: Dharmanath, 20: Lilawati, 21: Subhash, 22: Kiran, 23: Amit
    // 24: Ramashankar, 25: Kaushalya, 26: Vikram, 27: Sushma, 28: Ravi, 29: Riya

    const link = async (resA, resB, relTypeA, relTypeB) => {
      resA.relations.push({ relativeId: resB._id, relationType: relTypeA });
      resB.relations.push({ relativeId: resA._id, relationType: relTypeB });
      await resA.save();
      await resB.save();
    };

    // --- FAMILY 1 LINKS ---
    // Ramakant & Kanti (Spouses)
    await link(seededResidents[0], seededResidents[1], 'Spouse', 'Spouse');
    // Ramakant & Ramesh (Father - Child)
    await link(seededResidents[0], seededResidents[2], 'Child', 'Father');
    // Kanti & Ramesh (Mother - Child)
    await link(seededResidents[1], seededResidents[2], 'Child', 'Mother');
    // Ramesh & Neha (Spouses)
    await link(seededResidents[2], seededResidents[3], 'Spouse', 'Spouse');
    // Ramesh & Aarav (Father - Child)
    await link(seededResidents[2], seededResidents[4], 'Child', 'Father');
    // Neha & Aarav (Mother - Child)
    await link(seededResidents[3], seededResidents[4], 'Child', 'Mother');

    // --- FAMILY 2 LINKS ---
    // Vaidyanath & Shanti (Spouses)
    await link(seededResidents[5], seededResidents[6], 'Spouse', 'Spouse');
    // Vaidyanath & Sunita (Siblings)
    await link(seededResidents[5], seededResidents[7], 'Sibling', 'Sibling');
    // Vaidyanath & Manish (Father - Child)
    await link(seededResidents[5], seededResidents[8], 'Child', 'Father');
    // Shanti & Manish (Mother - Child)
    await link(seededResidents[6], seededResidents[8], 'Child', 'Mother');
    // Vaidyanath & Pooja (Father - Child)
    await link(seededResidents[5], seededResidents[9], 'Child', 'Father');
    // Shanti & Pooja (Mother - Child)
    await link(seededResidents[6], seededResidents[9], 'Child', 'Mother');
    // Manish & Pooja (Siblings)
    await link(seededResidents[8], seededResidents[9], 'Sibling', 'Sibling');

    // --- FAMILY 3 LINKS ---
    // Basawan & Radhika (Spouses)
    await link(seededResidents[10], seededResidents[11], 'Spouse', 'Spouse');
    // Basawan & Pappu (Father - Child)
    await link(seededResidents[10], seededResidents[12], 'Child', 'Father');
    // Radhika & Pappu (Mother - Child)
    await link(seededResidents[11], seededResidents[12], 'Child', 'Mother');
    // Pappu & Gita (Spouses)
    await link(seededResidents[12], seededResidents[13], 'Spouse', 'Spouse');
    // Pappu & Chintu (Father - Child)
    await link(seededResidents[12], seededResidents[14], 'Child', 'Father');
    // Gita & Chintu (Mother - Child)
    await link(seededResidents[13], seededResidents[14], 'Child', 'Mother');

    // --- FAMILY 4 LINKS ---
    // Rajesh & Meena (Spouses)
    await link(seededResidents[15], seededResidents[16], 'Spouse', 'Spouse');
    // Rajesh & Suresh (Father - Child)
    await link(seededResidents[15], seededResidents[17], 'Child', 'Father');
    // Meena & Suresh (Mother - Child)
    await link(seededResidents[16], seededResidents[17], 'Child', 'Mother');
    // Rajesh & Rani (Father - Child)
    await link(seededResidents[15], seededResidents[18], 'Child', 'Father');
    // Meena & Rani (Mother - Child)
    await link(seededResidents[16], seededResidents[18], 'Child', 'Mother');
    // Suresh & Rani (Siblings)
    await link(seededResidents[17], seededResidents[18], 'Sibling', 'Sibling');

    // --- FAMILY 5 LINKS ---
    // Dharmanath & Lilawati (Spouses)
    await link(seededResidents[19], seededResidents[20], 'Spouse', 'Spouse');
    // Dharmanath & Subhash (Father - Child)
    await link(seededResidents[19], seededResidents[21], 'Child', 'Father');
    // Lilawati & Subhash (Mother - Child)
    await link(seededResidents[20], seededResidents[21], 'Child', 'Mother');
    // Subhash & Kiran (Spouses)
    await link(seededResidents[21], seededResidents[22], 'Spouse', 'Spouse');
    // Subhash & Amit (Father - Child)
    await link(seededResidents[21], seededResidents[23], 'Child', 'Father');
    // Kiran & Amit (Mother - Child)
    await link(seededResidents[22], seededResidents[23], 'Child', 'Mother');

    // --- FAMILY 6 LINKS ---
    // Ramashankar & Kaushalya (Spouses)
    await link(seededResidents[24], seededResidents[25], 'Spouse', 'Spouse');
    // Ramashankar & Vikram (Father - Child)
    await link(seededResidents[24], seededResidents[26], 'Child', 'Father');
    // Kaushalya & Vikram (Mother - Child)
    await link(seededResidents[25], seededResidents[26], 'Child', 'Mother');
    // Vikram & Sushma (Spouses)
    await link(seededResidents[26], seededResidents[27], 'Spouse', 'Spouse');
    // Vikram & Ravi (Father - Child)
    await link(seededResidents[26], seededResidents[28], 'Child', 'Father');
    // Sushma & Ravi (Mother - Child)
    await link(seededResidents[27], seededResidents[28], 'Child', 'Mother');
    // Vikram & Riya (Father - Child)
    await link(seededResidents[26], seededResidents[29], 'Child', 'Father');
    // Sushma & Riya (Mother - Child)
    await link(seededResidents[27], seededResidents[29], 'Child', 'Mother');
    // Ravi & Riya (Siblings)
    await link(seededResidents[28], seededResidents[29], 'Sibling', 'Sibling');

    console.log('All family relations linked successfully.');

    // 5. Seed Associated User Credentials for testing
    // We recreate user logins for the key residents
    // Super Admin (Independent)
    await User.create({
      email: 'admin@pateri.in',
      password: 'admin123',
      roles: ['Super Admin']
    });

    // Mukhiya (Ramakant)
    await User.create({
      email: 'panchayat@pateri.in',
      password: 'panchayat123',
      roles: ['Panchayat Admin'],
      residentProfile: seededResidents[0]._id
    });

    // Doctor (Ramesh)
    await User.create({
      email: 'ramesh@pateri.in',
      password: 'ramesh123',
      roles: ['Resident'],
      residentProfile: seededResidents[2]._id
    });

    // Student (Manish)
    await User.create({
      email: 'manish@pateri.in',
      password: 'manish123',
      roles: ['Resident', 'Volunteer'],
      residentProfile: seededResidents[8]._id
    });

    // Electrician (Pappu)
    await User.create({
      email: 'pappu@pateri.in',
      password: 'pappu123',
      roles: ['Resident', 'Volunteer'],
      residentProfile: seededResidents[12]._id
    });

    // Shop Owner (Shanti)
    await User.create({
      email: 'shanti@pateri.in',
      password: 'shanti123',
      roles: ['Resident'],
      residentProfile: seededResidents[6]._id
    });

    console.log('Associated user credentials seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seed family roster failed:', error);
    process.exit(1);
  }
};

seedFamilyRoster();
