import Observer from './Observer.js';
import orderRepository from '../repositories/orderRepository.js';

/**
 * AnalyticsObserver
 * Updates analytics and statistics when order events occur
 * Implements Observer Pattern for decoupled analytics tracking
 */
class AnalyticsObserver extends Observer {
  /**
   * Handle notification from OrderObserver
   * @param {string} event - Event name
   * @param {Object} data - Event data (order object)
   */
  async update(event, data) {
    try {
      if (event === 'orderCreated') {
        await this.handleOrderCreated(data);
      } else if (event === 'orderCancelled') {
        await this.handleOrderCancelled(data);
      }
      // Silently ignore unknown events
    } catch (error) {
      console.error('Error in AnalyticsObserver:', error.message);
      // Don't throw - analytics failure shouldn't break order processing
    }
  }

  /**
   * Update analytics when order is created
   * @param {Object} order - Order object
   */
  async handleOrderCreated(order) {
    try {
      console.log(`📊 Updating analytics for order ${order._id}`);
      console.log(`   Order value: $${order.totalPrice.toFixed(2)}`);
      console.log(`   Items: ${order.orderItems.length}`);
      
      // In a real implementation, you would:
      // 1. Update daily sales statistics
      // 2. Update product sales counts
      // 3. Update customer lifetime value
      // 4. Update category sales
      // 5. Store in analytics database or send to analytics service
      
      // Example: Update product sales count
      for (const item of order.orderItems) {
        console.log(`   Product: ${item.name}, Quantity: ${item.quantity}`);
        // await analyticsService.incrementProductSales(item.product, item.quantity);
      }

      // Example: Update daily stats
      const today = new Date().toISOString().split('T')[0];
      console.log(`   Date: ${today}`);
      // await analyticsService.updateDailyStats(today, order.totalPrice);

      // Example: Update customer analytics
      console.log(`   Customer: ${order.user}`);
      // await analyticsService.updateCustomerLifetimeValue(order.user, order.totalPrice);

      console.log(`✓ Analytics updated for order ${order._id}`);
    } catch (error) {
      console.error(`Failed to update analytics for order ${order._id}:`, error.message);
    }
  }

  /**
   * Update analytics when order is cancelled
   * @param {Object} order - Order object
   */
  async handleOrderCancelled(order) {
    try {
      console.log(`📊 Updating analytics for cancelled order ${order._id}`);
      console.log(`   Cancelled order value: $${order.totalPrice.toFixed(2)}`);
      
      // In a real implementation:
      // 1. Decrement sales statistics
      // 2. Update cancellation rate
      // 3. Track cancellation reasons
      
      // await analyticsService.decrementSales(order.totalPrice);
      // await analyticsService.incrementCancellationRate();
      
      console.log(`✓ Analytics updated for cancelled order ${order._id}`);
    } catch (error) {
      console.error(`Failed to update analytics for cancelled order ${order._id}:`, error.message);
    }
  }
}

export default AnalyticsObserver;

