import mongoose from "mongoose";
import orderRepository from "../repositories/orderRepository.js";
import userRepository from "../repositories/userRepository.js";
import cartService from "./cartService.js";
import productService from "./productService.js";
import { validateShippingAddress } from "../utils/validators.js";
import OrderObserver from "../observers/OrderObserver.js";
import EmailNotificationObserver from "../observers/EmailNotificationObserver.js";
import AnalyticsObserver from "../observers/AnalyticsObserver.js";
import InventoryObserver from "../observers/InventoryObserver.js";

class OrderService {
  constructor(
    orderRepositoryParam = null,
    userRepositoryParam = null,
    cartServiceParam = null,
    productServiceParam = null
  ) {
    // Accept dependencies (Dependency Injection)
    // If not provided, use default singletons for backward compatibility
    this.orderRepository = orderRepositoryParam || orderRepository;
    this.userRepository = userRepositoryParam || userRepository;
    this.cartService = cartServiceParam || cartService;
    this.productService = productServiceParam || productService;

    // Initialize OrderObserver (Subject) for Observer Pattern
    this.orderObserver = new OrderObserver();
    
    // Attach observers - these will be notified when order events occur
    // This decouples order service from notification services
    this.orderObserver.attach(new EmailNotificationObserver());
    this.orderObserver.attach(new AnalyticsObserver());
    this.orderObserver.attach(new InventoryObserver());
    
    console.log(`OrderService initialized with ${this.orderObserver.getObserverCount()} observers`);
  }

  // Imperative: Create order with transaction for concurrency safety (NFR5)
  async createOrder(userId, shippingAddress, paymentMethod) {
    // Validate shipping address
    const addressErrors = validateShippingAddress(shippingAddress);
    if (addressErrors.length > 0) {
      throw new Error(addressErrors.join(", "));
    }

    // Get cart
    const cart = await this.cartService.getCart(userId);
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
        const product = await this.productService.getById(item.product._id);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        await this.productService.updateStock(item.product._id, item.quantity);
      }

      // Create order
      const order = await this.orderRepository.create({
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
      await this.cartService.clearCart(userId);

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Notify all observers about order creation (Observer Pattern)
      // This will automatically trigger:
      // - EmailNotificationObserver: Sends order confirmation email
      // - AnalyticsObserver: Updates sales analytics
      // - InventoryObserver: Checks for low stock alerts
      // All observers run asynchronously and handle their own errors
      // This decouples order creation from notification logic
      this.orderObserver.notify('orderCreated', order);

      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  // Declarative: Get user's orders
  async getUserOrders(userId) {
    return await this.orderRepository.findByUserId(userId);
  }

  // Declarative: Get order by ID
  async getOrderById(id, userId = null) {
    const order = await this.orderRepository.findById(id);
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
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error("Order not found");
    }

    return await this.orderRepository.update(id, {
      isPaid: true,
      paidAt: new Date(),
      paymentResult
    });
  }

  // Declarative: Get all orders (admin)
  async getAllOrders(filters = {}) {
    return await this.orderRepository.findAll(filters);
  }

  // Declarative: Get sales analytics
  async getSalesAnalytics(startDate, endDate) {
    const [analytics] = await this.orderRepository.getSalesAnalytics(startDate, endDate);
    return analytics || { totalSales: 0, totalOrders: 0, averageOrderValue: 0 };
  }

  // Declarative: Get sales by category
  async getSalesByCategory(startDate, endDate) {
    return await this.orderRepository.getSalesByCategory(startDate, endDate);
  }

  // Update order status and notify observers
  async updateOrderStatus(orderId, status) {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    await this.orderRepository.update(orderId, { status, updatedAt: new Date() });
    
    // Notify observers about order update
    const updatedOrder = await this.orderRepository.findById(orderId);
    this.orderObserver.notify('orderUpdated', updatedOrder);
    
    return updatedOrder;
  }

  // Cancel order and notify observers
  async cancelOrder(orderId, reason = '') {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === 'cancelled') {
      throw new Error("Order is already cancelled");
    }

    await this.orderRepository.update(orderId, { 
      status: 'cancelled', 
      cancellationReason: reason,
      cancelledAt: new Date() 
    });
    
    // Notify observers about order cancellation
    // This will trigger:
    // - EmailNotificationObserver: Sends cancellation email
    // - AnalyticsObserver: Updates cancellation statistics
    // - InventoryObserver: Restores inventory
    const cancelledOrder = await this.orderRepository.findById(orderId);
    this.orderObserver.notify('orderCancelled', cancelledOrder);
    
    return cancelledOrder;
  }
}

// Export both: singleton for backward compatibility and class for factory
export default new OrderService();
export { OrderService };

