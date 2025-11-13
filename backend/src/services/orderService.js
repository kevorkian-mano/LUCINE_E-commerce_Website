import mongoose from "mongoose";
import orderRepository from "../repositories/orderRepository.js";
import userRepository from "../repositories/userRepository.js";
import cartService from "./cartService.js";
import productService from "./productService.js";
import { sendEmail } from "../utils/emailService.js";
import { validateShippingAddress } from "../utils/validators.js";

class OrderService {
  // Imperative: Create order with transaction for concurrency safety (NFR5)
  async createOrder(userId, shippingAddress, paymentMethod) {
    // Validate shipping address
    const addressErrors = validateShippingAddress(shippingAddress);
    if (addressErrors.length > 0) {
      throw new Error(addressErrors.join(", "));
    }

    // Get cart
    const cart = await cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Start transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calculate prices
      const itemsPrice = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
      }, 0);

      const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
      const taxPrice = itemsPrice * 0.1; // 10% tax
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      // Prepare order items
      const orderItems = cart.items.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      // Verify stock availability and update stock atomically
      for (const item of cart.items) {
        const product = await productService.getById(item.product._id);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        await productService.updateStock(item.product._id, item.quantity);
      }

      // Create order
      const order = await orderRepository.create({
        user: userId,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        isPaid: false
      });

      // Clear cart
      await cartService.clearCart(userId);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Send email asynchronously (don't block order creation)
      this.sendOrderConfirmationEmail(order).catch(err => {
        console.error("Failed to send order confirmation email:", err);
      });

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Declarative: Get user's orders
  async getUserOrders(userId) {
    return await orderRepository.findByUserId(userId);
  }

  // Declarative: Get order by ID
  async getOrderById(id, userId = null) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    // If userId provided, verify ownership
    if (userId && order.user._id.toString() !== userId.toString()) {
      throw new Error("Unauthorized access to order");
    }

    return order;
  }

  // Imperative: Update order payment status
  async updateOrderPayment(id, paymentResult) {
    const order = await orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    return await orderRepository.update(id, {
      isPaid: true,
      paidAt: new Date(),
      paymentResult
    });
  }

  // Declarative: Get all orders (admin)
  async getAllOrders(filters = {}) {
    return await orderRepository.findAll(filters);
  }

  // Declarative: Get sales analytics
  async getSalesAnalytics(startDate, endDate) {
    const [analytics] = await orderRepository.getSalesAnalytics(startDate, endDate);
    return analytics || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
  }

  // Declarative: Get sales by category
  async getSalesByCategory(startDate, endDate) {
    return await orderRepository.getSalesByCategory(startDate, endDate);
  }

  // Imperative: Send order confirmation email
  async sendOrderConfirmationEmail(order) {
    try {
      const user = await userRepository.findById(order.user);
      if (user && user.email) {
        await sendEmail(user.email, "orderConfirmation", order);
        await orderRepository.update(order._id, { emailSent: true });
      }
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      throw error;
    }
  }
}

export default new OrderService();

