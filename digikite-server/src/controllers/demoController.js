const demoService = require('../services/demoService');
const adminService = require('../services/adminService');
const emailService = require('../services/emailService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class DemoController {
  // Public: Submit demo request
  async submitDemoRequest(req, res) {
    try {
      const {
        organizationName,
        contactName,
        contactEmail,
        contactPhone,
        organizationType,
        estimatedMembers,
        website,
        message,
        preferredDate,
        preferredTime,
      } = req.body;

      // Validate required fields
      if (!organizationName || !contactName || !contactEmail || !organizationType) {
        return errorResponse(res, 'Missing required fields', 400);
      }

      const demoRequest = await demoService.createDemoRequest({
        organizationName,
        contactName,
        contactEmail,
        contactPhone,
        organizationType,
        estimatedMembers: estimatedMembers ? parseInt(estimatedMembers) : null,
        website,
        message,
        preferredDate,
        preferredTime,
      });

      // Create admin notification
      await adminService.createNotification(
        'DEMO_REQUEST',
        'New Demo Request',
        `${organizationName} has requested a demo. Contact: ${contactName} (${contactEmail})`,
        { demoRequestId: demoRequest.id }
      );

      // Send email notification to admin
      await emailService.sendDemoRequestNotificationToAdmin({
        organizationName,
        contactName,
        contactEmail,
        contactPhone,
        organizationType,
        estimatedMembers: estimatedMembers ? parseInt(estimatedMembers) : null,
        message,
        preferredDate,
        preferredTime,
        demoRequestId: demoRequest.id,
      });

      logger.info('Demo request submitted', {
        id: demoRequest.id,
        email: contactEmail,
        ip: req.ip,
      });

      return successResponse(res, 'Demo request submitted successfully', {
        id: demoRequest.id,
        message: 'Thank you for your interest! Our team will contact you shortly.',
      }, 201);
    } catch (error) {
      logger.error('Failed to submit demo request', {
        error: error.message,
        ip: req.ip,
      });
      return errorResponse(res, 'Failed to submit demo request', 500);
    }
  }

  // Admin: Get all demo requests
  async getAllDemoRequests(req, res) {
    try {
      const { page, limit, status, search } = req.query;

      const result = await demoService.getAllDemoRequests({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        status,
        search,
      });

      return successResponse(res, 'Demo requests retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get demo requests', { error: error.message });
      return errorResponse(res, 'Failed to get demo requests', 500);
    }
  }

  // Admin: Get demo request by ID
  async getDemoRequestById(req, res) {
    try {
      const { id } = req.params;

      const demoRequest = await demoService.getDemoRequestById(id);

      return successResponse(res, 'Demo request retrieved successfully', demoRequest);
    } catch (error) {
      logger.error('Failed to get demo request', { error: error.message, id: req.params.id });

      if (error.message === 'Demo request not found') {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to get demo request', 500);
    }
  }

  // Admin: Update demo request
  async updateDemoRequest(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const demoRequest = await demoService.updateDemoRequest(id, updateData);

      logger.info('Demo request updated', {
        id,
        updatedBy: req.user?.id,
        status: demoRequest.status,
      });

      return successResponse(res, 'Demo request updated successfully', demoRequest);
    } catch (error) {
      logger.error('Failed to update demo request', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to update demo request', 500);
    }
  }

  // Admin: Schedule demo
  async scheduleDemo(req, res) {
    try {
      const { id } = req.params;
      const { scheduledAt, assignedToId } = req.body;

      if (!scheduledAt) {
        return errorResponse(res, 'Scheduled date is required', 400);
      }

      const demoRequest = await demoService.scheduleDemo(id, scheduledAt, assignedToId);

      logger.info('Demo scheduled', {
        id,
        scheduledAt,
        scheduledBy: req.user?.id,
      });

      return successResponse(res, 'Demo scheduled successfully', demoRequest);
    } catch (error) {
      logger.error('Failed to schedule demo', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to schedule demo', 500);
    }
  }

  // Admin: Complete demo
  async completeDemo(req, res) {
    try {
      const { id } = req.params;
      const { outcome, notes } = req.body;

      if (!outcome) {
        return errorResponse(res, 'Demo outcome is required', 400);
      }

      const demoRequest = await demoService.completeDemo(id, outcome);

      if (notes) {
        await demoService.updateDemoRequest(id, { notes });
      }

      logger.info('Demo completed', {
        id,
        outcome,
        completedBy: req.user?.id,
      });

      return successResponse(res, 'Demo completed successfully', demoRequest);
    } catch (error) {
      logger.error('Failed to complete demo', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to complete demo', 500);
    }
  }

  // Admin: Get demo stats
  async getDemoStats(req, res) {
    try {
      const stats = await demoService.getDemoStats();

      return successResponse(res, 'Demo stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get demo stats', { error: error.message });
      return errorResponse(res, 'Failed to get demo stats', 500);
    }
  }
}

module.exports = new DemoController();
