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
    const orderNumber = data._id.toString().slice(-8).toUpperCase();
    return `Order Confirmation #${orderNumber} - LUCINE`;
  }

  getHtmlBody(data) {
    this.validateData(data);

    // Format order number
    const orderNumber = data._id.toString().slice(-8).toUpperCase();
    const orderDate = new Date(data.createdAt || Date.now()).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Get shipping address
    const shippingAddress = data.shippingAddress || {};
    const shippingLocation = `${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zipCode}, ${shippingAddress.country}`;

    // Build product items HTML with images
    const itemsHtml = data.orderItems.map((item, index) => {
      const product = item.product || {};
      const productImage = product.image || 'https://via.placeholder.com/100x100?text=No+Image';
      const itemTotal = (item.price * item.quantity).toFixed(2);
      
      return `
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">
            <table cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="width: 100px; vertical-align: top;">
                  <img src="${productImage}" alt="${item.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid #e0e0e0;" />
                </td>
                <td style="padding-left: 15px; vertical-align: top;">
                  <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${item.name}</h3>
                  <p style="margin: 0; color: #666; font-size: 14px;">Quantity: ${item.quantity}</p>
                  <p style="margin: 8px 0 0 0; color: #333; font-size: 16px; font-weight: 600;">$${itemTotal}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    }).join('');

    // Calculate totals
    const itemsPrice = data.itemsPrice || 0;
    const shippingPrice = data.shippingPrice || 0;
    const taxPrice = data.taxPrice || 0;
    const totalPrice = data.totalPrice || 0;

    // Payment status
    const paymentStatus = data.isPaid ? 'Paid' : 'Pending';
    const paymentStatusColor = data.isPaid ? '#4CAF50' : '#FF9800';

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmation - LUCINE</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              background-color: #f5f5f5;
              line-height: 1.6;
              color: #333;
            }
            .email-wrapper {
              max-width: 650px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 40px 30px;
              text-align: center;
            }
            .logo {
              font-size: 42px;
              font-weight: 700;
              color: #ffffff;
              letter-spacing: 2px;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            }
            .header-subtitle {
              color: rgba(255,255,255,0.9);
              font-size: 16px;
              margin-top: 5px;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #333;
              margin-bottom: 25px;
              font-weight: 500;
            }
            .message {
              font-size: 16px;
              color: #555;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .shipping-notice {
              background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 30px 0;
              border-radius: 8px;
            }
            .shipping-notice h3 {
              color: #667eea;
              margin-bottom: 10px;
              font-size: 18px;
            }
            .shipping-notice p {
              color: #555;
              margin: 5px 0;
              font-size: 15px;
            }
            .order-info {
              background-color: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              margin: 30px 0;
            }
            .order-info-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .order-info-row:last-child {
              border-bottom: none;
            }
            .order-info-label {
              color: #666;
              font-size: 14px;
            }
            .order-info-value {
              color: #333;
              font-weight: 600;
              font-size: 14px;
            }
            .products-table {
              width: 100%;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              margin: 30px 0;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .products-table-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              font-size: 18px;
              font-weight: 600;
            }
            .invoice-section {
              background-color: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              margin: 30px 0;
            }
            .invoice-row {
              display: flex;
              justify-content: space-between;
              padding: 12px 0;
              font-size: 15px;
            }
            .invoice-row.subtotal {
              border-top: 2px solid #e0e0e0;
              padding-top: 15px;
              margin-top: 10px;
            }
            .invoice-row.total {
              border-top: 3px solid #667eea;
              padding-top: 20px;
              margin-top: 15px;
              font-size: 22px;
              font-weight: 700;
              color: #667eea;
            }
            .invoice-label {
              color: #666;
            }
            .invoice-value {
              color: #333;
              font-weight: 600;
            }
            .payment-status {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              background-color: ${paymentStatusColor}20;
              color: ${paymentStatusColor};
            }
            .footer {
              background-color: #2c3e50;
              color: #ecf0f1;
              padding: 30px;
              text-align: center;
            }
            .footer p {
              margin: 8px 0;
              font-size: 14px;
            }
            .footer a {
              color: #667eea;
              text-decoration: none;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e0e0e0, transparent);
              margin: 30px 0;
            }
            @media only screen and (max-width: 600px) {
              .content { padding: 20px 15px; }
              .header { padding: 30px 20px; }
              .logo { font-size: 32px; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <!-- Header with Logo -->
            <div class="header">
              <div class="logo">LUCINE</div>
              <div class="header-subtitle">Thank You For Your Order!</div>
            </div>

            <!-- Main Content -->
            <div class="content">
              <div class="greeting">Hello!</div>
              
              <div class="message">
                We're excited to confirm that we've received your order! Your items are being prepared and will be shipped to you soon.
              </div>

              <!-- Shipping Notice -->
              <div class="shipping-notice">
                <h3>📦 Your Order is Being Shipped</h3>
                <p><strong>Shipping Address:</strong></p>
                <p>${shippingLocation}</p>
                <p style="margin-top: 15px; font-size: 14px; color: #666;">
                  We'll send you a tracking number as soon as your order ships. Expected delivery: 3-5 business days.
                </p>
              </div>

              <!-- Order Information -->
              <div class="order-info">
                <div class="order-info-row">
                  <span class="order-info-label">Order Number:</span>
                  <span class="order-info-value">#${orderNumber}</span>
                </div>
                <div class="order-info-row">
                  <span class="order-info-label">Order Date:</span>
                  <span class="order-info-value">${orderDate}</span>
                </div>
                <div class="order-info-row">
                  <span class="order-info-label">Payment Method:</span>
                  <span class="order-info-value">${data.paymentMethod || 'N/A'}</span>
                </div>
                <div class="order-info-row">
                  <span class="order-info-label">Payment Status:</span>
                  <span class="order-info-value">
                    <span class="payment-status">${paymentStatus}</span>
                  </span>
                </div>
              </div>

              <!-- Products Table -->
              <table class="products-table" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="products-table-header">Order Items</td>
                </tr>
                ${itemsHtml}
              </table>

              <!-- Invoice Section -->
              <div class="invoice-section">
                <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">Invoice Summary</h3>
                
                <div class="invoice-row">
                  <span class="invoice-label">Subtotal:</span>
                  <span class="invoice-value">$${itemsPrice.toFixed(2)}</span>
                </div>
                
                ${shippingPrice > 0 ? `
                <div class="invoice-row">
                  <span class="invoice-label">Shipping:</span>
                  <span class="invoice-value">$${shippingPrice.toFixed(2)}</span>
                </div>
                ` : `
                <div class="invoice-row">
                  <span class="invoice-label">Shipping:</span>
                  <span class="invoice-value" style="color: #4CAF50;">FREE</span>
                </div>
                `}
                
                <div class="invoice-row">
                  <span class="invoice-label">Tax:</span>
                  <span class="invoice-value">$${taxPrice.toFixed(2)}</span>
                </div>
                
                <div class="invoice-row total">
                  <span>Total:</span>
                  <span>$${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div class="divider"></div>

              <div class="message" style="text-align: center; color: #666; font-size: 14px;">
                If you have any questions about your order, please don't hesitate to contact us. We're here to help!
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="font-size: 18px; font-weight: 600; margin-bottom: 15px;">LUCINE</p>
              <p>Thank you for shopping with us!</p>
              <p style="margin-top: 20px; font-size: 12px; color: #95a5a6;">
                This is an automated email. Please do not reply to this message.
              </p>
              <p style="font-size: 12px; color: #95a5a6; margin-top: 10px;">
                © ${new Date().getFullYear()} LUCINE. All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default OrderConfirmationTemplate;

