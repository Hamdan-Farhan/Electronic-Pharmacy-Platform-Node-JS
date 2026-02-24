const Medicine = require('../models/Medicine');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all medicines
// @route   GET /api/v1/medicines
// @access  Public
exports.getMedicines = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  // Finding resource
  query = Medicine.find(JSON.parse(queryStr));

  // Search by name or description
  if (req.query.search) {
    query = query.find({ $text: { $search: req.query.search } });
  }

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Medicine.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const medicines = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: medicines.length,
    pagination,
    data: medicines,
  });
});

// @desc    Get single medicine
// @route   GET /api/v1/medicines/:id
// @access  Public
exports.getMedicine = asyncHandler(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(
      new ErrorResponse(`Medicine not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: medicine,
  });
});

// @desc    Create new medicine
// @route   POST /api/v1/medicines
// @access  Private/Admin
exports.createMedicine = asyncHandler(async (req, res, next) => {
  const medicine = await Medicine.create(req.body);

  res.status(201).json({
    success: true,
    data: medicine,
  });
});

// @desc    Update medicine
// @route   PUT /api/v1/medicines/:id
// @access  Private/Admin
exports.updateMedicine = asyncHandler(async (req, res, next) => {
  let medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(
      new ErrorResponse(`Medicine not found with id of ${req.params.id}`, 404)
    );
  }

  medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: medicine,
  });
});

// @desc    Delete medicine
// @route   DELETE /api/v1/medicines/:id
// @access  Private/Admin
exports.deleteMedicine = asyncHandler(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(
      new ErrorResponse(`Medicine not found with id of ${req.params.id}`, 404)
    );
  }

  await medicine.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Upload photo for medicine
// @route   PUT /api/v1/medicines/:id/photo
// @access  Private/Admin
exports.medicinePhotoUpload = asyncHandler(async (req, res, next) => {
  const medicine = await Medicine.findById(req.params.id);

  if (!medicine) {
    return next(
      new ErrorResponse(`Medicine not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.file) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  await Medicine.findByIdAndUpdate(req.params.id, {
    image: req.file.filename,
  });

  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});
