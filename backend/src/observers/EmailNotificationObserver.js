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
        // Only send email immediately for Bank Transfer (no payment confirmation)
        // Card and PayPal payments will send email after payment confirmation
        const paymentMethod = data.paymentMethod || '';
        if (paymentMethod === 'Bank Transfer') {
          await this.handleOrderCreated(data);
        } else {
          console.log(`📧 Skipping email for order ${data._id} - waiting for payment confirmation (${paymentMethod})`);
        }
      } else if (event === 'orderPaymentConfirmed') {
        // Send email when payment is confirmed (after card payment)
        await this.handleOrderPaymentConfirmed(data);
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
      console.log(`📬 EmailNotificationObserver: Order created event received for order ${order._id}`);
      const user = await userRepository.findById(order.user);
      
      if (!user) {
        console.warn(`⚠️  User not found for order ${order._id}`);
        return;
      }
      
      if (!user.email) {
        console.warn(`⚠️  No email found for user ${order.user} (user: ${user.name || 'Unknown'})`);
        return;
      }
      
      console.log(`📧 Preparing to send email to: ${user.email}`);
      // Order is already populated with product details from OrderService
      await sendEmail(user.email, 'orderConfirmation', order);
      console.log(`✅ Order confirmation email sent to ${user.email} for order ${order._id}`);
    } catch (error) {
      console.error(`❌ Failed to send order confirmation email for order ${order._id}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      // Don't throw - email failure shouldn't break order creation
    }
  }

  /**
   * Send order confirmation email when payment is confirmed
   * This is called after card payment is completed
   * @param {Object} order - Order object with isPaid: true
   */
  async handleOrderPaymentConfirmed(order) {
    try {
      console.log(`📬 EmailNotificationObserver: Payment confirmed event received for order ${order._id}`);
      const user = await userRepository.findById(order.user);
      
      if (!user) {
        console.warn(`⚠️  User not found for order ${order._id}`);
        return;
      }
      
      if (!user.email) {
        console.warn(`⚠️  No email found for user ${order.user} (user: ${user.name || 'Unknown'})`);
        return;
      }
      
      console.log(`📧 Preparing to send confirmation email to: ${user.email}`);
      // Order is already populated with product details from OrderService
      await sendEmail(user.email, 'orderConfirmation', order);
      console.log(`✅ Order confirmation email sent to ${user.email} for order ${order._id} (after payment)`);
    } catch (error) {
      console.error(`❌ Failed to send order confirmation email for order ${order._id}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Stack: ${error.stack}`);
      // Don't throw - email failure shouldn't break payment processing
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

