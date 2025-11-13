import productService from "../services/productService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class ProductController {
  // Get all products with optional filters
  getAllProducts = asyncHandler(async (req, res) => {
    const { category, minPrice, maxPrice } = req.query;
    const filters = {};
    
    if (category) filters.category = category;
    
    // Build price filter correctly
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }

    const products = await productService.getAll(filters);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  });

  // Search products
  searchProducts = asyncHandler(async (req, res) => {
    const { q, category, minPrice, maxPrice } = req.query;
    const products = await productService.search(q, category, minPrice ? parseFloat(minPrice) : undefined, maxPrice ? parseFloat(maxPrice) : undefined);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  });

  // Get products by category
  getByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const products = await productService.getByCategory(category);
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  });

  // Get all categories
  getCategories = asyncHandler(async (req, res) => {
    const categories = await productService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  });

  // Get product by ID
  getProductById = asyncHandler(async (req, res) => {
    const product = await productService.getById(req.params.id);
    res.json({
      success: true,
      data: product
    });
  });

  // Create product (admin only)
  createProduct = asyncHandler(async (req, res) => {
    const product = await productService.create(req.body);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product
    });
  });

  // Update product (admin only)
  updateProduct = asyncHandler(async (req, res) => {
    const product = await productService.update(req.params.id, req.body);
    res.json({
      success: true,
      message: "Product updated successfully",
      data: product
    });
  });

  // Delete product (admin only)
  deleteProduct = asyncHandler(async (req, res) => {
    await productService.delete(req.params.id);
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  });
}

export default new ProductController();
