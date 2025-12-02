/**
 * Observer Interface
 * All observers must implement this interface
 */
class Observer {
  /**
   * Handle notification from subject
   * @param {string} event - Event name (e.g., 'orderCreated', 'orderUpdated', 'orderCancelled')
   * @param {Object} data - Event data (e.g., order object)
   * @returns {Promise<void>}
   */
  async update(event, data) {
    throw new Error('update method must be implemented');
  }
}

export default Observer;

