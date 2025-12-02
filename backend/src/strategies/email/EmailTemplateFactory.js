import OrderConfirmationTemplate from './OrderConfirmationTemplate.js';
import PasswordResetTemplate from './PasswordResetTemplate.js';

/**
 * Factory for creating email template strategies
 * Uses Factory Method Pattern to create appropriate template instances
 */
class EmailTemplateFactory {
  /**
   * Create email template strategy based on template name
   * @param {string} templateName - Name of the template
   * @returns {EmailTemplateStrategy} Template strategy instance
   */
  static createTemplate(templateName) {
    const templates = {
      'orderConfirmation': OrderConfirmationTemplate,
      'passwordReset': PasswordResetTemplate
    };

    const TemplateClass = templates[templateName];
    if (!TemplateClass) {
      throw new Error(`Email template "${templateName}" not found. Available templates: ${Object.keys(templates).join(', ')}`);
    }

    return new TemplateClass();
  }

  /**
   * Get list of available email templates
   * @returns {string[]} Array of template names
   */
  static getAvailableTemplates() {
    return ['orderConfirmation', 'passwordReset'];
  }

  /**
   * Check if a template exists
   * @param {string} templateName - Name of the template
   * @returns {boolean} True if template exists
   */
  static templateExists(templateName) {
    return EmailTemplateFactory.getAvailableTemplates().includes(templateName);
  }
}

export default EmailTemplateFactory;

