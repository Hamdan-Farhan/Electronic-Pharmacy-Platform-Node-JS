const express = require('express');
const {
  uploadPrescription,
  getPrescriptions,
  reviewPrescription,
} = require('../controllers/prescriptionController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Prescription:
 *       type: object
 *       required:
 *         - imageUrl
 *       properties:
 *         user:
 *           type: string
 *           description: User ID who uploaded the prescription
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL of the uploaded prescription image
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           default: pending
 *         reviewedBy:
 *           type: string
 *           description: User ID of the admin who reviewed the prescription
 *         reviewNotes:
 *           type: string
 *           description: Notes from the admin review
 */

/**
 * @swagger
 * /api/v1/prescriptions:
 *   get:
 *     summary: Get all prescriptions (Admin) or user's prescriptions (User)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 *   post:
 *     summary: Upload a new prescription image
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               prescription:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Prescription uploaded successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/v1/prescriptions/{id}/review:
 *   put:
 *     summary: Review a prescription (Admin only)
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Prescription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               reviewNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prescription reviewed successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Prescription not found
 */

const { protect, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router
  .route('/')
  .get(protect, getPrescriptions)
  .post(protect, upload.single('prescription'), uploadPrescription);

router
  .route('/:id/review')
  .put(protect, authorize('admin', 'doctor'), reviewPrescription);

module.exports = router;
