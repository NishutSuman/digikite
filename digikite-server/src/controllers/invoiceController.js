const invoiceService = require('../services/invoiceService');
const { logger } = require('../utils/logger');
const { successResponse, errorResponse } = require('../utils/response');

class InvoiceController {
  // Create invoice for subscription
  async createInvoice(req, res) {
    try {
      const { subscriptionId, taxRate, periodStart, periodEnd } = req.body;

      if (!subscriptionId) {
        return errorResponse(res, 'Subscription ID is required', 400);
      }

      const invoice = await invoiceService.createInvoice(subscriptionId, {
        taxRate,
        periodStart: periodStart ? new Date(periodStart) : undefined,
        periodEnd: periodEnd ? new Date(periodEnd) : undefined,
      });

      logger.info('Invoice created', {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        createdBy: req.user?.id,
      });

      return successResponse(res, 'Invoice created successfully', invoice, 201);
    } catch (error) {
      logger.error('Failed to create invoice', { error: error.message });
      return errorResponse(res, 'Failed to create invoice', 500);
    }
  }

  // Get all invoices
  async getAllInvoices(req, res) {
    try {
      const { page, limit, status, clientId } = req.query;

      const result = await invoiceService.getAllInvoices({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        status,
        clientId,
      });

      return successResponse(res, 'Invoices retrieved successfully', result);
    } catch (error) {
      logger.error('Failed to get invoices', { error: error.message });
      return errorResponse(res, 'Failed to get invoices', 500);
    }
  }

  // Get invoice by ID
  async getInvoiceById(req, res) {
    try {
      const { id } = req.params;

      const invoice = await invoiceService.getInvoiceById(id);

      return successResponse(res, 'Invoice retrieved successfully', invoice);
    } catch (error) {
      logger.error('Failed to get invoice', { error: error.message, id: req.params.id });

      if (error.message === 'Invoice not found') {
        return errorResponse(res, error.message, 404);
      }

      return errorResponse(res, 'Failed to get invoice', 500);
    }
  }

  // Send invoice
  async sendInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await invoiceService.sendInvoice(id);

      logger.info('Invoice sent', {
        id,
        sentBy: req.user?.id,
      });

      return successResponse(res, 'Invoice sent successfully', invoice);
    } catch (error) {
      logger.error('Failed to send invoice', { error: error.message, id: req.params.id });

      if (error.message === 'Only draft invoices can be sent') {
        return errorResponse(res, error.message, 400);
      }

      return errorResponse(res, 'Failed to send invoice', 500);
    }
  }

  // Cancel invoice
  async cancelInvoice(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const invoice = await invoiceService.cancelInvoice(id, reason);

      logger.info('Invoice cancelled', {
        id,
        cancelledBy: req.user?.id,
        reason,
      });

      return successResponse(res, 'Invoice cancelled successfully', invoice);
    } catch (error) {
      logger.error('Failed to cancel invoice', { error: error.message, id: req.params.id });

      if (error.message === 'Cannot cancel a paid invoice') {
        return errorResponse(res, error.message, 400);
      }

      return errorResponse(res, 'Failed to cancel invoice', 500);
    }
  }

  // Get invoice stats
  async getInvoiceStats(req, res) {
    try {
      const stats = await invoiceService.getInvoiceStats();

      return successResponse(res, 'Invoice stats retrieved successfully', stats);
    } catch (error) {
      logger.error('Failed to get invoice stats', { error: error.message });
      return errorResponse(res, 'Failed to get invoice stats', 500);
    }
  }

  // Download invoice PDF
  async downloadInvoicePdf(req, res) {
    try {
      const { id } = req.params;

      const invoice = await invoiceService.getInvoiceById(id);

      if (invoice.pdfUrl) {
        return res.redirect(invoice.pdfUrl);
      }

      // TODO: Generate PDF on the fly if not available
      return errorResponse(res, 'Invoice PDF not available', 404);
    } catch (error) {
      logger.error('Failed to download invoice PDF', { error: error.message, id: req.params.id });
      return errorResponse(res, 'Failed to download invoice PDF', 500);
    }
  }
}

module.exports = new InvoiceController();
