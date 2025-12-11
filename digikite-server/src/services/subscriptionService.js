const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class SubscriptionService {
  // Get all subscription plans
  async getAllPlans(includeInactive = false) {
    try {
      const where = includeInactive ? {} : { isActive: true };
      const plans = await prisma.subscriptionPlan.findMany({
        where,
        orderBy: { sortOrder: 'asc' },
      });
      return plans;
    } catch (error) {
      logger.error('Failed to get plans', { error: error.message });
      throw error;
    }
  }

  // Get plan by ID
  async getPlanById(id) {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { id },
      });
      if (!plan) {
        throw new Error('Plan not found');
      }
      return plan;
    } catch (error) {
      logger.error('Failed to get plan', { error: error.message, id });
      throw error;
    }
  }

  // Get plan by code
  async getPlanByCode(code) {
    try {
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { code },
      });
      if (!plan) {
        throw new Error('Plan not found');
      }
      return plan;
    } catch (error) {
      logger.error('Failed to get plan by code', { error: error.message, code });
      throw error;
    }
  }

  // Create subscription plan (admin)
  async createPlan(data) {
    try {
      const plan = await prisma.subscriptionPlan.create({
        data: {
          name: data.name,
          code: data.code.toUpperCase(),
          description: data.description || null,
          priceMonthly: data.priceMonthly,
          priceQuarterly: data.priceQuarterly || null,
          priceYearly: data.priceYearly,
          currency: data.currency || 'INR',
          maxUsers: data.maxUsers || 500,
          storageQuotaMB: data.storageQuotaMB || 5120,
          features: data.features || {},
          isActive: data.isActive !== false,
          isPopular: data.isPopular || false,
          sortOrder: data.sortOrder || 0,
          trialDays: data.trialDays || 7,
        },
      });

      logger.info('Subscription plan created', { id: plan.id, name: plan.name });
      return plan;
    } catch (error) {
      logger.error('Failed to create plan', { error: error.message });
      throw error;
    }
  }

  // Update subscription plan (admin)
  async updatePlan(id, data) {
    try {
      const plan = await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info('Subscription plan updated', { id: plan.id, name: plan.name });
      return plan;
    } catch (error) {
      logger.error('Failed to update plan', { error: error.message, id });
      throw error;
    }
  }

  // Create subscription for client
  async createSubscription(clientId, data) {
    try {
      const plan = await this.getPlanById(data.planId);

      // Calculate amount based on billing cycle
      let amount;
      switch (data.billingCycle) {
        case 'MONTHLY':
          amount = plan.priceMonthly;
          break;
        case 'QUARTERLY':
          amount = plan.priceQuarterly || plan.priceMonthly * 3;
          break;
        case 'YEARLY':
          amount = plan.priceYearly;
          break;
        default:
          amount = plan.priceMonthly;
      }

      // Calculate end date based on billing cycle
      const startDate = data.startDate ? new Date(data.startDate) : new Date();
      const endDate = new Date(startDate);
      switch (data.billingCycle) {
        case 'MONTHLY':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'YEARLY':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Calculate trial end date
      const trialEndsAt = new Date(startDate);
      trialEndsAt.setDate(trialEndsAt.getDate() + plan.trialDays);

      const subscription = await prisma.subscription.create({
        data: {
          clientOrganizationId: clientId,
          planId: data.planId,
          billingCycle: data.billingCycle || 'MONTHLY',
          amount,
          currency: plan.currency,
          startDate,
          endDate,
          trialEndsAt,
          status: 'TRIAL',
          autoRenew: data.autoRenew !== false,
          customMaxUsers: data.customMaxUsers || null,
          customStorageQuotaMB: data.customStorageQuotaMB || null,
        },
        include: {
          plan: true,
          clientOrganization: {
            select: { id: true, name: true },
          },
        },
      });

      logger.info('Subscription created', {
        id: subscription.id,
        clientId,
        planId: data.planId,
        status: subscription.status,
      });

      return subscription;
    } catch (error) {
      logger.error('Failed to create subscription', { error: error.message, clientId });
      throw error;
    }
  }

  // Get all subscriptions (admin)
  async getAllSubscriptions(options = {}) {
    try {
      const { page = 1, limit = 10, status, clientId } = options;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (clientId) where.clientOrganizationId = clientId;

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            plan: {
              select: { name: true, code: true },
            },
            clientOrganization: {
              select: { id: true, name: true, contactEmail: true },
            },
          },
        }),
        prisma.subscription.count({ where }),
      ]);

      return {
        subscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get subscriptions', { error: error.message });
      throw error;
    }
  }

  // Get subscription by ID
  async getSubscriptionById(id) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id },
        include: {
          plan: true,
          clientOrganization: true,
          payments: {
            orderBy: { createdAt: 'desc' },
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      return subscription;
    } catch (error) {
      logger.error('Failed to get subscription', { error: error.message, id });
      throw error;
    }
  }

  // Update subscription status
  async updateSubscriptionStatus(id, status) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          status,
          updatedAt: new Date(),
        },
      });

      logger.info('Subscription status updated', { id, status });
      return subscription;
    } catch (error) {
      logger.error('Failed to update subscription status', { error: error.message, id });
      throw error;
    }
  }

  // Activate subscription (after payment)
  async activateSubscription(id) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          lastRenewalAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          plan: true,
          clientOrganization: true,
        },
      });

      logger.info('Subscription activated', { id });
      return subscription;
    } catch (error) {
      logger.error('Failed to activate subscription', { error: error.message, id });
      throw error;
    }
  }

  // Renew subscription
  async renewSubscription(id) {
    try {
      const currentSub = await this.getSubscriptionById(id);

      const newEndDate = new Date(currentSub.endDate);
      switch (currentSub.billingCycle) {
        case 'MONTHLY':
          newEndDate.setMonth(newEndDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          newEndDate.setMonth(newEndDate.getMonth() + 3);
          break;
        case 'YEARLY':
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          break;
      }

      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'ACTIVE',
          endDate: newEndDate,
          lastRenewalAt: new Date(),
          renewalReminderSent: false,
          updatedAt: new Date(),
        },
      });

      logger.info('Subscription renewed', { id, newEndDate });
      return subscription;
    } catch (error) {
      logger.error('Failed to renew subscription', { error: error.message, id });
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(id) {
    try {
      const subscription = await prisma.subscription.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          autoRenew: false,
          updatedAt: new Date(),
        },
      });

      logger.info('Subscription cancelled', { id });
      return subscription;
    } catch (error) {
      logger.error('Failed to cancel subscription', { error: error.message, id });
      throw error;
    }
  }

  // Get expiring subscriptions (for notifications)
  async getExpiringSubscriptions(daysAhead = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);

      const subscriptions = await prisma.subscription.findMany({
        where: {
          status: { in: ['TRIAL', 'ACTIVE'] },
          endDate: { lte: futureDate },
          autoRenew: true,
        },
        include: {
          plan: {
            select: { name: true },
          },
          clientOrganization: {
            select: { id: true, name: true, contactEmail: true },
          },
        },
      });

      return subscriptions;
    } catch (error) {
      logger.error('Failed to get expiring subscriptions', { error: error.message });
      throw error;
    }
  }

  // Calculate amount based on plan and billing cycle
  calculateAmount(plan, billingCycle) {
    switch (billingCycle) {
      case 'MONTHLY':
        return plan.priceMonthly;
      case 'QUARTERLY':
        return plan.priceQuarterly || plan.priceMonthly * 3;
      case 'YEARLY':
        return plan.priceYearly;
      default:
        return plan.priceMonthly;
    }
  }

  // Get subscription stats
  async getSubscriptionStats() {
    try {
      const [
        total,
        trial,
        active,
        expired,
        cancelled,
        monthlyRevenue,
      ] = await Promise.all([
        prisma.subscription.count(),
        prisma.subscription.count({ where: { status: 'TRIAL' } }),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.subscription.count({ where: { status: 'EXPIRED' } }),
        prisma.subscription.count({ where: { status: 'CANCELLED' } }),
        prisma.subscription.aggregate({
          where: { status: 'ACTIVE' },
          _sum: { amount: true },
        }),
      ]);

      return {
        total,
        trial,
        active,
        expired,
        cancelled,
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
      };
    } catch (error) {
      logger.error('Failed to get subscription stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = new SubscriptionService();
