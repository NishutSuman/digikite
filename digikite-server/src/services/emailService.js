const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  async init() {
    try {
      // Check if email config is provided
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        logger.warn('Email service not configured - SMTP credentials missing');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      // Verify connection configuration
      await this.transporter.verify();
      this.isConfigured = true;
      logger.info('Email service configured successfully');
    } catch (error) {
      logger.error('Email service configuration failed:', error.message);
      this.isConfigured = false;
    }
  }

  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendVerificationEmail(email, name, verificationToken, verificationCode) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping verification email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5174'}/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: email,
        subject: 'Verify Your DigiKite Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">DigiKite</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Digital Marketing Made Simple</p>
              </div>

              <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Welcome to DigiKite, ${name}!</h2>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Thank you for signing up! To complete your registration and start using DigiKite, please verify your email address using one of the methods below:
              </p>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #111827; font-size: 18px; margin-bottom: 15px;">Method 1: Click the Verification Link</h3>
                <a href="${verificationLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Verify Email Address
                </a>
              </div>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #111827; font-size: 18px; margin-bottom: 15px;">Method 2: Enter Verification Code</h3>
                <p style="color: #374151; margin-bottom: 10px;">Enter this 6-digit code in the verification form:</p>
                <div style="background-color: white; border: 2px solid #e5e7eb; border-radius: 6px; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: #4f46e5; letter-spacing: 3px;">
                  ${verificationCode}
                </div>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
                  <strong>Security Note:</strong> This verification code expires in 24 hours.
                </p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
                  If you didn't create a DigiKite account, please ignore this email.
                </p>
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Need help? Contact our support team at support@digikite.com
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 DigiKite. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
Welcome to DigiKite, ${name}!

Thank you for signing up! To complete your registration, please verify your email address.

Verification Code: ${verificationCode}

Or click this link: ${verificationLink}

This verification code expires in 24 hours.

If you didn't create a DigiKite account, please ignore this email.

Need help? Contact us at support@digikite.com

© 2025 DigiKite. All rights reserved.
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Verification email sent successfully', {
        messageId: info.messageId,
        email,
        verificationCode,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Verification email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send verification email:', {
        error: error.message,
        email,
      });

      return {
        success: false,
        message: 'Failed to send verification email',
        error: error.message
      };
    }
  }

  async sendWelcomeEmail(email, name) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping welcome email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: email,
        subject: 'Welcome to DigiKite! 🚀',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">🚀 DigiKite</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Digital Marketing Made Simple</p>
              </div>

              <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Welcome to DigiKite, ${name}! 🎉</h2>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Your account has been successfully verified! You're now ready to explore our powerful digital marketing tools and unlock millions of design assets.
              </p>

              <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #059669; font-size: 18px; margin-bottom: 15px;">✅ What's Next?</h3>
                <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li>Access 12.3 million+ design assets</li>
                  <li>Create and manage marketing campaigns</li>
                  <li>Use our analytics and targeting tools</li>
                  <li>Automate your marketing workflows</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Go to Dashboard
                </a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Need help getting started? Check out our documentation or contact our support team at support@digikite.com
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 DigiKite. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Welcome email sent successfully', {
        messageId: info.messageId,
        email,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Welcome email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send welcome email:', {
        error: error.message,
        email,
      });

      return {
        success: false,
        message: 'Failed to send welcome email',
        error: error.message
      };
    }
  }

  async sendAccountLinkingEmail(email, name) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping account linking email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: email,
        subject: 'Your DigiKite Account Has Been Linked with Google',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">🔗 DigiKite</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Account Security Notification</p>
              </div>

              <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Account Successfully Linked!</h2>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Hi ${name},
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Great news! Your existing DigiKite account has been successfully linked with your Google account. You can now sign in using either method:
              </p>

              <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #0c4a6e; font-size: 16px; margin-bottom: 15px;">✅ Your Login Options:</h3>
                <ul style="color: #374151; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li><strong>Email & Password:</strong> Use your original login credentials</li>
                  <li><strong>Google Sign-In:</strong> Click "Continue with Google" button</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                  Access Your Dashboard
                </a>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 DigiKite. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Account linking email sent successfully', {
        messageId: info.messageId,
        email,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Account linking email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send account linking email:', {
        error: error.message,
        email,
      });

      return {
        success: false,
        message: 'Failed to send account linking email',
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();