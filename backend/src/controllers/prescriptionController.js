const Prescription = require('../models/Prescription');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Upload prescription
// @route   POST /api/v1/prescriptions
// @access  Private
exports.uploadPrescription = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ErrorResponse('Please upload a file', 400));
  }

  const prescription = await Prescription.create({
    user: req.user.id,
    imageUrl: req.file.path,
  });

  res.status(201).json({
    success: true,
    data: prescription,
  });
});

// @desc    Get all prescriptions (Admin) or user's prescriptions
// @route   GET /api/v1/prescriptions
// @access  Private
exports.getPrescriptions = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'admin' || req.user.role === 'doctor') {
    query = Prescription.find().populate('user', 'name email');
  } else {
    query = Prescription.find({ user: req.user.id });
  }

  const prescriptions = await query;

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions,
  });
});

// @desc    Review prescription
// @route   PUT /api/v1/prescriptions/:id/review
// @access  Private/Admin
exports.reviewPrescription = asyncHandler(async (req, res, next) => {
  const { status, reviewNotes } = req.body;

  let prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(
      new ErrorResponse(`Prescription not found with id of ${req.params.id}`, 404)
    );
  }

  prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    {
      status,
      reviewNotes,
      reviewedBy: req.user.id,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: prescription,
  });
});
