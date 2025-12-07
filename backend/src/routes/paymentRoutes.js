import express from "express";
import paymentController from "../controllers/paymentController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All payment routes require authentication
router.post("/create-intent", authenticate, paymentController.createPaymentIntent);
router.post("/confirm", authenticate, paymentController.confirmPayment);
router.get("/status/:paymentIntentId", authenticate, paymentController.getPaymentStatus);
router.post("/cancel", authenticate, paymentController.cancelPayment);

// Webhook route - no authentication (uses Stripe signature verification)
// Note: Express must be configured to parse raw body for webhook signature verification
router.post("/webhook", paymentController.handleWebhook);

export default router;

