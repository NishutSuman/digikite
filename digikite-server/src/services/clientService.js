const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

class ClientService {
  // Create a new client organization
  async createClient(data, createdByUserId) {
    try {
      // Start a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create client organization
        const client = await tx.clientOrganization.create({
          data: {
            name: data.name,
            shortName: data.shortName,
            contactEmail: data.contactEmail,
            contactPhone: data.contactPhone || null,
            address: data.address || null,
            website: data.website || null,
            logoUrl: data.logoUrl || null,
            organizationType: data.organizationType || null,
            foundationYear: data.foundationYear || null,
            description: data.description || null,
            status: 'PENDING',
          },
        });

        // If this came from a demo request, update it
        if (data.demoRequestId) {
          await tx.demoRequest.update({
            where: { id: data.demoRequestId },
            data: {
              status: 'CONVERTED',
              convertedToClientId: client.id,
              updatedAt: new Date(),
            },
          });
        }

        logger.info('Client organization created', { id: client.id, name: client.name });
        return client;
      });

      return result;
    } catch (error) {
      logger.error('Failed to create client', { error: error.message });
      throw error;
    }
  }

  // Get all clients
  async getAllClients(options = {}) {
    try {
      const { page = 1, limit = 10, status, search } = options;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { shortName: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [clients, total] = await Promise.all([
        prisma.clientOrganization.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            subscriptions: {
              where: { status: { in: ['TRIAL', 'ACTIVE', 'GRACE_PERIOD'] } },
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                plan: {
                  select: { name: true, code: true },
                },
              },
            },
            _count: {
              select: { adminUsers: true },
            },
          },
        }),
        prisma.clientOrganization.count({ where }),
      ]);

      return {
        clients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get clients', { error: error.message });
      throw error;
    }
  }

  // Get client by ID
  async getClientById(id) {
    try {
      const client = await prisma.clientOrganization.findUnique({
        where: { id },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            include: {
              plan: true,
            },
          },
          adminUsers: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true,
              createdAt: true,
            },
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
          demoRequest: true,
        },
      });

      if (!client) {
        throw new Error('Client not found');
      }

      return client;
    } catch (error) {
      logger.error('Failed to get client', { error: error.message, id });
      throw error;
    }
  }

  // Update client
  async updateClient(id, data) {
    try {
      const client = await prisma.clientOrganization.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      logger.info('Client updated', { id, name: client.name });
      return client;
    } catch (error) {
      logger.error('Failed to update client', { error: error.message, id });
      throw error;
    }
  }

  // Create user linked to client organization
  async createClientUser(clientId, userData) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      const user = await prisma.user.create({
        data: {
          email: userData.email,
          name: userData.name,
          password: hashedPassword,
          provider: 'EMAIL',
          emailVerified: true, // Admin created accounts are pre-verified
          role: 'USER',
          isActive: true,
          clientOrganizationId: clientId,
        },
      });

      logger.info('Client user created', { userId: user.id, clientId });

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      logger.error('Failed to create client user', { error: error.message, clientId });
      throw error;
    }
  }

  // Update client Guild provisioning status
  async updateGuildProvisioning(id, guildData) {
    try {
      const client = await prisma.clientOrganization.update({
        where: { id },
        data: {
          guildTenantCode: guildData.tenantCode,
          guildOrgId: guildData.orgId,
          isGuildProvisioned: true,
          provisionedAt: new Date(),
          guildAdminEmail: guildData.adminEmail,
          status: 'ACTIVE',
          updatedAt: new Date(),
        },
      });

      logger.info('Client Guild provisioning updated', { id, tenantCode: guildData.tenantCode });
      return client;
    } catch (error) {
      logger.error('Failed to update Guild provisioning', { error: error.message, id });
      throw error;
    }
  }

  // Get client stats
  async getClientStats() {
    try {
      const [total, pending, active, suspended, churned] = await Promise.all([
        prisma.clientOrganization.count(),
        prisma.clientOrganization.count({ where: { status: 'PENDING' } }),
        prisma.clientOrganization.count({ where: { status: 'ACTIVE' } }),
        prisma.clientOrganization.count({ where: { status: 'SUSPENDED' } }),
        prisma.clientOrganization.count({ where: { status: 'CHURNED' } }),
      ]);

      return {
        total,
        pending,
        active,
        suspended,
        churned,
      };
    } catch (error) {
      logger.error('Failed to get client stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = new ClientService();
