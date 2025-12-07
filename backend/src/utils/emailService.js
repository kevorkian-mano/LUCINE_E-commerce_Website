import nodemailer from "nodemailer";
import EmailTemplateFactory from "../strategies/email/EmailTemplateFactory.js";

// Email service using declarative configuration
// Create transporter lazily to ensure environment variables are loaded
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    const config = {
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    transporter = nodemailer.createTransport(config);
  }
  return transporter;
};

/**
 * Send email using Strategy Pattern for email templates
 * @param {string} to - Recipient email address
 * @param {string} templateName - Name of the email template (orderConfirmation, passwordReset)
 * @param {Object} data - Data to be used in the email template
 * @returns {Promise<Object>} Result object with success status and messageId
 */
export const sendEmail = async (to, templateName, data) => {
  try {
    // Check if email is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("⚠️  Email service not configured!");
      console.log("   Email would be sent to:", to);
      console.log("   Template:", templateName);
      console.log("   To configure: Add SMTP_USER and SMTP_PASS to backend/.env");
      console.log("   See GMAIL_EMAIL_SETUP.md for instructions");
      return { success: false, message: "Email service not configured" };
    }

    console.log(`📧 Attempting to send email to: ${to}`);
    console.log(`   Template: ${templateName}`);
    console.log(`   SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.log(`   SMTP User: ${process.env.SMTP_USER ? process.env.SMTP_USER.substring(0, 5) + '...' : 'NOT SET'}`);
    console.log(`   SMTP Pass: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);

    // Use Strategy Pattern to get email template
    const template = EmailTemplateFactory.createTemplate(templateName);
    
    // Get subject and HTML body from the template strategy
    const subject = template.getSubject(data);
    const htmlBody = template.getHtmlBody(data);
    
    const mailOptions = {
      from: `"LUCINE" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: htmlBody
    };

    console.log(`   Subject: ${subject}`);
    
    // Get transporter (created lazily to ensure env vars are loaded)
    const emailTransporter = getTransporter();
    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully! Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending error:");
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Full error:", error);
    
    // Provide helpful error messages
    if (error.code === 'EAUTH') {
      console.error("   ⚠️  Authentication failed!");
      console.error("   Check your SMTP_USER and SMTP_PASS in backend/.env");
      console.error("   Make sure you're using App Password (not regular password)");
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error("   ⚠️  Connection failed!");
      console.error("   Check your internet connection and SMTP settings");
    } else if (error.code === 'EENVELOPE') {
      console.error("   ⚠️  Invalid email address!");
      console.error("   Check the recipient email:", to);
    }
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

