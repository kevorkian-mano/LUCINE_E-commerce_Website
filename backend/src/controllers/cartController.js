import cartService from "../services/cartService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

class CartController {
  // Get user's cart
  getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.json({
      success: true,
      data: cart
    });
  });

  // Add item to cart
  addItem = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.id, productId, quantity || 1);
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
    const cart = await cartService.updateItemQuantity(req.user.id, productId, quantity);
    res.json({
      success: true,
      message: "Cart updated",
      data: cart
    });
  });

  // Remove item from cart
  removeItem = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const cart = await cartService.removeItem(req.user.id, productId);
    res.json({
      success: true,
      message: "Item removed from cart",
      data: cart
    });
  });

  // Clear cart
  clearCart = asyncHandler(async (req, res) => {
    await cartService.clearCart(req.user.id);
    res.json({
      success: true,
      message: "Cart cleared"
    });
  });
}

export default new CartController();

