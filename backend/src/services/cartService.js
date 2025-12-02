import cartRepository from "../repositories/cartRepository.js";
import productService from "./productService.js";

class CartService {
  constructor(cartRepositoryParam = null, productServiceParam = null) {
    // Accept dependencies (Dependency Injection)
    // If not provided, use default singletons for backward compatibility
    this.cartRepository = cartRepositoryParam || cartRepository;
    this.productService = productServiceParam || productService;
  }

  // Imperative: Get user's cart
  async getCart(userId) {
    let cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      cart = await this.cartRepository.create(userId);
    }
    return cart;
  }

  // Imperative: Add item to cart with validation and concurrency handling
  async addItem(userId, productId, quantity = 1) {
    // Verify product exists and is available
    const product = await this.productService.getById(productId);
    
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    // Check if item already exists in cart
    const cart = await this.getCart(userId);
    const existingItem = cart.items.find(
      item => item.product._id.toString() === productId.toString()
    );

    if (existingItem) {
      // Update quantity (atomic operation for concurrency - NFR5)
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new Error("Insufficient stock");
      }
      return await this.cartRepository.updateItemQuantity(userId, productId, newQuantity);
    }

    // Add new item (atomic operation - NFR5)
    return await this.cartRepository.addItem(userId, productId, quantity);
  }

  // Imperative: Update item quantity
  async updateItemQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    const product = await this.productService.getById(productId);
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    return await this.cartRepository.updateItemQuantity(userId, productId, quantity);
  }

  // Imperative: Remove item from cart
  async removeItem(userId, productId) {
    return await this.cartRepository.removeItem(userId, productId);
  }

  // Imperative: Clear cart
  async clearCart(userId) {
    return await this.cartRepository.clearCart(userId);
  }
}

// Export both: singleton for backward compatibility and class for factory
export default new CartService();
export { CartService };

