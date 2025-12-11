const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class RazorpayService {
  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    this.baseUrl = 'https://api.razorpay.com/v1';
  }

  // Helper to make Razorpay API requests
  async makeRequest(endpoint, method = 'GET', body = null) {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');

      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`,
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.description || `Razorpay API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      logger.error('Razorpay API request failed', { error: error.message, endpoint });
      throw error;
    }
  }

  // Create Razorpay order for subscription payment
  async createOrder(amount, currency = 'INR', receipt, notes = {}) {
    try {
      const orderData = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt,
        notes,
      };

      const order = await this.makeRequest('/orders', 'POST', orderData);

      logger.info('Razorpay order created', { orderId: order.id, amount });

      return order;
    } catch (error) {
      logger.error('Failed to create Razorpay order', { error: error.message });
      throw error;
    }
  }

  // Create payment record in database
  async createPaymentRecord(data) {
    try {
      const payment = await prisma.payment.create({
        data: {
          amount: data.amount,
          currency: data.currency || 'INR',
          status: 'PENDING',
          paymentMethod: 'RAZORPAY',
          razorpayOrderId: data.razorpayOrderId,
          description: data.description,
          userId: data.userId || null,
          clientOrganizationId: data.clientOrganizationId || null,
          subscriptionId: data.subscriptionId || null,
          invoiceId: data.invoiceId || null,
        },
      });

      logger.info('Payment record created', { id: payment.id, orderId: data.razorpayOrderId });

      return payment;
    } catch (error) {
      logger.error('Failed to create payment record', { error: error.message });
      throw error;
    }
  }

  // Verify Razorpay payment signature
  verifyPaymentSignature(orderId, paymentId, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      logger.error('Failed to verify payment signature', { error: error.message });
      return false;
    }
  }

  // Verify and process payment
  async verifyAndProcessPayment(orderId, paymentId, signature) {
    try {
      // Verify signature
      const isValid = this.verifyPaymentSignature(orderId, paymentId, signature);

      if (!isValid) {
        throw new Error('Invalid payment signature');
      }

      // Find payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: {
          subscription: {
            include: {
              clientOrganization: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      // Update payment status
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'SUCCESS',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
          updatedAt: new Date(),
        },
      });

      // If this is a subscription payment, activate the subscription
      if (payment.subscriptionId) {
        await prisma.subscription.update({
          where: { id: payment.subscriptionId },
          data: {
            status: 'ACTIVE',
            lastRenewalAt: new Date(),
            updatedAt: new Date(),
          },
        });

        // Update client status if pending
        if (payment.subscription?.clientOrganization?.status === 'PENDING') {
          await prisma.clientOrganization.update({
            where: { id: payment.subscription.clientOrganizationId },
            data: {
              status: 'ACTIVE',
              updatedAt: new Date(),
            },
          });
        }
      }

      // If this is an invoice payment, mark invoice as paid
      if (payment.invoiceId) {
        await prisma.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }

      logger.info('Payment verified and processed', {
        paymentId: payment.id,
        razorpayPaymentId: paymentId,
      });

      return updatedPayment;
    } catch (error) {
      logger.error('Failed to verify and process payment', { error: error.message, orderId });
      throw error;
    }
  }

  // Handle payment failure
  async handlePaymentFailure(orderId, errorCode, errorDescription) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (!payment) {
        throw new Error('Payment record not found');
      }

      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          description: `${payment.description || ''} | Error: ${errorDescription} (${errorCode})`,
          updatedAt: new Date(),
        },
      });

      logger.info('Payment marked as failed', { paymentId: payment.id, errorCode });

      return updatedPayment;
    } catch (error) {
      logger.error('Failed to handle payment failure', { error: error.message, orderId });
      throw error;
    }
  }

  // Get payment by order ID
  async getPaymentByOrderId(orderId) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId: orderId },
        include: {
          subscription: {
            include: {
              plan: true,
              clientOrganization: {
                select: { id: true, name: true },
              },
            },
          },
          invoice: true,
        },
      });

      return payment;
    } catch (error) {
      logger.error('Failed to get payment by order ID', { error: error.message, orderId });
      throw error;
    }
  }

  // Get all payments
  async getAllPayments(options = {}) {
    try {
      const { page = 1, limit = 10, status, clientId, userId } = options;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (clientId) where.clientOrganizationId = clientId;
      if (userId) where.userId = userId;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
            clientOrganization: {
              select: { id: true, name: true },
            },
            subscription: {
              select: { id: true, status: true, billingCycle: true },
            },
          },
        }),
        prisma.payment.count({ where }),
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get payments', { error: error.message });
      throw error;
    }
  }

  // Get payment stats
  async getPaymentStats() {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const [total, success, failed, pending, thisMonthRevenue] = await Promise.all([
        prisma.payment.count(),
        prisma.payment.count({ where: { status: 'SUCCESS' } }),
        prisma.payment.count({ where: { status: 'FAILED' } }),
        prisma.payment.count({ where: { status: 'PENDING' } }),
        prisma.payment.aggregate({
          where: {
            status: 'SUCCESS',
            createdAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        }),
      ]);

      return {
        total,
        success,
        failed,
        pending,
        thisMonthRevenue: thisMonthRevenue._sum.amount || 0,
      };
    } catch (error) {
      logger.error('Failed to get payment stats', { error: error.message });
      throw error;
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(body, signature) {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(body)
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      logger.error('Failed to verify webhook signature', { error: error.message });
      return false;
    }
  }

  // Process webhook event
  async processWebhook(event) {
    try {
      const { payload } = event;

      switch (event.event) {
        case 'payment.captured':
          // Payment was successful
          const capturedPayment = payload.payment.entity;
          await this.verifyAndProcessPayment(
            capturedPayment.order_id,
            capturedPayment.id,
            '' // Signature not available in webhook
          );
          break;

        case 'payment.failed':
          // Payment failed
          const failedPayment = payload.payment.entity;
          await this.handlePaymentFailure(
            failedPayment.order_id,
            failedPayment.error_code,
            failedPayment.error_description
          );
          break;

        case 'order.paid':
          // Order was paid
          logger.info('Order paid webhook received', { orderId: payload.order.entity.id });
          break;

        default:
          logger.info('Unhandled webhook event', { event: event.event });
      }

      return { success: true };
    } catch (error) {
      logger.error('Failed to process webhook', { error: error.message });
      throw error;
    }
  }
}

module.exports = new RazorpayService();
