const razorpayService = require('../services/razorpayService');
const subscriptionService = require('../services/subscriptionService');
const clientService = require('../services/clientService');
const invoiceService = require('../services/invoiceService');
const adminService = require('../services/adminService');
const emailService = require('../services/emailService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class PaymentController {
  // Look up existing organization by email (for prefilling form on retry)
  async lookupOrganization(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return errorResponse(res, 'Email is required', 400);
      }

      const organization = await prisma.clientOrganization.findUnique({
        where: { contactEmail: email },
        select: {
          id: true,
          name: true,
          shortName: true,
          contactEmail: true,
          contactPhone: true,
          address: true,
          status: true,
          subscriptions: {
            where: {
              status: { in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              status: true,
              planId: true,
              billingCycle: true,
              amount: true,
              plan: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                }
              }
            }
          }
        }
      });

      if (!organization) {
        return successResponse(res, 'No existing organization found', { exists: false }, 200);
      }

      return successResponse(res, 'Organization found', {
        exists: true,
        organization: {
          name: organization.name,
          shortName: organization.shortName,
          contactEmail: organization.contactEmail,
          contactPhone: organization.contactPhone || '',
          address: organization.address || '',
        },
        subscription: organization.subscriptions[0] || null,
        status: organization.status,
      }, 200);
    } catch (error) {
      logger.error('Failed to lookup organization', { error: error.message });
      return errorResponse(res, 'Failed to lookup organization', 500);
    }
  }

  // Create payment order for subscription
  async createOrder(req, res) {
    try {
      const { subscriptionId, invoiceId } = req.body;

      if (!subscriptionId && !invoiceId) {
        return errorResponse(res, 'Subscription ID or Invoice ID is required', 400);
      }

      let amount;
      let description;
      let clientOrganizationId;
      let finalSubscriptionId = subscriptionId;
      let finalInvoiceId = invoiceId;

      if (subscriptionId) {
        const subscription = await subscriptionService.getSubscriptionById(subscriptionId);
        amount = subscription.amount;
        description = `Subscription payment - ${subscription.plan?.name || 'Plan'}`;
        clientOrganizationId = subscription.clientOrganizationId;
      }

      // TODO: Handle invoice-based payment

      // Create Razorpay order
      // Receipt max 40 chars
      const receipt = `sub_${Date.now()}`;
      const order = await razorpayService.createOrder(amount, 'INR', receipt, {
        subscriptionId: finalSubscriptionId,
        invoiceId: finalInvoiceId,
      });

      // Create payment record
      const payment = await razorpayService.createPaymentRecord({
        amount,
        currency: 'INR',
        razorpayOrderId: order.id,
        description,
        clientOrganizationId,
        subscriptionId: finalSubscriptionId,
        invoiceId: finalInvoiceId,
      });

      logger.info('Payment order created', {
        paymentId: payment.id,
        orderId: order.id,
        subscriptionId: finalSubscriptionId,
      });

      return successResponse(res, 'Payment order created successfully', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
      }, 201);
    } catch (error) {
      logger.error('Failed to create payment order', { error: error.message });
      return errorResponse(res, 'Failed to create payment order', 500);
    }
  }

  // Public checkout: Create client, subscription, and payment order in one call
  // Also handles retry payments for existing organizations
  async initiateCheckout(req, res) {
    try {
      const userId = req.user?.id;
      const {
        planId,
        billingCycle,
        organizationDetails,
        isFreeTrial = false
      } = req.body;

      // Validate required fields
      if (!planId || !billingCycle || !organizationDetails) {
        return errorResponse(res, 'Plan ID, billing cycle, and organization details are required', 400);
      }

      const { name, shortName, contactEmail, contactPhone, address } = organizationDetails;

      if (!name || !shortName || !contactEmail) {
        return errorResponse(res, 'Organization name, short name, and contact email are required', 400);
      }

      // Get the plan
      const plan = await subscriptionService.getPlanById(planId);
      if (!plan) {
        return errorResponse(res, 'Invalid plan', 400);
      }

      let client;
      let subscription;
      let isExistingClient = false;

      // Check if organization with this email already exists
      const existingClient = await prisma.clientOrganization.findUnique({
        where: { contactEmail },
        include: {
          subscriptions: {
            where: {
              status: { in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: { plan: true }
          }
        }
      });

      if (existingClient) {
        isExistingClient = true;
        client = existingClient;

        // Update organization details (allow editing)
        client = await prisma.clientOrganization.update({
          where: { id: existingClient.id },
          data: {
            name,
            shortName,
            contactPhone: contactPhone || null,
            address: address || null,
            updatedAt: new Date(),
          }
        });

        logger.info('Updated existing client organization', { clientId: client.id, name });

        // Check if there's an existing subscription
        if (existingClient.subscriptions && existingClient.subscriptions.length > 0) {
          const existingSub = existingClient.subscriptions[0];

          // If subscription is already active or in trial, inform user
          if (existingSub.status === 'ACTIVE') {
            return successResponse(res, 'You already have an active subscription', {
              clientId: client.id,
              subscriptionId: existingSub.id,
              isExisting: true,
              status: existingSub.status,
              redirectUrl: '/portal/subscription',
            }, 200);
          }

          // If subscription is in trial or grace period, check if they want to upgrade/pay
          if (existingSub.status === 'TRIAL' || existingSub.status === 'GRACE_PERIOD') {
            // Check if same plan - just retry payment
            if (existingSub.planId === planId && existingSub.billingCycle === billingCycle) {
              subscription = existingSub;
              logger.info('Using existing subscription for retry payment', { subscriptionId: subscription.id });
            } else {
              // Different plan - update the subscription
              subscription = await prisma.subscription.update({
                where: { id: existingSub.id },
                data: {
                  planId,
                  billingCycle,
                  amount: subscriptionService.calculateAmount(plan, billingCycle),
                  updatedAt: new Date(),
                },
                include: { plan: true }
              });
              logger.info('Updated subscription plan', { subscriptionId: subscription.id, newPlanId: planId });
            }
          }
        }

        // If no usable subscription found, create a new one
        if (!subscription) {
          subscription = await subscriptionService.createSubscription(client.id, {
            planId,
            billingCycle,
          });
          logger.info('Created new subscription for existing client', { clientId: client.id, subscriptionId: subscription.id });
        }
      } else {
        // Create new client organization
        client = await clientService.createClient({
          name,
          shortName,
          contactEmail,
          contactPhone: contactPhone || null,
          address: address || null,
        });

        // Create subscription for the client
        subscription = await subscriptionService.createSubscription(client.id, {
          planId,
          billingCycle,
        });

        logger.info('Created new client and subscription', { clientId: client.id, subscriptionId: subscription.id });
      }

      // Link user to client organization if authenticated
      if (userId) {
        const existingLink = await prisma.user.findUnique({
          where: { id: userId },
          select: { clientOrganizationId: true }
        });

        if (!existingLink?.clientOrganizationId) {
          // Link user to client organization (keep USER role)
          await prisma.user.update({
            where: { id: userId },
            data: { clientOrganizationId: client.id }
          });
          logger.info('User linked to client organization', { userId, clientId: client.id });
        }
      }

      // If free trial, don't create payment order - just return success
      if (isFreeTrial) {
        // Update subscription status to TRIAL if not already
        if (subscription.status !== 'TRIAL') {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'TRIAL' }
          });
        }

        // Create admin notification for new trial
        await adminService.createNotification(
          'SUBSCRIPTION_CREATED',
          'New Trial Started',
          `${name} started a ${plan.name} plan trial`,
          { clientId: client.id, subscriptionId: subscription.id, planName: plan.name }
        );

        // Send email notification to admin for new trial
        await emailService.sendTrialSignupNotificationToAdmin({
          organizationName: name,
          contactEmail,
          planName: plan.name,
          trialEndsAt: subscription.trialEndsAt,
          subscriptionId: subscription.id,
          clientId: client.id,
        });

        logger.info('Free trial activated', {
          clientId: client.id,
          subscriptionId: subscription.id,
          planId,
          isExistingClient,
        });

        return successResponse(res, 'Trial activated successfully', {
          clientId: client.id,
          subscriptionId: subscription.id,
          isFreeTrial: true,
          trialEndsAt: subscription.trialEndsAt,
          isExistingClient,
        }, 201);
      }

      // Get the correct amount (might have been updated)
      const amount = subscription.amount || subscriptionService.calculateAmount(plan, billingCycle);

      // For paid subscriptions, create Razorpay order
      // Receipt max 40 chars - use short format
      const receipt = `ck_${Date.now()}`;
      const order = await razorpayService.createOrder(amount, 'INR', receipt, {
        subscriptionId: subscription.id,
        clientId: client.id,
        planId,
        billingCycle,
      });

      // Create payment record
      const payment = await razorpayService.createPaymentRecord({
        amount,
        currency: 'INR',
        razorpayOrderId: order.id,
        description: `${plan.name} Plan - ${billingCycle} Subscription`,
        userId,
        clientOrganizationId: client.id,
        subscriptionId: subscription.id,
      });

      logger.info('Checkout initiated', {
        clientId: client.id,
        subscriptionId: subscription.id,
        paymentId: payment.id,
        orderId: order.id,
        isExistingClient,
      });

      return successResponse(res, 'Checkout initiated successfully', {
        clientId: client.id,
        subscriptionId: subscription.id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
        planName: plan.name,
        billingCycle,
        isExistingClient,
      }, 201);
    } catch (error) {
      logger.error('Failed to initiate checkout', { error: error.message, stack: error.stack });

      return errorResponse(res, error.message || 'Failed to initiate checkout', 500);
    }
  }

  // Verify payment
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return errorResponse(res, 'Missing payment verification details', 400);
      }

      const payment = await razorpayService.verifyAndProcessPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      // Fetch full payment details with subscription and client info
      const fullPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          subscription: {
            include: {
              plan: true,
              clientOrganization: true,
            },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
          clientOrganization: true,
        },
      });

      let invoice = null;
      const subscription = fullPayment?.subscription;
      const clientOrg = fullPayment?.clientOrganization || subscription?.clientOrganization;

      // Generate invoice if there's a subscription
      if (subscription) {
        try {
          invoice = await invoiceService.createInvoice(subscription.id, {
            taxRate: 18, // GST 18%
          });

          // Mark invoice as paid immediately since payment is verified
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          // Link invoice to payment
          await prisma.payment.update({
            where: { id: payment.id },
            data: { invoiceId: invoice.id },
          });

          logger.info('Invoice generated for payment', {
            invoiceId: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            paymentId: payment.id,
          });
        } catch (invoiceError) {
          logger.error('Failed to generate invoice', { error: invoiceError.message, paymentId: payment.id });
          // Don't fail the payment verification if invoice generation fails
        }
      }

      // Send payment confirmation email
      const recipientEmail = fullPayment?.user?.email || clientOrg?.contactEmail;
      const recipientName = fullPayment?.user?.name || clientOrg?.name || 'Customer';

      if (recipientEmail && subscription) {
        try {
          await emailService.sendPaymentConfirmationEmail({
            email: recipientEmail,
            name: recipientName,
            organizationName: clientOrg?.name || 'Your Organization',
            planName: subscription.plan?.name || 'Subscription',
            billingCycle: subscription.billingCycle,
            amount: payment.amount,
            currency: payment.currency,
            invoiceNumber: invoice?.invoiceNumber || `DK-${Date.now()}`,
            paymentId: razorpay_payment_id,
            subscriptionEndDate: subscription.endDate,
          });

          logger.info('Payment confirmation email sent', { email: recipientEmail, paymentId: payment.id });
        } catch (emailError) {
          logger.error('Failed to send payment confirmation email', { error: emailError.message });
          // Don't fail the payment verification if email fails
        }
      }

      // Create notification for admin
      await adminService.createNotification(
        'PAYMENT_RECEIVED',
        'Payment Received',
        `Payment of ₹${payment.amount.toLocaleString('en-IN')} received from ${clientOrg?.name || 'Customer'} for ${subscription?.plan?.name || 'Subscription'}`,
        {
          paymentId: payment.id,
          amount: payment.amount,
          clientName: clientOrg?.name,
          planName: subscription?.plan?.name,
          invoiceNumber: invoice?.invoiceNumber,
          razorpayPaymentId: razorpay_payment_id,
        }
      );

      // Send email notification to admin for payment received
      if (clientOrg && subscription) {
        await emailService.sendPaymentReceivedNotificationToAdmin({
          organizationName: clientOrg.name,
          contactEmail: clientOrg.contactEmail,
          planName: subscription.plan?.name || 'Subscription',
          billingCycle: subscription.billingCycle,
          amount: payment.amount,
          currency: payment.currency,
          invoiceNumber: invoice?.invoiceNumber || `DK-${Date.now()}`,
          paymentId: payment.id,
          razorpayPaymentId: razorpay_payment_id,
        });
      }

      // Ensure user is linked to client organization after payment
      if (fullPayment?.user?.id && clientOrg?.id) {
        const user = await prisma.user.findUnique({
          where: { id: fullPayment.user.id },
          select: { clientOrganizationId: true }
        });

        if (user && !user.clientOrganizationId) {
          await prisma.user.update({
            where: { id: fullPayment.user.id },
            data: { clientOrganizationId: clientOrg.id }
          });
          logger.info('User linked to client organization after payment', {
            userId: fullPayment.user.id,
            clientId: clientOrg.id
          });
        }
      }

      logger.info('Payment verified', {
        paymentId: payment.id,
        razorpayPaymentId: razorpay_payment_id,
        invoiceNumber: invoice?.invoiceNumber,
      });

      return successResponse(res, 'Payment verified successfully', {
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          razorpayPaymentId: razorpay_payment_id,
        },
        subscription: subscription ? {
          id: subscription.id,
          status: 'ACTIVE',
          planName: subscription.plan?.name,
          billingCycle: subscription.billingCycle,
          endDate: subscription.endDate,
        } : null,
        invoice: invoice ? {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          total: invoice.total,
        } : null,
        redirectUrl: '/portal/subscription',
      });
    } catch (error) {
      logger.error('Failed to verify payment', { error: error.message });

      if (error.message === 'Invalid payment signature') {
        return errorResponse(res, 'Payment verification failed', 400);
      }

      return errorResponse(res, 'Failed to verify payment', 500);
    }
  }

  // Handle payment failure callback
  async handleFailure(req, res) {
    try {
      const { razorpay_order_id, error_code, error_description } = req.body;

      if (!razorpay_order_id) {
        return errorResponse(res, 'Order ID is required', 400);
      }

      const payment = await razorpayService.handlePaymentFailure(
        razorpay_order_id,
        error_code || 'UNKNOWN',
        error_description || 'Payment failed'
      );

      return successResponse(res, 'Payment failure recorded', payment);
    } catch (error) {
      logger.error('Failed to handle payment failure', { error: error.message });
      return errorResponse(res, 'Failed to record payment failure', 500);
    }
  }

  // Razorpay webhook handler
  async webhook(req, res) {
    try {
      const signature = req.headers['x-razorpay-signature'];
      const body = JSON.stringify(req.body);

      // Verify webhook signature
      const isValid = razorpayService.verifyWebhookSignature(body, signature);

      if (!isValid) {
        logger.warn('Invalid webhook signature');
        return res.status(400).json({ success: false, message: 'Invalid signature' });
      }

      // Process webhook
      await razorpayService.processWebhook(req.body);

      return res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Webhook processing failed', { error: error.message });
      return res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  }

  // Get all payments (admin)
  async getAllPayments(req, res) {
    try {
      const { page, limit, status, clientId, userId } = req.query;

      const result = await razorpayService.getAllPayments({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        status,
        clientId,
        userId,
      });

      return successResponse(res, 'Payments retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get payments', { error: error.message });
      return errorResponse(res, 'Failed to get payments', 500);
    }
  }

  // Get payment by ID
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      const payment = await razorpayService.getPaymentByOrderId(id);

      if (!payment) {
        return errorResponse(res, 'Payment not found', 404);
      }

      return successResponse(res, 'Payment retrieved successfully', payment);
    } catch (error) {
      logger.error('Failed to get payment', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to get payment', 500);
    }
  }

  // Get payment stats (admin)
  async getPaymentStats(req, res) {
    try {
      const stats = await razorpayService.getPaymentStats();

      return successResponse(res, 'Payment stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get payment stats', { error: error.message });
      return errorResponse(res, 'Failed to get payment stats', 500);
    }
  }
}

module.exports = new PaymentController();
