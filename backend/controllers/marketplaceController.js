const BusinessCategory = require('../models/BusinessCategory');
const Business = require('../models/Business');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

// Helper function to update business rating cache
const updateBusinessRatingCache = async (businessId) => {
  const reviews = await Review.find({ businessId });
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0;

  await Business.findByIdAndUpdate(businessId, {
    averageRating,
    totalReviews
  });
};

// @desc    Get active business categories
// @route   GET /api/v1/marketplace/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await BusinessCategory.find().sort('name');
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get paginated/filtered business directory
// @route   GET /api/v1/marketplace/businesses
// @access  Public
exports.getBusinesses = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    let queryObj = {};

    // Filter by villageId
    if (req.query.villageId) {
      queryObj.villageId = req.query.villageId;
    }

    // Filter by category
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // Filter by verificationStatus (Verified by default, unless requested otherwise and user is Admin)
    const verifiedOnly = req.query.verifiedOnly !== 'false';
    if (verifiedOnly) {
      queryObj.verificationStatus = 'Verified';
    } else if (req.query.verificationStatus) {
      // Admin filter
      queryObj.verificationStatus = req.query.verificationStatus;
    }

    // Search by business name (regex)
    if (req.query.search) {
      queryObj.businessName = { $regex: req.query.search, $options: 'i' };
    }

    // Determine sorting
    let sortBy = '-createdAt';
    if (req.query.sort === 'rating') {
      sortBy = '-averageRating';
    } else if (req.query.sort === 'name') {
      sortBy = 'businessName';
    }

    const total = await Business.countDocuments(queryObj);
    const businesses = await Business.find(queryObj)
      .sort(sortBy)
      .skip(skip)
      .limit(limit)
      .populate('ownerId', 'email');

    res.status(200).json({
      success: true,
      data: {
        records: businesses,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new business profile
// @route   POST /api/v1/marketplace/businesses
// @access  Private
exports.createBusiness = async (req, res, next) => {
  try {
    const { villageId, businessName, category, contactMobile, address, logo, latitude, longitude } = req.body;

    if (!villageId || !businessName || !category || !contactMobile) {
      return res.status(400).json({
        success: false,
        message: 'Please provide villageId, businessName, category, and contactMobile',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    // Check if category exists
    const categoryExists = await BusinessCategory.findOne({ name: category });
    if (!categoryExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business category',
        errorCode: 'INVALID_CATEGORY'
      });
    }

    const business = await Business.create({
      villageId,
      ownerId: req.user._id,
      businessName,
      category,
      contactMobile,
      address,
      logo,
      latitude,
      longitude,
      verificationStatus: 'Pending' // Defaults to pending, requires admin approval
    });

    // Notify Panchayat Admin
    await Notification.create({
      isGlobal: false,
      title: 'New Business Verification Pending',
      message: `Shop "${businessName}" has been registered by ${req.user.email} and awaits verification approval.`,
      type: 'Notice',
      link: '/admin' // Links to verification portal
    });

    res.status(201).json({
      success: true,
      data: business
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Post review for a business
// @route   POST /api/v1/marketplace/businesses/:id/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const businessId = req.params.id;

    if (!rating) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating (1 to 5)',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Owner cannot review their own business
    if (business.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot review your own business',
        errorCode: 'FORBIDDEN_OPERATION'
      });
    }

    // Check if user already reviewed this business
    const existingReview = await Review.findOne({ businessId, userId: req.user._id });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this business. Update your existing review instead.',
        errorCode: 'DUPLICATE_RESOURCE'
      });
    }

    const review = await Review.create({
      businessId,
      userId: req.user._id,
      rating,
      comment
    });

    // Recalculate business averageRating and totalReviews
    await updateBusinessRatingCache(businessId);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    // Catch unique constraint violations
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this business.',
        errorCode: 'DUPLICATE_RESOURCE'
      });
    }
    next(error);
  }
};

// @desc    Get reviews for a business
// @route   GET /api/v1/marketplace/businesses/:id/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ businessId: req.params.id })
      .sort('-createdAt')
      .populate('userId', 'email');

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a review
// @route   PUT /api/v1/marketplace/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Check ownership
    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
        errorCode: 'FORBIDDEN_OPERATION'
      });
    }

    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5',
          errorCode: 'VALIDATION_FAILED'
        });
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    // Recalculate cache
    await updateBusinessRatingCache(review.businessId);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a review
// @route   DELETE /api/v1/marketplace/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    // Check ownership or admin role
    const isAdmin = req.user.roles.includes('Super Admin') || req.user.roles.includes('Panchayat Admin');
    if (review.userId.toString() !== req.user._id.toString() && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
        errorCode: 'FORBIDDEN_OPERATION'
      });
    }

    const businessId = review.businessId;
    await review.deleteOne();

    // Recalculate cache
    await updateBusinessRatingCache(businessId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify/Reject a business (Panchayat Admin approval)
// @route   PATCH /api/v1/marketplace/businesses/:id/verify
// @access  Private (Panchayat Admin / Super Admin)
exports.verifyBusiness = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Verified' or 'Rejected'
    if (!['Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be Verified or Rejected',
        errorCode: 'VALIDATION_FAILED'
      });
    }

    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
        errorCode: 'RESOURCE_NOT_FOUND'
      });
    }

    business.verificationStatus = status;
    await business.save();

    res.status(200).json({
      success: true,
      data: business
    });
  } catch (error) {
    next(error);
  }
};
