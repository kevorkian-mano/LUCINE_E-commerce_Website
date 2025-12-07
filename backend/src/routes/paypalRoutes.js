import express from 'express';
import paypalController from '../controllers/paypalController.js';
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// All PayPal routes require authentication
router.post('/create-order', authenticate, paypalController.createOrder);
router.post('/capture-order', authenticate, paypalController.captureOrder);
router.get('/order/:paypalOrderId', authenticate, paypalController.getOrderStatus);

export default router;

