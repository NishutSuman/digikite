const { logger } = require('../utils/logger');
const { env } = require('../config/env');

class GuildIntegrationService {
  constructor() {
    this.guildApiUrl = process.env.GUILD_API_URL || 'http://localhost:5000/api';
    this.guildApiKey = process.env.GUILD_API_KEY || '';
  }

  // Helper to make API requests to Guild
  async makeGuildRequest(endpoint, method = 'GET', body = null) {
    try {
      const url = `${this.guildApiUrl}${endpoint}`;
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.guildApiKey,
          'X-Digikite-Integration': 'true',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      logger.info('Making Guild API request', { url, method });

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Guild API error: ${response.status}`);
      }

      return data;
    } catch (error) {
      logger.error('Guild API request failed', { error: error.message, endpoint });
      throw error;
    }
  }

  // Create a new organization (tenant) in Guild
  async createOrganization(clientData, subscriptionData) {
    try {
      const payload = {
        name: clientData.name,
        shortName: clientData.shortName,
        email: clientData.contactEmail,
        phone: clientData.contactPhone,
        address: clientData.address,
        website: clientData.website,
        logoUrl: clientData.logoUrl,
        organizationType: clientData.organizationType,
        foundationYear: clientData.foundationYear,
        description: clientData.description,
        // Subscription details
        subscription: {
          planCode: subscriptionData.plan?.code || 'STARTER',
          billingCycle: subscriptionData.billingCycle,
          startDate: subscriptionData.startDate,
          endDate: subscriptionData.endDate,
          maxUsers: subscriptionData.customMaxUsers || subscriptionData.plan?.maxUsers || 500,
          storageQuotaMB: subscriptionData.customStorageQuotaMB || subscriptionData.plan?.storageQuotaMB || 5120,
          features: subscriptionData.plan?.features || {},
        },
      };

      const result = await this.makeGuildRequest('/developer/organizations', 'POST', payload);

      logger.info('Guild organization created', {
        guildOrgId: result.data?.id,
        tenantCode: result.data?.tenantCode,
      });

      return {
        orgId: result.data?.id,
        tenantCode: result.data?.tenantCode,
        adminCredentials: result.data?.adminCredentials,
      };
    } catch (error) {
      logger.error('Failed to create Guild organization', { error: error.message });
      throw error;
    }
  }

  // Create admin user in Guild organization
  async createAdminUser(guildOrgId, userData) {
    try {
      const payload = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'ADMIN',
      };

      const result = await this.makeGuildRequest(
        `/developer/organizations/${guildOrgId}/users`,
        'POST',
        payload
      );

      logger.info('Guild admin user created', {
        guildOrgId,
        email: userData.email,
      });

      return result.data;
    } catch (error) {
      logger.error('Failed to create Guild admin user', { error: error.message, guildOrgId });
      throw error;
    }
  }

  // Update organization subscription in Guild
  async updateSubscription(guildOrgId, subscriptionData) {
    try {
      const payload = {
        status: subscriptionData.status,
        planCode: subscriptionData.plan?.code,
        billingCycle: subscriptionData.billingCycle,
        endDate: subscriptionData.endDate,
        maxUsers: subscriptionData.customMaxUsers || subscriptionData.plan?.maxUsers,
        storageQuotaMB: subscriptionData.customStorageQuotaMB || subscriptionData.plan?.storageQuotaMB,
        features: subscriptionData.plan?.features,
      };

      const result = await this.makeGuildRequest(
        `/developer/organizations/${guildOrgId}/subscription`,
        'PUT',
        payload
      );

      logger.info('Guild subscription updated', { guildOrgId, status: subscriptionData.status });

      return result.data;
    } catch (error) {
      logger.error('Failed to update Guild subscription', { error: error.message, guildOrgId });
      throw error;
    }
  }

  // Get organization stats from Guild
  async getOrganizationStats(guildOrgId) {
    try {
      const result = await this.makeGuildRequest(`/developer/organizations/${guildOrgId}/stats`);

      return result.data;
    } catch (error) {
      logger.error('Failed to get Guild organization stats', { error: error.message, guildOrgId });
      throw error;
    }
  }

  // Toggle maintenance mode for organization
  async toggleMaintenance(guildOrgId, enabled, message = null) {
    try {
      const payload = {
        enabled,
        message: message || (enabled ? 'System is under maintenance' : null),
      };

      const result = await this.makeGuildRequest(
        `/developer/organizations/${guildOrgId}/maintenance`,
        'POST',
        payload
      );

      logger.info('Guild maintenance mode toggled', { guildOrgId, enabled });

      return result.data;
    } catch (error) {
      logger.error('Failed to toggle Guild maintenance', { error: error.message, guildOrgId });
      throw error;
    }
  }

  // Suspend organization in Guild (for non-payment)
  async suspendOrganization(guildOrgId, reason = 'Subscription expired') {
    try {
      const payload = {
        status: 'SUSPENDED',
        reason,
      };

      const result = await this.makeGuildRequest(
        `/developer/organizations/${guildOrgId}/status`,
        'PUT',
        payload
      );

      logger.info('Guild organization suspended', { guildOrgId, reason });

      return result.data;
    } catch (error) {
      logger.error('Failed to suspend Guild organization', { error: error.message, guildOrgId });
      throw error;
    }
  }

  // Reactivate organization in Guild
  async reactivateOrganization(guildOrgId) {
    try {
      const payload = {
        status: 'ACTIVE',
      };

      const result = await this.makeGuildRequest(
        `/developer/organizations/${guildOrgId}/status`,
        'PUT',
        payload
      );

      logger.info('Guild organization reactivated', { guildOrgId });

      return result.data;
    } catch (error) {
      logger.error('Failed to reactivate Guild organization', { error: error.message, guildOrgId });
      throw error;
    }
  }

  // Get developer dashboard stats
  async getDashboardStats() {
    try {
      const result = await this.makeGuildRequest('/developer/dashboard');
      return result.data;
    } catch (error) {
      logger.error('Failed to get Guild dashboard stats', { error: error.message });
      throw error;
    }
  }

  // Health check for Guild API
  async healthCheck() {
    try {
      const result = await this.makeGuildRequest('/health');
      return {
        status: 'healthy',
        guildApiUrl: this.guildApiUrl,
        response: result,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        guildApiUrl: this.guildApiUrl,
        error: error.message,
      };
    }
  }
}

module.exports = new GuildIntegrationService();
