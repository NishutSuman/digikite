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

  // Format currency helper
  formatCurrency(amount, currency = 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Send payment confirmation email with invoice details
  async sendPaymentConfirmationEmail(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping payment confirmation email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const {
        email,
        name,
        organizationName,
        planName,
        billingCycle,
        amount,
        currency = 'INR',
        invoiceNumber,
        paymentId,
        subscriptionEndDate,
      } = data;

      const formattedAmount = this.formatCurrency(amount, currency);
      const formattedEndDate = new Date(subscriptionEndDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const paymentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: email,
        subject: `Payment Confirmed - ${planName} Plan | Invoice #${invoiceNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">DigiKite</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Payment Receipt</p>
              </div>

              <!-- Success Icon -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; width: 80px; height: 80px; background-color: #ecfdf5; border-radius: 50%; line-height: 80px;">
                  <span style="color: #10b981; font-size: 40px;">✓</span>
                </div>
              </div>

              <h2 style="color: #111827; font-size: 24px; margin-bottom: 10px; text-align: center;">Payment Successful!</h2>
              <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">
                Thank you for your payment, ${name}
              </p>

              <!-- Invoice Details Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-size: 14px;">Invoice Number</span>
                  <span style="color: #1e293b; font-weight: 600;">${invoiceNumber}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-size: 14px;">Payment ID</span>
                  <span style="color: #1e293b; font-weight: 600; font-size: 12px;">${paymentId}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-size: 14px;">Payment Date</span>
                  <span style="color: #1e293b; font-weight: 600;">${paymentDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-size: 14px;">Organization</span>
                  <span style="color: #1e293b; font-weight: 600;">${organizationName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-size: 14px;">Plan</span>
                  <span style="color: #1e293b; font-weight: 600;">${planName} (${billingCycle})</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;">
                  <span style="color: #64748b; font-size: 14px;">Valid Until</span>
                  <span style="color: #1e293b; font-weight: 600;">${formattedEndDate}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding-top: 10px;">
                  <span style="color: #1e293b; font-size: 18px; font-weight: 700;">Amount Paid</span>
                  <span style="color: #10b981; font-size: 24px; font-weight: 700;">${formattedAmount}</span>
                </div>
              </div>

              <!-- What's Next -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #1e40af; font-size: 16px; margin-bottom: 15px;">What happens next?</h3>
                <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Your subscription is now active</li>
                  <li>Our team will set up your Guild tenant within 24 hours</li>
                  <li>You'll receive admin credentials via email</li>
                  <li>Start building your alumni community!</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/portal/subscription" style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  View Subscription
                </a>
              </div>

              <!-- Footer -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin-bottom: 10px;">
                  This is an automated receipt for your records. If you have any questions about your subscription, please contact our support team.
                </p>
                <p style="color: #6b7280; font-size: 14px;">
                  Need help? <a href="mailto:support@digikite.com" style="color: #4f46e5;">support@digikite.com</a>
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 DigiKite Infomatrix Pvt Ltd. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
        text: `
Payment Confirmed - ${planName} Plan

Thank you for your payment, ${name}!

Invoice Details:
- Invoice Number: ${invoiceNumber}
- Payment ID: ${paymentId}
- Payment Date: ${paymentDate}
- Organization: ${organizationName}
- Plan: ${planName} (${billingCycle})
- Valid Until: ${formattedEndDate}
- Amount Paid: ${formattedAmount}

What happens next?
- Your subscription is now active
- Our team will set up your Guild tenant within 24 hours
- You'll receive admin credentials via email
- Start building your alumni community!

View your subscription: ${process.env.FRONTEND_URL || 'http://localhost:5175'}/portal/subscription

Need help? Contact support@digikite.com

© 2025 DigiKite Infomatrix Pvt Ltd. All rights reserved.
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Payment confirmation email sent successfully', {
        messageId: info.messageId,
        email,
        invoiceNumber,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Payment confirmation email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send payment confirmation email:', {
        error: error.message,
        email: data.email,
      });

      return {
        success: false,
        message: 'Failed to send payment confirmation email',
        error: error.message
      };
    }
  }

  // Send contact form confirmation email to submitter
  async sendContactConfirmationEmail(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping contact confirmation email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const { email, name, subject } = data;

      const subjectLabels = {
        DEMO: 'Demo Request',
        PRICING: 'Pricing Inquiry',
        SUPPORT: 'Technical Support',
        PARTNERSHIP: 'Partnership Opportunity',
        OTHER: 'General Inquiry',
      };

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: email,
        subject: `We've received your ${subjectLabels[subject] || 'inquiry'} - DigiKite`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">DigiKite</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Thank You for Reaching Out</p>
              </div>

              <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Hi ${name}!</h2>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Thank you for contacting DigiKite. We've received your <strong>${subjectLabels[subject] || 'inquiry'}</strong> and our team will review it shortly.
              </p>

              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #1e40af; font-size: 16px; margin-bottom: 15px;">What happens next?</h3>
                <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>Our team will review your message within 24 hours</li>
                  <li>You'll receive a personalized response from our team</li>
                  <li>For urgent matters, call us at +91 98765 43210</li>
                </ul>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                  While you wait, feel free to explore our website or check out our FAQ section for quick answers.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 DigiKite Infomatrix Pvt Ltd. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Contact confirmation email sent successfully', {
        messageId: info.messageId,
        email,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Contact confirmation email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send contact confirmation email:', {
        error: error.message,
        email: data.email,
      });

      return {
        success: false,
        message: 'Failed to send contact confirmation email',
        error: error.message
      };
    }
  }

  // Send contact form notification to admin
  async sendContactNotificationToAdmin(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping admin notification email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const { name, email, organization, subject, message, submissionId } = data;

      const subjectLabels = {
        DEMO: 'Demo Request',
        PRICING: 'Pricing Inquiry',
        SUPPORT: 'Technical Support',
        PARTNERSHIP: 'Partnership Opportunity',
        OTHER: 'General Inquiry',
      };

      const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER;

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite System',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: adminEmail,
        subject: `New ${subjectLabels[subject] || 'Contact'} from ${name}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">New Contact Submission</h1>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 120px;">Type</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${subjectLabels[subject] || subject}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Name</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;"><a href="mailto:${email}" style="color: #4f46e5;">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Organization</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${organization || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b;">Submission ID</td>
                    <td style="padding: 10px 0; color: #64748b; font-size: 12px;">${submissionId}</td>
                  </tr>
                </table>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Message:</h3>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #4f46e5;">
                  <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Admin notification email sent successfully', {
        messageId: info.messageId,
        submissionId,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Admin notification email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send admin notification email:', {
        error: error.message,
      });

      return {
        success: false,
        message: 'Failed to send admin notification email',
        error: error.message
      };
    }
  }

  // Send trial expiration reminder email
  async sendTrialExpirationReminder(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping trial reminder email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const {
        email,
        name,
        organizationName,
        planName,
        daysRemaining,
        trialEndsAt,
        subscriptionId,
      } = data;

      const formattedEndDate = new Date(trialEndsAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const urgencyColor = daysRemaining <= 3 ? '#ef4444' : daysRemaining <= 7 ? '#f59e0b' : '#3b82f6';
      const urgencyText = daysRemaining <= 3 ? 'expires very soon' : daysRemaining <= 7 ? 'expires soon' : 'trial update';

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: email,
        subject: `Your trial ${urgencyText} - ${daysRemaining} days remaining`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">DigiKite</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Trial Reminder</p>
              </div>

              <!-- Countdown Badge -->
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: ${urgencyColor}; color: white; padding: 15px 30px; border-radius: 50px; font-size: 18px; font-weight: bold;">
                  ${daysRemaining} Day${daysRemaining !== 1 ? 's' : ''} Left
                </div>
              </div>

              <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Hi ${name}!</h2>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Your free trial of the <strong>${planName}</strong> plan for <strong>${organizationName}</strong> is ending on <strong>${formattedEndDate}</strong>.
              </p>

              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #92400e; font-size: 16px; margin-bottom: 10px;">Don't lose access!</h3>
                <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">
                  Upgrade now to continue using all the features you've been enjoying. Your data and configurations will be preserved.
                </p>
              </div>

              <div style="background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                <h3 style="color: #059669; font-size: 16px; margin-bottom: 15px;">What you'll keep:</h3>
                <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px; font-size: 14px;">
                  <li>All your alumni data and configurations</li>
                  <li>Event history and registrations</li>
                  <li>Community posts and interactions</li>
                  <li>Treasury records and transactions</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/portal/subscription" style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin-right: 10px;">
                  Upgrade Now
                </a>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/pricing" style="display: inline-block; background-color: white; color: #4f46e5; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; border: 2px solid #4f46e5;">
                  View Plans
                </a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                  Questions about pricing or need a custom plan? Reply to this email or contact us at support@digikite.com
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 DigiKite Infomatrix Pvt Ltd. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Trial expiration reminder sent successfully', {
        messageId: info.messageId,
        email,
        daysRemaining,
        subscriptionId,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Trial expiration reminder sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send trial expiration reminder:', {
        error: error.message,
        email: data.email,
      });

      return {
        success: false,
        message: 'Failed to send trial expiration reminder',
        error: error.message
      };
    }
  }

  // Send demo request notification to admin
  async sendDemoRequestNotificationToAdmin(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping demo request notification email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const {
        organizationName,
        contactName,
        contactEmail,
        contactPhone,
        organizationType,
        estimatedMembers,
        message,
        preferredDate,
        preferredTime,
        demoRequestId,
      } = data;

      const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER;

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite System',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: adminEmail,
        subject: `New Demo Request from ${organizationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #8b5cf6; color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  NEW DEMO REQUEST
                </div>
              </div>

              <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px; text-align: center;">
                ${organizationName}
              </h1>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b; width: 140px;">Contact Person</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600;">${contactName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Email</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
                      <a href="mailto:${contactEmail}" style="color: #4f46e5; text-decoration: none;">${contactEmail}</a>
                    </td>
                  </tr>
                  ${contactPhone ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Phone</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">
                      <a href="tel:${contactPhone}" style="color: #4f46e5; text-decoration: none;">${contactPhone}</a>
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Organization Type</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${organizationType}</td>
                  </tr>
                  ${estimatedMembers ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Est. Members</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${estimatedMembers.toLocaleString()}</td>
                  </tr>
                  ` : ''}
                  ${preferredDate ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Preferred Date</td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b;">${new Date(preferredDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${preferredTime ? ` at ${preferredTime}` : ''}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              ${message ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #374151; font-size: 16px; margin-bottom: 10px;">Message:</h3>
                <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                  <p style="color: #374151; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
                </div>
              </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin/demos" style="display: inline-block; background-color: #8b5cf6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Demo Request
                </a>
              </div>

              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #6b7280; font-size: 12px;">
                  Request ID: ${demoRequestId}
                </p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Demo request notification email sent to admin', {
        messageId: info.messageId,
        demoRequestId,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Demo request notification email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send demo request notification email:', {
        error: error.message,
      });

      return {
        success: false,
        message: 'Failed to send demo request notification email',
        error: error.message
      };
    }
  }

  // Send trial signup notification to admin
  async sendTrialSignupNotificationToAdmin(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping trial signup notification email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const {
        organizationName,
        contactEmail,
        planName,
        trialEndsAt,
        subscriptionId,
        clientId,
      } = data;

      const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER;

      const formattedTrialEnd = new Date(trialEndsAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite System',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: adminEmail,
        subject: `New Trial Started - ${organizationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  NEW TRIAL SIGNUP
                </div>
              </div>

              <h1 style="color: #111827; font-size: 24px; margin-bottom: 10px; text-align: center;">
                ${organizationName}
              </h1>
              <p style="color: #6b7280; text-align: center; margin-bottom: 30px;">
                has started a free trial
              </p>

              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 24px; margin-bottom: 20px; text-align: center;">
                <p style="color: #1e40af; font-size: 16px; margin: 0 0 10px 0;">Plan Selected</p>
                <p style="color: #1e293b; font-size: 28px; font-weight: 700; margin: 0;">${planName}</p>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Contact Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; text-align: right;">
                      <a href="mailto:${contactEmail}" style="color: #4f46e5; text-decoration: none;">${contactEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b;">Trial Ends</td>
                    <td style="padding: 10px 0; color: #f59e0b; font-weight: 600; text-align: right;">${formattedTrialEnd}</td>
                  </tr>
                </table>
              </div>

              <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #92400e; font-size: 14px; margin: 0; text-align: center;">
                  <strong>Action Required:</strong> Follow up before trial ends to convert to paid customer
                </p>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin/clients" style="display: inline-block; background-color: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  View Client
                </a>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Trial signup notification email sent to admin', {
        messageId: info.messageId,
        subscriptionId,
        clientId,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Trial signup notification email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send trial signup notification email:', {
        error: error.message,
      });

      return {
        success: false,
        message: 'Failed to send trial signup notification email',
        error: error.message
      };
    }
  }

  // Send payment received notification to admin
  async sendPaymentReceivedNotificationToAdmin(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping payment received notification email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const {
        organizationName,
        contactEmail,
        planName,
        billingCycle,
        amount,
        currency = 'INR',
        invoiceNumber,
        paymentId,
        razorpayPaymentId,
      } = data;

      const adminEmail = process.env.ADMIN_EMAIL || process.env.FROM_EMAIL || process.env.SMTP_USER;
      const formattedAmount = this.formatCurrency(amount, currency);

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite System',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: adminEmail,
        subject: `Payment Received - ${formattedAmount} from ${organizationName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; font-weight: 600;">
                  PAYMENT RECEIVED
                </div>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <p style="color: #10b981; font-size: 48px; font-weight: 700; margin: 0;">${formattedAmount}</p>
                <p style="color: #6b7280; margin: 10px 0 0 0;">from ${organizationName}</p>
              </div>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Organization</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600; text-align: right;">${organizationName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Contact Email</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; text-align: right;">
                      <a href="mailto:${contactEmail}" style="color: #4f46e5; text-decoration: none;">${contactEmail}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Plan</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; text-align: right;">${planName} (${billingCycle})</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Invoice Number</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; text-align: right;">${invoiceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b;">Razorpay ID</td>
                    <td style="padding: 10px 0; color: #64748b; font-size: 12px; text-align: right;">${razorpayPaymentId}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin/payments" style="display: inline-block; background-color: #10b981; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-right: 10px;">
                  View Payments
                </a>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5174'}/admin/invoices" style="display: inline-block; background-color: white; color: #10b981; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; border: 2px solid #10b981;">
                  View Invoices
                </a>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Payment received notification email sent to admin', {
        messageId: info.messageId,
        paymentId,
        amount,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Payment received notification email sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send payment received notification email:', {
        error: error.message,
      });

      return {
        success: false,
        message: 'Failed to send payment received notification email',
        error: error.message
      };
    }
  }

  // Send subscription expiration reminder email
  async sendSubscriptionExpirationReminder(data) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured - skipping subscription reminder email');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const {
        email,
        name,
        organizationName,
        planName,
        daysRemaining,
        endDate,
        amount,
        currency = 'INR',
        subscriptionId,
      } = data;

      const formattedEndDate = new Date(endDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const formattedAmount = this.formatCurrency(amount, currency);

      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'DigiKite',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER,
        },
        to: email,
        subject: `Subscription renewal reminder - ${daysRemaining} days remaining`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
            <div style="background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <div style="text-align: center; margin-bottom: 40px;">
                <h1 style="color: #4f46e5; font-size: 28px; margin: 0;">DigiKite</h1>
                <p style="color: #6b7280; margin: 5px 0 0 0;">Subscription Reminder</p>
              </div>

              <h2 style="color: #111827; font-size: 24px; margin-bottom: 20px;">Hi ${name}!</h2>

              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Your <strong>${planName}</strong> subscription for <strong>${organizationName}</strong> will expire on <strong>${formattedEndDate}</strong>.
              </p>

              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Plan</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; font-weight: 600; text-align: right;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Organization</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; text-align: right;">${organizationName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #64748b;">Expires On</td>
                    <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1e293b; text-align: right;">${formattedEndDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; color: #64748b;">Renewal Amount</td>
                    <td style="padding: 10px 0; color: #10b981; font-weight: 700; font-size: 20px; text-align: right;">${formattedAmount}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center; margin-bottom: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5175'}/portal/subscription" style="display: inline-block; background-color: #4f46e5; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Renew Subscription
                </a>
              </div>

              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                  If you have auto-renewal enabled, your subscription will be renewed automatically. Contact support if you need any assistance.
                </p>
              </div>

              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 12px; margin: 0;">
                  © 2025 DigiKite Infomatrix Pvt Ltd. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);

      logger.info('Subscription expiration reminder sent successfully', {
        messageId: info.messageId,
        email,
        daysRemaining,
        subscriptionId,
      });

      return {
        success: true,
        messageId: info.messageId,
        message: 'Subscription expiration reminder sent successfully'
      };
    } catch (error) {
      logger.error('Failed to send subscription expiration reminder:', {
        error: error.message,
        email: data.email,
      });

      return {
        success: false,
        message: 'Failed to send subscription expiration reminder',
        error: error.message
      };
    }
  }
}

module.exports = new EmailService();