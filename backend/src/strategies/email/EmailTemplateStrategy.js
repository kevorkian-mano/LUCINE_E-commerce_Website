/**
 * Email Template Strategy Interface
 * All email template strategies must implement this interface
 */
class EmailTemplateStrategy {
  /**
   * Generate email subject
   * @param {Object} data - Template data
   * @returns {string} Email subject
   */
  getSubject(data) {
    throw new Error('getSubject must be implemented');
  }

  /**
   * Generate email HTML body
   * @param {Object} data - Template data
   * @returns {string} HTML content
   */
  getHtmlBody(data) {
    throw new Error('getHtmlBody must be implemented');
  }

  /**
   * Get template name
   * @returns {string} Template name
   */
  getName() {
    throw new Error('getName must be implemented');
  }

  /**
   * Validate template data
   * @param {Object} data - Template data
   * @returns {boolean} True if valid
   */
  validateData(data) {
    return true; // Default: no validation
  }
}

export default EmailTemplateStrategy;

