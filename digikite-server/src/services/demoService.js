const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class DemoService {
  // Create a new demo request (public)
  async createDemoRequest(data) {
    try {
      const demoRequest = await prisma.demoRequest.create({
        data: {
          organizationName: data.organizationName,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone || null,
          organizationType: data.organizationType,
          estimatedMembers: data.estimatedMembers || null,
          website: data.website || null,
          message: data.message || null,
          preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
          preferredTime: data.preferredTime || null,
          status: 'NEW',
        },
      });

      logger.info('Demo request created', { id: demoRequest.id, email: data.contactEmail });
      return demoRequest;
    } catch (error) {
      logger.error('Failed to create demo request', { error: error.message });
      throw error;
    }
  }

  // Get all demo requests (admin)
  async getAllDemoRequests(options = {}) {
    try {
      const { page = 1, limit = 10, status, search } = options;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { organizationName: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [demoRequests, total] = await Promise.all([
        prisma.demoRequest.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
            convertedToClient: {
              select: { id: true, name: true },
            },
          },
        }),
        prisma.demoRequest.count({ where }),
      ]);

      return {
        demoRequests,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get demo requests', { error: error.message });
      throw error;
    }
  }

  // Get demo request by ID
  async getDemoRequestById(id) {
    try {
      const demoRequest = await prisma.demoRequest.findUnique({
        where: { id },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          convertedToClient: true,
        },
      });

      if (!demoRequest) {
        throw new Error('Demo request not found');
      }

      return demoRequest;
    } catch (error) {
      logger.error('Failed to get demo request', { error: error.message, id });
      throw error;
    }
  }

  // Update demo request
  async updateDemoRequest(id, data) {
    try {
      const demoRequest = await prisma.demoRequest.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info('Demo request updated', { id, status: demoRequest.status });
      return demoRequest;
    } catch (error) {
      logger.error('Failed to update demo request', { error: error.message, id });
      throw error;
    }
  }

  // Schedule demo
  async scheduleDemo(id, scheduledAt, assignedToId) {
    try {
      const demoRequest = await prisma.demoRequest.update({
        where: { id },
        data: {
          status: 'DEMO_SCHEDULED',
          demoScheduledAt: new Date(scheduledAt),
          assignedToId: assignedToId || null,
          updatedAt: new Date(),
        },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      logger.info('Demo scheduled', { id, scheduledAt });
      return demoRequest;
    } catch (error) {
      logger.error('Failed to schedule demo', { error: error.message, id });
      throw error;
    }
  }

  // Complete demo
  async completeDemo(id, outcome) {
    try {
      const demoRequest = await prisma.demoRequest.update({
        where: { id },
        data: {
          status: 'DEMO_COMPLETED',
          demoCompletedAt: new Date(),
          demoOutcome: outcome,
          updatedAt: new Date(),
        },
      });

      logger.info('Demo completed', { id, outcome });
      return demoRequest;
    } catch (error) {
      logger.error('Failed to complete demo', { error: error.message, id });
      throw error;
    }
  }

  // Get demo request stats
  async getDemoStats() {
    try {
      const [total, newCount, scheduledCount, completedCount, convertedCount, lostCount] = await Promise.all([
        prisma.demoRequest.count(),
        prisma.demoRequest.count({ where: { status: 'NEW' } }),
        prisma.demoRequest.count({ where: { status: 'DEMO_SCHEDULED' } }),
        prisma.demoRequest.count({ where: { status: 'DEMO_COMPLETED' } }),
        prisma.demoRequest.count({ where: { status: 'CONVERTED' } }),
        prisma.demoRequest.count({ where: { status: 'LOST' } }),
      ]);

      return {
        total,
        new: newCount,
        scheduled: scheduledCount,
        completed: completedCount,
        converted: convertedCount,
        lost: lostCount,
        conversionRate: total > 0 ? ((convertedCount / total) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      logger.error('Failed to get demo stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = new DemoService();
