import Observer from './Observer.js';
import { sendEmail } from '../utils/emailService.js';
import userRepository from '../repositories/userRepository.js';

/**
 * EmailNotificationObserver
 * Sends email notifications when order events occur
 * Implements Observer Pattern for decoupled email notifications
 */
class EmailNotificationObserver extends Observer {
  /**
   * Handle notification from OrderObserver
   * @param {string} event - Event name
   * @param {Object} data - Event data (order object)
   */
  async update(event, data) {
    try {
      if (event === 'orderCreated') {
        await this.handleOrderCreated(data);
      } else if (event === 'orderUpdated') {
        await this.handleOrderUpdated(data);
      } else if (event === 'orderCancelled') {
        await this.handleOrderCancelled(data);
      } else if (event === 'orderShipped') {
        await this.handleOrderShipped(data);
      }
      // Silently ignore unknown events
    } catch (error) {
      console.error('Error in EmailNotificationObserver:', error.message);
      // Don't throw - email failure shouldn't break order processing
    }
  }

  /**
   * Send order confirmation email when order is created
   * @param {Object} order - Order object
   */
  async handleOrderCreated(order) {
    try {
      const user = await userRepository.findById(order.user);
      if (user && user.email) {
        await sendEmail(user.email, 'orderConfirmation', order);
        console.log(`✓ Order confirmation email sent to ${user.email} for order ${order._id}`);
      } else {
        console.warn(`No email found for user ${order.user}`);
      }
    } catch (error) {
      console.error(`Failed to send order confirmation email for order ${order._id}:`, error.message);
      // Don't throw - email failure shouldn't break order creation
    }
  }

  /**
   * Send order update email when order is updated
   * @param {Object} order - Order object
   */
  async handleOrderUpdated(order) {
    try {
      const user = await userRepository.findById(order.user);
      if (user && user.email) {
        await sendEmail(user.email, 'orderUpdate', order);
        console.log(`✓ Order update email sent to ${user.email} for order ${order._id}`);
      }
    } catch (error) {
      console.error(`Failed to send order update email for order ${order._id}:`, error.message);
    }
  }

  /**
   * Send cancellation email when order is cancelled
   * @param {Object} order - Order object
   */
  async handleOrderCancelled(order) {
    try {
      const user = await userRepository.findById(order.user);
      if (user && user.email) {
        await sendEmail(user.email, 'orderCancellation', order);
        console.log(`✓ Order cancellation email sent to ${user.email} for order ${order._id}`);
      }
    } catch (error) {
      console.error(`Failed to send cancellation email for order ${order._id}:`, error.message);
    }
  }

  /**
   * Send shipping confirmation email when order is shipped
   * @param {Object} order - Order object
   */
  async handleOrderShipped(order) {
    try {
      const user = await userRepository.findById(order.user);
      if (user && user.email) {
        await sendEmail(user.email, 'orderShipped', order);
        console.log(`✓ Shipping confirmation email sent to ${user.email} for order ${order._id}`);
      }
    } catch (error) {
      console.error(`Failed to send shipping email for order ${order._id}:`, error.message);
    }
  }
}

export default EmailNotificationObserver;

