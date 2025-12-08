import cartRepository from "../repositories/cartRepository.js";
import productService from "./productService.js";
import { AppError } from "../utils/AppError.js";

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
    
    // Check current cart to validate total quantity (don't create if doesn't exist yet)
    const cart = await this.cartRepository.findByUserId(userId);
    const existingItem = cart?.items?.find(
      item => item.product?._id?.toString() === productId.toString()
    );

    // Calculate new total quantity
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    const newQuantity = currentQuantity + quantity;
    
    if (product.stock < newQuantity) {
      throw new AppError("Insufficient stock", 400);
    }

    // Use repository's atomic operation (handles both add and increment, creates cart if needed)
    return await this.cartRepository.addItem(userId, productId, quantity);
  }

  // Imperative: Update item quantity
  async updateItemQuantity(userId, productId, quantity) {
    if (quantity <= 0) {
      throw new AppError("Quantity must be greater than 0", 400);
    }

    const product = await this.productService.getById(productId);
    if (product.stock < quantity) {
      throw new AppError("Insufficient stock", 400);
    }

    const cart = await this.cartRepository.updateItemQuantity(userId, productId, quantity);
    if (!cart) {
      throw new AppError("Item not found in cart", 404);
    }
    return cart;
  }

  // Imperative: Remove item from cart
  async removeItem(userId, productId) {
    // First check if cart exists and has the item
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }
    const itemExists = cart.items.some(
      item => item.product?._id?.toString() === productId.toString()
    );
    if (!itemExists) {
      throw new AppError("Item not found in cart", 404);
    }
    const updatedCart = await this.cartRepository.removeItem(userId, productId);
    if (!updatedCart) {
      throw new AppError("Item not found in cart", 404);
    }
    return updatedCart;
  }

  // Imperative: Clear cart
  async clearCart(userId) {
    return await this.cartRepository.clearCart(userId);
  }
}

// Export both: singleton for backward compatibility and class for factory
export default new CartService();
export { CartService };


