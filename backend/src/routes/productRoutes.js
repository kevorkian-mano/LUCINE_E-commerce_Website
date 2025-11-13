import express from "express";
import productController from "../controllers/productController.js";
import { authenticate, authorize } from "../middlewares/auth.js";

const router = express.Router();

// Public routes
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/categories", productController.getCategories);
router.get("/category/:category", productController.getByCategory);
router.get("/:id", productController.getProductById);

// Admin routes
router.post("/", authenticate, authorize("admin"), productController.createProduct);
router.put("/:id", authenticate, authorize("admin"), productController.updateProduct);
router.delete("/:id", authenticate, authorize("admin"), productController.deleteProduct);

export default router;

