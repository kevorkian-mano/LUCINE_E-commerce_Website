import mongoose from "mongoose";
import orderRepository from "../repositories/orderRepository.js";
import userRepository from "../repositories/userRepository.js";
import cartService from "./cartService.js";
import productService from "./productService.js";
import { validateShippingAddress } from "../utils/validators.js";
import OrderObserver from "../observers/OrderObserver.js";
import { AppError } from "../utils/AppError.js";
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
      throw new AppError(addressErrors.join(", "), 400);
    }

    // Get cart - cartService.getCart uses cartRepository.findByUserId which populates products
    const cart = await this.cartService.getCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    // Verify products are populated (cartRepository.findByUserId should populate them)
    // If not populated, it means products don't exist or there's an issue
    for (const item of cart.items) {
      if (!item.product) {
        throw new AppError(`Product not found for cart item`, 400);
      }
      // If product is just an ID (not populated), try to get the product
      if (typeof item.product === 'string' || (item.product._id && !item.product.name)) {
        // Product not fully populated, fetch it
        const product = await this.productService.getById(item.product._id || item.product);
        item.product = product;
      }
    }

    // Start transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Calculate prices
      const itemsPrice = cart.items.reduce((total, item) => {
        if (!item.product || !item.product.price) {
          throw new AppError(`Product information missing for cart item`, 400);
        }
        return total + (item.product.price * item.quantity);
      }, 0);

      const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
      const taxPrice = itemsPrice * 0.1; // 10% tax
      const totalPrice = itemsPrice + shippingPrice + taxPrice;

      // Prepare order items
      const orderItems = cart.items.map(item => {
        if (!item.product || !item.product._id || !item.product.name || !item.product.price) {
          throw new AppError(`Product information missing for cart item`, 400);
        }
        return {
          product: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        };
      });

      // Verify stock availability and update stock atomically
      for (const item of cart.items) {
        const productId = item.product._id || item.product;
        if (!productId) {
          throw new AppError(`Product ID missing for cart item`, 400);
        }
        const product = await this.productService.getById(productId);
        if (product.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${product.name}`, 400);
        }
        await this.productService.updateStock(productId, item.quantity);
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

      // Populate order with product details for observers (especially email)
      const populatedOrder = await this.orderRepository.findById(order._id);

      // Notify all observers about order creation (Observer Pattern)
      // This will automatically trigger:
      // - EmailNotificationObserver: Sends order confirmation email
      // - AnalyticsObserver: Updates sales analytics
      // - InventoryObserver: Checks for low stock alerts
      // All observers run asynchronously and handle their own errors
      // This decouples order creation from notification logic
      this.orderObserver.notify('orderCreated', populatedOrder);

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
    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError("Order not found", 404);
    }
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // If userId provided, verify ownership
    if (userId && order.user._id.toString() !== userId.toString()) {
      throw new AppError("Unauthorized access to order", 403);
    }

    return order;
  }

  // Imperative: Update order payment status
  async updateOrderPayment(id, paymentResult) {
    console.log('[OrderService] Updating order payment:', { orderId: id, paymentResult });
    const order = await this.orderRepository.findById(id);
    if (!order) {
      console.error('[OrderService] Order not found:', id);
      throw new AppError("Order not found", 404);
    }

    console.log('[OrderService] Current order status:', {
      orderId: order._id,
      isPaid: order.isPaid,
      paidAt: order.paidAt
    });

    const updatedOrder = await this.orderRepository.update(id, {
      isPaid: true,
      paidAt: new Date(),
      paymentResult
    });

    console.log('[OrderService] Order updated:', {
      orderId: updatedOrder._id,
      isPaid: updatedOrder.isPaid,
      paidAt: updatedOrder.paidAt
    });

    // Populate order with product details for email
    const populatedOrder = await this.orderRepository.findById(updatedOrder._id);
    
    // Notify observers that order payment was updated
    // This will trigger email notification after payment is confirmed
    this.orderObserver.notify('orderPaymentConfirmed', populatedOrder);

    return updatedOrder;
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
      throw new AppError("Order not found", 404);
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
      throw new AppError("Order not found", 404);
    }

    if (order.status === 'cancelled') {
      throw new AppError("Order is already cancelled", 400);
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

