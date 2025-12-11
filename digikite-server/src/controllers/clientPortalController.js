const { PrismaClient } = require('@prisma/client');
const guildIntegrationService = require('../services/guildIntegrationService');
const razorpayService = require('../services/razorpayService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

const prisma = new PrismaClient();

class ClientPortalController {
  // Get my organization details
  async getMyOrganization(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      const organization = await prisma.clientOrganization.findUnique({
        where: { id: clientId },
        include: {
          subscriptions: {
            where: { status: { in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD'] } },
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              plan: true,
            },
          },
        },
      });

      if (!organization) {
        return errorResponse(res, 'Organization not found', 404);
      }

      return successResponse(res, 'Organization retrieved successfully', organization);
    } catch (error) {
      logger.error('Failed to get organization', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to get organization', 500);
    }
  }

  // Get my subscription
  async getMySubscription(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      const subscription = await prisma.subscription.findFirst({
        where: {
          clientOrganizationId: clientId,
          status: { in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
        },
      });

      if (!subscription) {
        return errorResponse(res, 'No active subscription found', 404);
      }

      // Calculate days remaining
      const daysRemaining = Math.ceil(
        (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)
      );

      return successResponse(res, 'Subscription retrieved successfully', {
        ...subscription,
        daysRemaining: Math.max(0, daysRemaining),
      });
    } catch (error) {
      logger.error('Failed to get subscription', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to get subscription', 500);
    }
  }

  // Get my invoices
  async getMyInvoices(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;
      const { page = 1, limit = 10 } = req.query;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where: { clientOrganizationId: clientId },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.invoice.count({ where: { clientOrganizationId: clientId } }),
      ]);

      return successResponse(res, 'Invoices retrieved successfully', {
        invoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      logger.error('Failed to get invoices', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to get invoices', 500);
    }
  }

  // Get my payments
  async getMyPayments(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;
      const { page = 1, limit = 10 } = req.query;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: { clientOrganizationId: clientId },
          skip,
          take: parseInt(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.payment.count({ where: { clientOrganizationId: clientId } }),
      ]);

      return successResponse(res, 'Payments retrieved successfully', {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      logger.error('Failed to get payments', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to get payments', 500);
    }
  }

  // Get Guild access info
  async getGuildAccess(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      const organization = await prisma.clientOrganization.findUnique({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          guildTenantCode: true,
          guildOrgId: true,
          isGuildProvisioned: true,
          provisionedAt: true,
        },
      });

      if (!organization) {
        return errorResponse(res, 'Organization not found', 404);
      }

      if (!organization.isGuildProvisioned) {
        return successResponse(res, 'Guild access info retrieved', {
          isProvisioned: false,
          message: 'Guild platform is not yet set up for your organization. Please contact support.',
        });
      }

      // Construct Guild access URLs
      const guildBaseUrl = process.env.GUILD_FRONTEND_URL || 'http://localhost:5173';

      return successResponse(res, 'Guild access info retrieved', {
        isProvisioned: true,
        tenantCode: organization.guildTenantCode,
        guildUrls: {
          web: `${guildBaseUrl}/${organization.guildTenantCode}`,
          admin: `${guildBaseUrl}/${organization.guildTenantCode}/admin`,
        },
        apkDownload: {
          android: '/downloads/guild-app.apk', // TODO: Configure actual APK URL
          playStore: 'https://play.google.com/store/apps/details?id=com.digikite.guild',
        },
        provisionedAt: organization.provisionedAt,
      });
    } catch (error) {
      logger.error('Failed to get Guild access', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to get Guild access info', 500);
    }
  }

  // Get Guild stats for my organization
  async getMyGuildStats(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      const organization = await prisma.clientOrganization.findUnique({
        where: { id: clientId },
        select: {
          guildOrgId: true,
          isGuildProvisioned: true,
        },
      });

      if (!organization?.isGuildProvisioned || !organization?.guildOrgId) {
        return errorResponse(res, 'Guild platform is not set up for your organization', 400);
      }

      const stats = await guildIntegrationService.getOrganizationStats(organization.guildOrgId);

      return successResponse(res, 'Guild stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get Guild stats', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to get Guild stats', 500);
    }
  }

  // Get client dashboard overview
  async getDashboard(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      const [organization, subscription, recentPayments, invoicesDue] = await Promise.all([
        prisma.clientOrganization.findUnique({
          where: { id: clientId },
          select: {
            id: true,
            name: true,
            shortName: true,
            status: true,
            isGuildProvisioned: true,
            guildTenantCode: true,
          },
        }),
        prisma.subscription.findFirst({
          where: {
            clientOrganizationId: clientId,
            status: { in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD'] },
          },
          orderBy: { createdAt: 'desc' },
          include: {
            plan: {
              select: { name: true, code: true },
            },
          },
        }),
        prisma.payment.findMany({
          where: { clientOrganizationId: clientId },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.invoice.count({
          where: {
            clientOrganizationId: clientId,
            status: { in: ['SENT', 'OVERDUE'] },
          },
        }),
      ]);

      // Calculate subscription info
      let subscriptionInfo = null;
      if (subscription) {
        const daysRemaining = Math.ceil(
          (new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        subscriptionInfo = {
          ...subscription,
          daysRemaining: Math.max(0, daysRemaining),
          isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0,
        };
      }

      return successResponse(res, 'Dashboard retrieved successfully', {
        organization,
        subscription: subscriptionInfo,
        recentPayments,
        invoicesDue,
      });
    } catch (error) {
      logger.error('Failed to get dashboard', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to get dashboard', 500);
    }
  }

  // Initiate subscription renewal payment
  async initiateRenewalPayment(req, res) {
    try {
      const clientId = req.user?.clientOrganizationId;

      if (!clientId) {
        return errorResponse(res, 'No organization associated with this account', 403);
      }

      // Get current subscription
      const subscription = await prisma.subscription.findFirst({
        where: {
          clientOrganizationId: clientId,
          status: { in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD', 'EXPIRED'] },
        },
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
          clientOrganization: true,
        },
      });

      if (!subscription) {
        return errorResponse(res, 'No subscription found', 404);
      }

      // Create Razorpay order
      const receipt = `renew_${subscription.id}_${Date.now()}`;
      const order = await razorpayService.createOrder(
        subscription.amount,
        'INR',
        receipt,
        {
          subscriptionId: subscription.id,
          clientId: clientId,
          type: 'RENEWAL',
        }
      );

      // Create payment record
      const payment = await razorpayService.createPaymentRecord({
        amount: subscription.amount,
        currency: 'INR',
        razorpayOrderId: order.id,
        description: `Subscription renewal - ${subscription.plan?.name || 'Plan'}`,
        clientOrganizationId: clientId,
        subscriptionId: subscription.id,
      });

      logger.info('Renewal payment order created', {
        paymentId: payment.id,
        orderId: order.id,
        subscriptionId: subscription.id,
        clientId,
      });

      return successResponse(res, 'Payment order created successfully', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        paymentId: payment.id,
        subscription: {
          id: subscription.id,
          plan: subscription.plan?.name,
          amount: subscription.amount,
          billingCycle: subscription.billingCycle,
        },
      }, 201);
    } catch (error) {
      logger.error('Failed to initiate renewal payment', { error: error.message, userId: req.user?.id });
      return errorResponse(res, 'Failed to initiate payment', 500);
    }
  }
}

module.exports = new ClientPortalController();
