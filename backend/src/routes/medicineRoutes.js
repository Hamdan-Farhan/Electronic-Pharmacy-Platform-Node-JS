const express = require('express');
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  medicinePhotoUpload,
} = require('../controllers/medicineController');
const upload = require('../middlewares/upload');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Medicine:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - price
 *         - stock
 *         - category
 *         - manufacturer
 *         - expiryDate
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: number
 *         category:
 *           type: string
 *         manufacturer:
 *           type: string
 *         expiryDate:
 *           type: string
 *           format: date
 *         requiresPrescription:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * /api/v1/medicines:
 *   get:
 *     summary: Get all medicines
 *     tags: [Medicines]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of medicines
 *   post:
 *     summary: Create a new medicine (Admin only)
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Medicine'
 *     responses:
 *       201:
 *         description: Medicine created
 *       403:
 *         description: Not authorized
 */

const { protect, authorize } = require('../middlewares/auth');

router
  .route('/')
  .get(getMedicines)
  .post(protect, authorize('admin'), createMedicine);

router
  .route('/:id')
  .get(getMedicine)
  .put(protect, authorize('admin'), updateMedicine)
  .delete(protect, authorize('admin'), deleteMedicine);

router
  .route('/:id/photo')
  .put(protect, authorize('admin'), upload.single('image'), medicinePhotoUpload);

module.exports = router;
