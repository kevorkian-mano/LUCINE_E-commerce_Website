import express from "express";
import orderController from "../controllers/orderController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// User routes (require authentication)
router.post("/", authenticate, orderController.createOrder);
router.get("/my-orders", authenticate, orderController.getUserOrders);
router.get("/:id", authenticate, orderController.getOrderById);
router.put("/:id/payment", authenticate, orderController.updateOrderPayment);

// Admin routes
router.get("/", authenticate, authorize("admin"), orderController.getAllOrders);
router.get("/analytics/sales", authenticate, authorize("admin"), orderController.getSalesAnalytics);
router.get("/analytics/category", authenticate, authorize("admin"), orderController.getSalesByCategory);

export default router;

