import cartService from "../services/cartService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class CartController {
  // Get user's cart
  getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const cart = await cartService.getCart(userId);
    res.json({
      success: true,
      data: cart
    });
  });

  // Add item to cart
  addItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const cart = await cartService.addItem(userId, productId, quantity || 1);
    res.status(201).json({
      success: true,
      message: "Item added to cart",
      data: cart
    });
  });

  // Update item quantity
  updateItemQuantity = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const cart = await cartService.updateItemQuantity(userId, productId, quantity);
    res.json({
      success: true,
      message: "Cart updated",
      data: cart
    });
  });

  // Remove item from cart
  removeItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const cart = await cartService.removeItem(userId, productId);
    res.json({
      success: true,
      message: "Item removed from cart",
      data: cart
    });
  });

  // Clear cart
  clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id ? req.user._id.toString() : req.user.id;
    const cart = await cartService.clearCart(userId);
    res.json({
      success: true,
      message: "Cart cleared",
      data: cart
    });
  });
}

export default new CartController();

