const express = require('express');
const {
  createOrder,
  getOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - items
 *         - shippingAddress
 *         - paymentMethod
 *       properties:
 *         user:
 *           type: string
 *           description: User ID who placed the order
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               medicine:
 *                 type: string
 *                 description: Medicine ID
 *               quantity:
 *                 type: number
 *               price:
 *                 type: number
 *         totalPrice:
 *           type: number
 *         prescription:
 *           type: string
 *           description: Prescription ID (if required)
 *         status:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *           default: pending
 *         paymentMethod:
 *           type: string
 *           enum: [cash, stripe]
 *           default: cash
 *         shippingAddress:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     summary: Get all orders (Admin) or user's orders (User)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of orders
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicine:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, stripe]
 *               prescriptionId:
 *                 type: string
 *                 description: Optional, required if any medicine needs a prescription
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */

const { protect, authorize } = require('../middlewares/auth');

router
  .route('/')
  .get(protect, getOrders)
  .post(protect, createOrder);

router
  .route('/:id/status')
  .put(protect, authorize('admin', 'doctor'), updateOrderStatus);

module.exports = router;
