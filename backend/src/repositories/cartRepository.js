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
    // First check if item exists, then update or add
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
      const existingItemIndex = cart.items.findIndex(
        item => item.product.toString() === productId.toString()
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cart.items[existingItemIndex].quantity += quantity;
        await cart.save();
        return await Cart.findById(cart._id).populate("items.product");
      } else {
        // Add new item
        cart.items.push({ product: productId, quantity });
        await cart.save();
        return await Cart.findById(cart._id).populate("items.product");
      }
    } else {
      // Create new cart with item
      const newCart = new Cart({
        user: userId,
        items: [{ product: productId, quantity }]
      });
      await newCart.save();
      return await Cart.findById(newCart._id).populate("items.product");
    }
  }

  async updateItemQuantity(userId, productId, quantity) {
    return await Cart.findOneAndUpdate(
      { user: userId, "items.product": productId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    ).populate("items.product");
  }

  async removeItem(userId, productId) {
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
    );
  }
}

export default new CartRepository();

