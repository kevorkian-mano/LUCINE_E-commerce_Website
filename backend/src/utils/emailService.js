import nodemailer from "nodemailer";
import EmailTemplateFactory from "../strategies/email/EmailTemplateFactory.js";

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

/**
 * Send email using Strategy Pattern for email templates
 * @param {string} to - Recipient email address
 * @param {string} templateName - Name of the email template (orderConfirmation, passwordReset)
 * @param {Object} data - Data to be used in the email template
 * @returns {Promise<Object>} Result object with success status and messageId
 */
export const sendEmail = async (to, templateName, data) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email service not configured. Email would be sent to:", to);
      console.log("Template:", templateName, "Data:", data);
      return { success: true, message: "Email logged (SMTP not configured)" };
    }

    // Use Strategy Pattern to get email template
    // This allows us to easily add new email templates without modifying this code
    const template = EmailTemplateFactory.createTemplate(templateName);
    
    // Get subject and HTML body from the template strategy
    const subject = template.getSubject(data);
    const htmlBody = template.getHtmlBody(data);
    
    const mailOptions = {
      from: `"E-commerce Store" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlBody
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

