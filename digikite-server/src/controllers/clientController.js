const clientService = require('../services/clientService');
const subscriptionService = require('../services/subscriptionService');
const guildIntegrationService = require('../services/guildIntegrationService');
const adminService = require('../services/adminService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class ClientController {
  // Admin: Create client organization
  async createClient(req, res) {
    try {
      const {
        name,
        shortName,
        contactEmail,
        contactPhone,
        address,
        website,
        logoUrl,
        organizationType,
        foundationYear,
        description,
        demoRequestId,
      } = req.body;

      // Validate required fields
      if (!name || !shortName || !contactEmail) {
        return errorResponse(res, 'Name, short name, and contact email are required', 400);
      }

      const client = await clientService.createClient(
        {
          name,
          shortName,
          contactEmail,
          contactPhone,
          address,
          website,
          logoUrl,
          organizationType,
          foundationYear: foundationYear ? parseInt(foundationYear) : null,
          description,
          demoRequestId,
        },
        req.user?.id
      );

      logger.info('Client created', {
        id: client.id,
        name: client.name,
        createdBy: req.user?.id,
      });

      return successResponse(res, 'Client organization created successfully', client, 201);
    } catch (error) {
      logger.error('Failed to create client', { error: error.message });

      if (error.code === 'P2002') {
        return errorResponse(res, 'A client with this email already exists', 409);
      }

      return errorResponse(res, 'Failed to create client', 500);
    }
  }

  // Admin: Get all clients
  async getAllClients(req, res) {
    try {
      const { page, limit, status, search } = req.query;

      const result = await clientService.getAllClients({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        status,
        search,
      });

      return successResponse(res, 'Clients retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get clients', { error: error.message });
      return errorResponse(res, 'Failed to get clients', 500);
    }
  }

  // Admin: Get client by ID
  async getClientById(req, res) {
    try {
      const { id } = req.params;

      const client = await clientService.getClientById(id);

      return successResponse(res, 'Client retrieved successfully', client);
    } catch (error) {
      logger.error('Failed to get client', { error: error.message, id: req.params.id });

      if (error.message === 'Client not found') {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to get client', 500);
    }
  }

  // Admin: Update client
  async updateClient(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.guildTenantCode;
      delete updateData.guildOrgId;
      delete updateData.isGuildProvisioned;
      delete updateData.provisionedAt;

      const client = await clientService.updateClient(id, updateData);

      logger.info('Client updated', {
        id,
        updatedBy: req.user?.id,
      });

      return successResponse(res, 'Client updated successfully', client);
    } catch (error) {
      logger.error('Failed to update client', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to update client', 500);
    }
  }

  // Admin: Create client admin user
  async createClientAdmin(req, res) {
    try {
      const { id } = req.params;
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return errorResponse(res, 'Name, email, and password are required', 400);
      }

      const user = await clientService.createClientAdmin(id, { name, email, password });

      logger.info('Client admin created', {
        userId: user.id,
        clientId: id,
        createdBy: req.user?.id,
      });

      return successResponse(res, 'Client admin created successfully', user, 201);
    } catch (error) {
      logger.error('Failed to create client admin', { error: error.message, clientId: req.params.id });

      if (error.code === 'P2002') {
        return errorResponse(res, 'A user with this email already exists', 409);
      }

      return errorResponse(res, 'Failed to create client admin', 500);
    }
  }

  // Admin: Provision Guild tenant
  async provisionGuild(req, res) {
    try {
      const { id } = req.params;

      // Get client details
      const client = await clientService.getClientById(id);

      if (client.isGuildProvisioned) {
        return errorResponse(res, 'Guild tenant already provisioned', 400);
      }

      // Get active subscription
      const activeSubscription = client.subscriptions.find(
        (s) => ['TRIAL', 'ACTIVE'].includes(s.status)
      );

      if (!activeSubscription) {
        return errorResponse(res, 'No active subscription found. Please create a subscription first.', 400);
      }

      // Call Guild API to create organization
      const guildResult = await guildIntegrationService.createOrganization(client, activeSubscription);

      // Update client with Guild details
      const updatedClient = await clientService.updateGuildProvisioning(id, {
        tenantCode: guildResult.tenantCode,
        orgId: guildResult.orgId,
        adminEmail: guildResult.adminCredentials?.email,
      });

      // Create notification
      await adminService.createNotification(
        'GUILD_PROVISIONED',
        'Guild Tenant Provisioned',
        `Guild tenant has been provisioned for ${client.name}`,
        { clientId: id, tenantCode: guildResult.tenantCode }
      );

      logger.info('Guild provisioned', {
        clientId: id,
        tenantCode: guildResult.tenantCode,
        provisionedBy: req.user?.id,
      });

      return successResponse(res, 'Guild tenant provisioned successfully', {
        client: updatedClient,
        guildCredentials: guildResult.adminCredentials,
      });
    } catch (error) {
      logger.error('Failed to provision Guild', { error: error.message, clientId: req.params.id });
      return errorResponse(res, `Failed to provision Guild: ${error.message}`, 500);
    }
  }

  // Admin: Get Guild stats for client
  async getGuildStats(req, res) {
    try {
      const { id } = req.params;

      const client = await clientService.getClientById(id);

      if (!client.isGuildProvisioned || !client.guildOrgId) {
        return errorResponse(res, 'Guild tenant not provisioned for this client', 400);
      }

      const stats = await guildIntegrationService.getOrganizationStats(client.guildOrgId);

      return successResponse(res, 'Guild stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get Guild stats', { error: error.message, clientId: req.params.id });
      return errorResponse(res, 'Failed to get Guild stats', 500);
    }
  }

  // Admin: Get client stats
  async getClientStats(req, res) {
    try {
      const stats = await clientService.getClientStats();

      return successResponse(res, 'Client stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get client stats', { error: error.message });
      return errorResponse(res, 'Failed to get client stats', 500);
    }
  }
}

module.exports = new ClientController();
