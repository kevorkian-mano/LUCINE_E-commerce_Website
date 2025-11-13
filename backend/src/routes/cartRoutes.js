import express from "express";
import cartController from "../controllers/cartController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// All cart routes require authentication
router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/items", cartController.addItem);
router.put("/items/:productId", cartController.updateItemQuantity);
router.delete("/items/:productId", cartController.removeItem);
router.delete("/", cartController.clearCart);

export default router;

