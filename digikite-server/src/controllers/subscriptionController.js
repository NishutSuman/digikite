const subscriptionService = require('../services/subscriptionService');
const guildIntegrationService = require('../services/guildIntegrationService');
const clientService = require('../services/clientService');
const adminService = require('../services/adminService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class SubscriptionController {
  // Public: Get all active plans
  async getPlans(req, res) {
    try {
      const plans = await subscriptionService.getAllPlans(false);

      return successResponse(res, 'Plans retrieved successfully', plans);
    } catch (error) {
      logger.error('Failed to get plans', { error: error.message });
      return errorResponse(res, 'Failed to get plans', 500);
    }
  }

  // Admin: Get all plans (including inactive)
  async getAllPlans(req, res) {
    try {
      const { includeInactive } = req.query;
      const plans = await subscriptionService.getAllPlans(includeInactive === 'true');

      return successResponse(res, 'Plans retrieved successfully', plans);
    } catch (error) {
      logger.error('Failed to get plans', { error: error.message });
      return errorResponse(res, 'Failed to get plans', 500);
    }
  }

  // Admin: Get plan by ID
  async getPlanById(req, res) {
    try {
      const { id } = req.params;
      const plan = await subscriptionService.getPlanById(id);

      return successResponse(res, 'Plan retrieved successfully', plan);
    } catch (error) {
      logger.error('Failed to get plan', { error: error.message, id: req.params.id });

      if (error.message === 'Plan not found') {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to get plan', 500);
    }
  }

  // Admin: Create plan
  async createPlan(req, res) {
    try {
      const planData = req.body;

      if (!planData.name || !planData.code || !planData.priceMonthly || !planData.priceYearly) {
        return errorResponse(res, 'Name, code, monthly price, and yearly price are required', 400);
      }

      const plan = await subscriptionService.createPlan(planData);

      logger.info('Plan created', {
        id: plan.id,
        name: plan.name,
        createdBy: req.user?.id,
      });

      return successResponse(res, 'Plan created successfully', plan, 201);
    } catch (error) {
      logger.error('Failed to create plan', { error: error.message });

      if (error.code === 'P2002') {
        return errorResponse(res, 'A plan with this code already exists', 409);
      }

      return errorResponse(res, 'Failed to create plan', 500);
    }
  }

  // Admin: Update plan
  async updatePlan(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Don't allow changing the code
      delete updateData.code;

      const plan = await subscriptionService.updatePlan(id, updateData);

      logger.info('Plan updated', {
        id,
        name: plan.name,
        updatedBy: req.user?.id,
      });

      return successResponse(res, 'Plan updated successfully', plan);
    } catch (error) {
      logger.error('Failed to update plan', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to update plan', 500);
    }
  }

  // Admin: Create subscription for client
  async createSubscription(req, res) {
    try {
      const { clientId } = req.params;
      const { planId, billingCycle, startDate, autoRenew, customMaxUsers, customStorageQuotaMB } = req.body;

      if (!planId || !billingCycle) {
        return errorResponse(res, 'Plan ID and billing cycle are required', 400);
      }

      const subscription = await subscriptionService.createSubscription(clientId, {
        planId,
        billingCycle,
        startDate,
        autoRenew,
        customMaxUsers,
        customStorageQuotaMB,
      });

      logger.info('Subscription created', {
        id: subscription.id,
        clientId,
        planId,
        createdBy: req.user?.id,
      });

      return successResponse(res, 'Subscription created successfully', subscription, 201);
    } catch (error) {
      logger.error('Failed to create subscription', { error: error.message, clientId: req.params.clientId });
      return errorResponse(res, 'Failed to create subscription', 500);
    }
  }

  // Admin: Get all subscriptions
  async getAllSubscriptions(req, res) {
    try {
      const { page, limit, status, clientId } = req.query;

      const result = await subscriptionService.getAllSubscriptions({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        status,
        clientId,
      });

      return successResponse(res, 'Subscriptions retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get subscriptions', { error: error.message });
      return errorResponse(res, 'Failed to get subscriptions', 500);
    }
  }

  // Admin: Get subscription by ID
  async getSubscriptionById(req, res) {
    try {
      const { id } = req.params;
      const subscription = await subscriptionService.getSubscriptionById(id);

      return successResponse(res, 'Subscription retrieved successfully', subscription);
    } catch (error) {
      logger.error('Failed to get subscription', { error: error.message, id: req.params.id });

      if (error.message === 'Subscription not found') {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to get subscription', 500);
    }
  }

  // Admin: Activate subscription
  async activateSubscription(req, res) {
    try {
      const { id } = req.params;

      const subscription = await subscriptionService.activateSubscription(id);

      // If client has Guild provisioned, update subscription in Guild
      if (subscription.clientOrganization?.guildOrgId) {
        try {
          await guildIntegrationService.updateSubscription(
            subscription.clientOrganization.guildOrgId,
            subscription
          );
        } catch (guildError) {
          logger.warn('Failed to update Guild subscription', { error: guildError.message });
        }
      }

      logger.info('Subscription activated', {
        id,
        activatedBy: req.user?.id,
      });

      return successResponse(res, 'Subscription activated successfully', subscription);
    } catch (error) {
      logger.error('Failed to activate subscription', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to activate subscription', 500);
    }
  }

  // Admin: Renew subscription
  async renewSubscription(req, res) {
    try {
      const { id } = req.params;

      const subscription = await subscriptionService.renewSubscription(id);

      // If client has Guild provisioned, update subscription in Guild
      const client = await clientService.getClientById(subscription.clientOrganizationId);
      if (client.guildOrgId) {
        try {
          await guildIntegrationService.updateSubscription(client.guildOrgId, subscription);
        } catch (guildError) {
          logger.warn('Failed to update Guild subscription', { error: guildError.message });
        }
      }

      // Create notification
      await adminService.createNotification(
        'SUBSCRIPTION_RENEWED',
        'Subscription Renewed',
        `Subscription for ${client.name} has been renewed`,
        { subscriptionId: id, clientId: client.id }
      );

      logger.info('Subscription renewed', {
        id,
        renewedBy: req.user?.id,
      });

      return successResponse(res, 'Subscription renewed successfully', subscription);
    } catch (error) {
      logger.error('Failed to renew subscription', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to renew subscription', 500);
    }
  }

  // Admin: Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const { id } = req.params;

      const subscription = await subscriptionService.cancelSubscription(id);

      // If client has Guild provisioned, update subscription in Guild
      const client = await clientService.getClientById(subscription.clientOrganizationId);
      if (client.guildOrgId) {
        try {
          await guildIntegrationService.updateSubscription(client.guildOrgId, {
            ...subscription,
            status: 'CANCELLED',
          });
        } catch (guildError) {
          logger.warn('Failed to update Guild subscription', { error: guildError.message });
        }
      }

      logger.info('Subscription cancelled', {
        id,
        cancelledBy: req.user?.id,
      });

      return successResponse(res, 'Subscription cancelled successfully', subscription);
    } catch (error) {
      logger.error('Failed to cancel subscription', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to cancel subscription', 500);
    }
  }

  // Admin: Get expiring subscriptions
  async getExpiringSubscriptions(req, res) {
    try {
      const { days } = req.query;
      const subscriptions = await subscriptionService.getExpiringSubscriptions(
        days ? parseInt(days) : 7
      );

      return successResponse(res, 'Expiring subscriptions retrieved successfully', subscriptions);
    } catch (error) {
      logger.error('Failed to get expiring subscriptions', { error: error.message });
      return errorResponse(res, 'Failed to get expiring subscriptions', 500);
    }
  }

  // Admin: Get subscription stats
  async getSubscriptionStats(req, res) {
    try {
      const stats = await subscriptionService.getSubscriptionStats();

      return successResponse(res, 'Subscription stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get subscription stats', { error: error.message });
      return errorResponse(res, 'Failed to get subscription stats', 500);
    }
  }
}

module.exports = new SubscriptionController();
