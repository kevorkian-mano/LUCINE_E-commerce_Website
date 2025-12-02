import EmailTemplateStrategy from './EmailTemplateStrategy.js';

class PasswordResetTemplate extends EmailTemplateStrategy {
  getName() {
    return 'passwordReset';
  }

  validateData(data) {
    if (!data || !data.resetToken || !data.userName) {
      throw new Error('Reset token and user name are required for password reset email');
    }
    return true;
  }

  getSubject(data) {
    return 'Password Reset Request';
  }

  getHtmlBody(data) {
    this.validateData(data);

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${data.resetToken}`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { 
              background-color: #2196F3; 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 5px; 
              display: inline-block;
              font-weight: bold;
            }
            .button:hover { background-color: #1976D2; }
            .warning { 
              background-color: #fff3cd; 
              border-left: 4px solid #ffc107; 
              padding: 15px; 
              margin: 20px 0; 
              border-radius: 4px;
            }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .link-fallback { 
              margin-top: 20px; 
              padding: 15px; 
              background-color: #e9ecef; 
              border-radius: 4px; 
              word-break: break-all;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hello ${data.userName},</p>
              <p>You requested to reset your password. Click the button below to reset it:</p>
              
              <div class="button-container">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>

              <div class="warning">
                <strong>⚠️ Important:</strong> This link will expire in 1 hour. If you didn't request this, please ignore this email.
              </div>

              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <div class="link-fallback">
                ${resetUrl}
              </div>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default PasswordResetTemplate;

