const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

class InvoiceService {
  // Generate invoice number
  generateInvoiceNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `DK-${year}${month}-${random}`;
  }

  // Create invoice for subscription
  async createInvoice(subscriptionId, options = {}) {
    try {
      const subscription = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: {
          plan: true,
          clientOrganization: true,
        },
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const subtotal = subscription.amount;
      const taxRate = options.taxRate || 18; // Default GST 18%
      const taxAmount = (subtotal * taxRate) / 100;
      const total = subtotal + taxAmount;

      // Calculate period
      const periodStart = options.periodStart || subscription.startDate;
      let periodEnd = options.periodEnd || subscription.endDate;

      // Due date: 15 days from creation
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const lineItems = [
        {
          description: `${subscription.plan.name} Plan - ${subscription.billingCycle} Subscription`,
          quantity: 1,
          unitPrice: subscription.amount,
          amount: subscription.amount,
        },
      ];

      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber: this.generateInvoiceNumber(),
          clientOrganizationId: subscription.clientOrganizationId,
          subscriptionId: subscription.id,
          subtotal,
          taxRate,
          taxAmount,
          total,
          currency: subscription.currency,
          description: `Subscription invoice for ${subscription.plan.name} Plan`,
          lineItems,
          periodStart,
          periodEnd,
          status: 'DRAFT',
          dueDate,
        },
        include: {
          clientOrganization: {
            select: { id: true, name: true, contactEmail: true },
          },
          subscription: {
            include: { plan: true },
          },
        },
      });

      logger.info('Invoice created', {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        subscriptionId,
      });

      return invoice;
    } catch (error) {
      logger.error('Failed to create invoice', { error: error.message, subscriptionId });
      throw error;
    }
  }

  // Get all invoices
  async getAllInvoices(options = {}) {
    try {
      const { page = 1, limit = 10, status, clientId } = options;
      const skip = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (clientId) where.clientOrganizationId = clientId;

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            clientOrganization: {
              select: { id: true, name: true, contactEmail: true },
            },
            subscription: {
              select: {
                id: true,
                status: true,
                plan: { select: { name: true } },
              },
            },
          },
        }),
        prisma.invoice.count({ where }),
      ]);

      return {
        invoices,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Failed to get invoices', { error: error.message });
      throw error;
    }
  }

  // Get invoice by ID
  async getInvoiceById(id) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          clientOrganization: true,
          subscription: {
            include: { plan: true },
          },
          payment: true,
        },
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return invoice;
    } catch (error) {
      logger.error('Failed to get invoice', { error: error.message, id });
      throw error;
    }
  }

  // Update invoice status
  async updateInvoiceStatus(id, status) {
    try {
      const invoice = await prisma.invoice.update({
        where: { id },
        data: {
          status,
          paidAt: status === 'PAID' ? new Date() : undefined,
          updatedAt: new Date(),
        },
      });

      logger.info('Invoice status updated', { id, status });

      return invoice;
    } catch (error) {
      logger.error('Failed to update invoice status', { error: error.message, id });
      throw error;
    }
  }

  // Send invoice (update status to SENT)
  async sendInvoice(id) {
    try {
      const invoice = await this.getInvoiceById(id);

      if (invoice.status !== 'DRAFT') {
        throw new Error('Only draft invoices can be sent');
      }

      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: 'SENT',
          updatedAt: new Date(),
        },
      });

      // TODO: Send email notification to client

      logger.info('Invoice sent', { id, invoiceNumber: invoice.invoiceNumber });

      return updatedInvoice;
    } catch (error) {
      logger.error('Failed to send invoice', { error: error.message, id });
      throw error;
    }
  }

  // Check and mark overdue invoices
  async markOverdueInvoices() {
    try {
      const now = new Date();

      const result = await prisma.invoice.updateMany({
        where: {
          status: 'SENT',
          dueDate: { lt: now },
        },
        data: {
          status: 'OVERDUE',
          updatedAt: now,
        },
      });

      if (result.count > 0) {
        logger.info('Invoices marked as overdue', { count: result.count });
      }

      return result;
    } catch (error) {
      logger.error('Failed to mark overdue invoices', { error: error.message });
      throw error;
    }
  }

  // Get invoice stats
  async getInvoiceStats() {
    try {
      const [total, draft, sent, paid, overdue, cancelled, totalRevenue] = await Promise.all([
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: 'DRAFT' } }),
        prisma.invoice.count({ where: { status: 'SENT' } }),
        prisma.invoice.count({ where: { status: 'PAID' } }),
        prisma.invoice.count({ where: { status: 'OVERDUE' } }),
        prisma.invoice.count({ where: { status: 'CANCELLED' } }),
        prisma.invoice.aggregate({
          where: { status: 'PAID' },
          _sum: { total: true },
        }),
      ]);

      return {
        total,
        draft,
        sent,
        paid,
        overdue,
        cancelled,
        totalRevenue: totalRevenue._sum.total || 0,
      };
    } catch (error) {
      logger.error('Failed to get invoice stats', { error: error.message });
      throw error;
    }
  }

  // Cancel invoice
  async cancelInvoice(id, reason) {
    try {
      const invoice = await this.getInvoiceById(id);

      if (invoice.status === 'PAID') {
        throw new Error('Cannot cancel a paid invoice');
      }

      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: 'CANCELLED',
          description: `${invoice.description || ''} | Cancelled: ${reason || 'No reason provided'}`,
          updatedAt: new Date(),
        },
      });

      logger.info('Invoice cancelled', { id, reason });

      return updatedInvoice;
    } catch (error) {
      logger.error('Failed to cancel invoice', { error: error.message, id });
      throw error;
    }
  }
}

module.exports = new InvoiceService();
