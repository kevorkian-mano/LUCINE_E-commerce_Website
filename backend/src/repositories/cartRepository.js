import Cart from "../models/Cart.js";

class CartRepository {
  async findByUserId(userId) {
    return await Cart.findOne({ user: userId }).populate("items.product");
  }

  async create(userId) {
    const cart = new Cart({ user: userId, items: [] });
    return await cart.save();
  }

  async addItem(userId, productId, quantity) {
    // Use atomic operations to avoid version conflicts
    // First try to increment if item exists (atomic operation)
    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $inc: { "items.$.quantity": quantity } },
      { new: true }
    ).populate("items.product");
    
    if (updatedCart) {
      return updatedCart;
    }
    
    // Item doesn't exist, try to add it (atomic operation)
    const cartWithNewItem = await Cart.findOneAndUpdate(
      { user: userId },
      { $push: { items: { product: productId, quantity } } },
      { new: true, upsert: true }
    ).populate("items.product");
    
    return cartWithNewItem;
  }

  async updateItemQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ user: userId, "items.product": productId });
    if (!cart) {
      return null;
    }
    return await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    ).populate("items.product");
  }

  async removeItem(userId, productId) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return null;
    }
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate("items.product");
  }

  async clearCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    ).populate("items.product");
  }
}

// Export both: singleton for backward compatibility and class for factory
export default new CartRepository();
export { CartRepository };

