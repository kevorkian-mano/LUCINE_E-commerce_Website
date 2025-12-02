import Observer from './Observer.js';

/**
 * OrderObserver - Subject/Observable class
 * Manages a list of observers and notifies them when order events occur
 * Implements the Observer Pattern for decoupled event handling
 */
class OrderObserver {
  constructor() {
    this.observers = [];
  }

  /**
   * Attach an observer to receive notifications
   * @param {Observer} observer - Observer instance that implements Observer interface
   * @throws {Error} If observer doesn't implement Observer interface
   */
  attach(observer) {
    if (!(observer instanceof Observer)) {
      throw new Error('Observer must implement Observer interface');
    }
    
    // Check if observer is already attached
    if (this.observers.includes(observer)) {
      console.warn('Observer is already attached');
      return;
    }
    
    this.observers.push(observer);
    console.log(`Observer attached. Total observers: ${this.observers.length}`);
  }

  /**
   * Detach an observer (stop receiving notifications)
   * @param {Observer} observer - Observer instance to remove
   */
  detach(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      console.log(`Observer detached. Total observers: ${this.observers.length}`);
    }
  }

  /**
   * Notify all observers about an event
   * This is the core of the Observer Pattern - one event triggers multiple observers
   * @param {string} event - Event name (e.g., 'orderCreated', 'orderUpdated', 'orderCancelled')
   * @param {Object} data - Event data (e.g., order object)
   */
  notify(event, data) {
    if (this.observers.length === 0) {
      console.log(`No observers to notify for event: ${event}`);
      return;
    }

    console.log(`Notifying ${this.observers.length} observer(s) about event: ${event}`);
    
    // Notify all observers asynchronously (non-blocking)
    // Each observer handles its own errors to prevent one failure from affecting others
    this.observers.forEach(observer => {
      // Use setImmediate or Promise to make it non-blocking
      Promise.resolve()
        .then(() => observer.update(event, data))
        .catch(error => {
          console.error(`Error notifying observer ${observer.constructor.name}:`, error.message);
          // Don't throw - continue notifying other observers
        });
    });
  }

  /**
   * Get number of attached observers
   * @returns {number} Number of observers
   */
  getObserverCount() {
    return this.observers.length;
  }

  /**
   * Get list of observer names (for debugging)
   * @returns {string[]} Array of observer class names
   */
  getObserverNames() {
    return this.observers.map(observer => observer.constructor.name);
  }

  /**
   * Clear all observers
   */
  clear() {
    this.observers = [];
    console.log('All observers cleared');
  }
}

export default OrderObserver;

