import Observer from './Observer.js';
import productService from '../services/productService.js';

/**
 * InventoryObserver
 * Manages inventory-related tasks when order events occur
 * Implements Observer Pattern for decoupled inventory management
 */
class InventoryObserver extends Observer {
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
      console.error('Error in InventoryObserver:', error.message);
      // Don't throw - inventory check failure shouldn't break order processing
    }
  }

  /**
   * Check inventory and send alerts when order is created
   * Note: Stock is already updated during order creation, this handles additional tasks
   * @param {Object} order - Order object
   */
  async handleOrderCreated(order) {
    try {
      console.log(`📦 Processing inventory for order ${order._id}`);
      
      // Check for low stock alerts
      const lowStockProducts = [];
      
      for (const item of order.orderItems) {
        try {
          const product = await productService.getById(item.product);
          
          // Check if product is low on stock (threshold: 10 items)
          if (product.stock < 10) {
            lowStockProducts.push({
              name: product.name,
              stock: product.stock,
              threshold: 10
            });
            
            console.log(`   ⚠️  Low stock alert: ${product.name} has ${product.stock} items left`);
          } else {
            console.log(`   ✓ ${product.name}: ${product.stock} items in stock`);
          }
        } catch (error) {
          console.error(`   Error checking stock for product ${item.product}:`, error.message);
        }
      }

      // If there are low stock products, notify admin
      if (lowStockProducts.length > 0) {
        console.log(`   📢 ${lowStockProducts.length} product(s) are low on stock`);
        // In a real implementation:
        // await notificationService.notifyAdmin('lowStock', lowStockProducts);
        // await emailService.sendAdminAlert('lowStock', lowStockProducts);
      }

      // Check if any products are out of stock
      const outOfStockProducts = [];
      for (const item of order.orderItems) {
        try {
          const product = await productService.getById(item.product);
          if (product.stock === 0) {
            outOfStockProducts.push(product.name);
            console.log(`   🚨 Out of stock: ${product.name}`);
          }
        } catch (error) {
          // Product might have been deleted, ignore
        }
      }

      if (outOfStockProducts.length > 0) {
        console.log(`   📢 ${outOfStockProducts.length} product(s) are out of stock`);
        // await notificationService.notifyAdmin('outOfStock', outOfStockProducts);
      }

      console.log(`✓ Inventory processed for order ${order._id}`);
    } catch (error) {
      console.error(`Failed to process inventory for order ${order._id}:`, error.message);
    }
  }

  /**
   * Restore inventory when order is cancelled
   * @param {Object} order - Order object
   */
  async handleOrderCancelled(order) {
    try {
      console.log(`📦 Restoring inventory for cancelled order ${order._id}`);
      
      for (const item of order.orderItems) {
        try {
          // Restore stock by adding back the quantity
          // Note: updateStock subtracts, so we pass negative quantity to add
          await productService.updateStock(item.product, -item.quantity);
          console.log(`   ✓ Restored ${item.quantity} units of ${item.name}`);
        } catch (error) {
          console.error(`   Error restoring stock for product ${item.product}:`, error.message);
        }
      }

      console.log(`✓ Inventory restored for cancelled order ${order._id}`);
    } catch (error) {
      console.error(`Failed to restore inventory for cancelled order ${order._id}:`, error.message);
    }
  }
}

export default InventoryObserver;

