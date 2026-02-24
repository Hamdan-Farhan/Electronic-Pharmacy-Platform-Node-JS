const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a medicine name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  manufacturer: {
    type: String,
    required: [true, 'Please add a manufacturer'],
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please add an expiry date'],
  },
  requiresPrescription: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default: 'no-photo.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for search
MedicineSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Medicine', MedicineSchema);
