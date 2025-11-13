import productRepository from "../repositories/productRepository.js";
import { validateProductData } from "../utils/validators.js";

class ProductService {
  // Declarative: Get all products with optional filtering
  async getAll(filters = {}) {
    return await productRepository.findAll(filters);
  }

  // Declarative: Search products
  async search(searchTerm, category, minPrice, maxPrice) {
    return await productRepository.search(searchTerm, category, minPrice, maxPrice);
  }

  // Declarative: Get products by category
  async getByCategory(category) {
    return await productRepository.findByCategory(category);
  }

  // Declarative: Get all categories
  async getCategories() {
    return await productRepository.getCategories();
  }

  // Imperative: Get product by ID with validation
  async getById(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    if (!product.isActive) {
      throw new Error("Product is not available");
    }
    return product;
  }

  // Imperative: Create product with validation
  async create(productData) {
    const errors = validateProductData(productData);
    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
    return await productRepository.create(productData);
  }

  // Imperative: Update product
  async update(id, updateData) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    if (updateData.price !== undefined && updateData.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    return await productRepository.update(id, updateData);
  }

  // Imperative: Delete product
  async delete(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    return await productRepository.delete(id);
  }

  // Imperative: Update stock (for order processing)
  async updateStock(id, quantity) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }
    return await productRepository.updateStock(id, quantity);
  }
}

export default new ProductService();
