import EmailTemplateStrategy from './EmailTemplateStrategy.js';

class OrderConfirmationTemplate extends EmailTemplateStrategy {
  getName() {
    return 'orderConfirmation';
  }

  validateData(data) {
    if (!data || !data._id || !data.orderItems || !data.totalPrice) {
      throw new Error('Order data is required for order confirmation email');
    }
    return true;
  }

  getSubject(data) {
    return `Order Confirmation - Order #${data._id}`;
  }

  getHtmlBody(data) {
    this.validateData(data);

    const itemsHtml = data.orderItems.map(item => 
      `<li>${item.name} x ${item.quantity} - $${item.price * item.quantity}</li>`
    ).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .order-details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .order-details h3 { margin-top: 0; color: #333; }
            .order-details ul { list-style-type: none; padding: 0; }
            .order-details li { padding: 8px 0; border-bottom: 1px solid #eee; }
            .order-details li:last-child { border-bottom: none; }
            .total { font-size: 20px; font-weight: bold; color: #4CAF50; margin-top: 15px; }
            .order-id { color: #666; font-size: 14px; margin-top: 10px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Thank you for your order!</h2>
            </div>
            <div class="content">
              <p>Your order has been confirmed and will be processed shortly.</p>
              <div class="order-details">
                <h3>Order Details:</h3>
                <ul>${itemsHtml}</ul>
                <p class="total">Total: $${data.totalPrice.toFixed(2)}</p>
                <p class="order-id">Order ID: ${data._id}</p>
              </div>
              <p>We'll send you another email when your order ships.</p>
            </div>
            <div class="footer">
              <p>Thank you for shopping with us!</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default OrderConfirmationTemplate;

