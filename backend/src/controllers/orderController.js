const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Prescription = require('../models/Prescription');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  const { items, shippingAddress, paymentMethod, prescriptionId } = req.body;

  if (!items || items.length === 0) {
    return next(new ErrorResponse('No order items', 400));
  }

  let totalPrice = 0;
  const orderItems = [];
  let needsPrescription = false;

  // Check medicines and calculate price
  for (const item of items) {
    const medicine = await Medicine.findById(item.medicine);

    if (!medicine) {
      return next(
        new ErrorResponse(`Medicine not found with id of ${item.medicine}`, 404)
      );
    }

    if (medicine.stock < item.quantity) {
      return next(
        new ErrorResponse(`Insufficient stock for ${medicine.name}`, 400)
      );
    }

    if (medicine.requiresPrescription) {
      needsPrescription = true;
    }

    const itemPrice = medicine.price * item.quantity;
    totalPrice += itemPrice;

    orderItems.push({
      medicine: medicine._id,
      quantity: item.quantity,
      price: medicine.price,
    });

    // Update stock
    medicine.stock -= item.quantity;
    await medicine.save();
  }

  // Check prescription if needed
  if (needsPrescription) {
    if (!prescriptionId) {
      return next(
        new ErrorResponse('Order contains prescription-only drugs. Please provide a prescription ID.', 400)
      );
    }

    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription || prescription.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Invalid prescription', 400));
    }

    if (prescription.status !== 'approved') {
      return next(
        new ErrorResponse('Prescription must be approved before ordering', 400)
      );
    }
  }

  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    totalPrice,
    shippingAddress,
    paymentMethod,
    prescription: needsPrescription ? prescriptionId : undefined,
  });

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc    Get all orders (Admin) or user's orders
// @route   GET /api/v1/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  let query;

  if (req.user.role === 'admin' || req.user.role === 'doctor') {
    query = Order.find().populate('user', 'name email').populate('items.medicine', 'name');
  } else {
    query = Order.find({ user: req.user.id }).populate('items.medicine', 'name');
  }

  const orders = await query;

  res.status(200).json({
    success: true,
    count: orders.length,
    data: orders,
  });
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});
