const Document = require('../models/Document');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to check visibility permissions
const hasDocumentAccess = (user, documentVisibility) => {
  if (documentVisibility === 'Public') return true;
  if (!user) return false;

  const roles = user.roles || [];
  if (roles.includes('Super Admin') || roles.includes('Panchayat Admin')) {
    return true;
  }
  if (documentVisibility === 'Residents Only' && roles.includes('Resident')) {
    return true;
  }
  return false;
};

// @desc    Get document directories and list
// @route   GET /api/v1/documents
// @access  Optional Private (Checks roles for visibility limits)
exports.getDocuments = async (req, res, next) => {
  try {
    let queryObj = {};

    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    const documents = await Document.find(queryObj).sort('-createdAt');

    // Filter documents based on user roles
    const accessibleDocuments = documents.filter(doc => 
      hasDocumentAccess(req.user, doc.visibility)
    );

    res.status(200).json({
      success: true,
      data: accessibleDocuments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload document
// @route   POST /api/v1/documents
// @access  Private (Panchayat Admin / Super Admin)
exports.uploadDocument = async (req, res, next) => {
  try {
    const { villageId, title, category, fileUrl, visibility, expiresAt } = req.body;

    if (!villageId || !title || !category || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide villageId, title, category, and fileUrl',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const document = await Document.create({
      villageId,
      title,
      category,
      fileUrl,
      visibility: visibility || 'Public',
      expiresAt,
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: document
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Track download and redirect to file URL
// @route   GET /api/v1/documents/:id/download
// @access  Public / Query Token
exports.downloadDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Resolve user from query param token or Authorization header
    let user = null;
    let token = req.query.token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pateri_smart_village_secret_key_2026_xyz');
        user = await User.findById(decoded.id);
      } catch (err) {
        // Log token error, but keep user as null
        console.warn('Invalid token provided for document download');
      }
    }

    // Check visibility permissions
    if (!hasDocumentAccess(user, document.visibility)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view or download this document',
        errorCode: 'FORBIDDEN_OPERATION'
      });
    }

    // Increment download count
    document.downloadCount += 1;
    await document.save();

    // Redirect to actual file location
    res.redirect(document.fileUrl);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/v1/documents/:id
// @access  Private (Panchayat Admin / Super Admin)
exports.deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully from vault'
    });
  } catch (error) {
    next(error);
  }
};
