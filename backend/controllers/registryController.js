const RegistryRecord = require('../models/RegistryRecord');
const Resident = require('../models/Resident');

// @desc    Submit birth or death registry application
// @route   POST /api/v1/registry
// @access  Private
exports.createRegistryRecord = async (req, res, next) => {
  try {
    const { type, name, dateOfEvent, gender, fatherName, motherName, spouseName } = req.body;

    if (!type || !name || !dateOfEvent || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide type, name, dateOfEvent, and gender',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const villageId = req.body.villageId || '6664d999f999f999f999f999';

    const record = await RegistryRecord.create({
      villageId,
      type,
      name,
      dateOfEvent,
      gender,
      fatherName,
      motherName,
      spouseName,
      reportedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get birth & death registry records list
// @route   GET /api/v1/registry
// @access  Private
exports.getRegistryRecords = async (req, res, next) => {
  try {
    const isAdmin = req.user.roles.some(r => ['Super Admin', 'Panchayat Admin'].includes(r));
    
    // Admins see all, residents see only their reported records
    const query = isAdmin ? {} : { reportedBy: req.user._id };

    const records = await RegistryRecord.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve/Reject birth or death registration (Admin only)
// @route   PATCH /api/v1/registry/:id/status
// @access  Private (Admin)
exports.updateRegistryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Approved or Rejected'
      });
    }

    const record = await RegistryRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Registry record not found'
      });
    }

    record.status = status;

    if (status === 'Approved') {
      const year = new Date(record.dateOfEvent).getFullYear();
      const count = await RegistryRecord.countDocuments({ type: record.type, status: 'Approved' });
      const serial = String(count + 1).padStart(4, '0');
      record.registrationNumber = `REG/${record.type.toUpperCase()}/${year}/${serial}`;

      // If approved, we can also choose to add them to the Resident registry!
      // For Birth, let's create a new resident profile dynamically!
      if (record.type === 'Birth') {
        const countRes = await Resident.countDocuments();
        const nextId = `PAT-${String(countRes + 1).padStart(6, '0')}`;
        
        await Resident.create({
          villageId: record.villageId,
          residentId: nextId,
          name: record.name,
          dob: record.dateOfEvent,
          gender: record.gender,
          fatherName: record.fatherName || 'Unknown',
          address: 'Pateri Village',
          ward: '01',
          houseNo: 'Pending',
          occupation: 'None',
          education: 'Illiterate',
          verificationStatus: 'verified'
        });
      }
      
      // For Death, let's mark the resident's verificationStatus as deceased! (No hard/soft delete)
      if (record.type === 'Death') {
        const resident = await Resident.findOne({ name: record.name, isDeleted: false });
        if (resident) {
          resident.verificationStatus = 'deceased';
          await resident.save();
        }
      }
    }

    await record.save();

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};
