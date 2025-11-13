import nodemailer from "nodemailer";

// Email service using declarative configuration
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };

  return nodemailer.createTransport(config);
};

const transporter = createTransporter();

// Declarative email templates
const emailTemplates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmation - Order #${order._id}`,
    html: `
      <h2>Thank you for your order!</h2>
      <p>Your order has been confirmed and will be processed shortly.</p>
      <h3>Order Details:</h3>
      <ul>
        ${order.orderItems.map(item => 
          `<li>${item.name} x ${item.quantity} - $${item.price * item.quantity}</li>`
        ).join("")}
      </ul>
      <p><strong>Total: $${order.totalPrice}</strong></p>
      <p>Order ID: ${order._id}</p>
    `
  }),
  orderNotification: (order) => ({
    subject: `Order Notification - Order #${order._id}`,
    html: `
      <h2>New Order Received</h2>
      <p>Order #${order._id} has been placed.</p>
      <p>Total: $${order.totalPrice}</p>
    `
  })
};

// Imperative email sending function
export const sendEmail = async (to, templateName, data) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email service not configured. Email would be sent to:", to);
      console.log("Template:", templateName, "Data:", data);
      return { success: true, message: "Email logged (SMTP not configured)" };
    }

    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template ${templateName} not found`);
    }

    const emailContent = template(data);
    
    const mailOptions = {
      from: `"E-commerce Store" <${process.env.SMTP_USER}>`,
      to,
      ...emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

