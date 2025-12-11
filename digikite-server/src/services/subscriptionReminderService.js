const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');
const emailService = require('./emailService');

const prisma = new PrismaClient();

class SubscriptionReminderService {
  // Send reminders for trial subscriptions about to expire
  async sendTrialReminders() {
    try {
      const today = new Date();

      // Find trial subscriptions expiring in next 7, 3, and 1 days
      const reminderDays = [7, 3, 1];
      let totalSent = 0;

      for (const days of reminderDays) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + days);

        // Get start and end of the target day
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Find trial subscriptions expiring on this day that haven't received this reminder
        const subscriptions = await prisma.subscription.findMany({
          where: {
            status: 'TRIAL',
            trialEndsAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            // Only send if we haven't sent a reminder for this period
            OR: [
              { renewalReminderSent: false },
              { nextRenewalReminder: { lt: today } },
            ],
          },
          include: {
            clientOrganization: true,
            plan: true,
          },
        });

        for (const subscription of subscriptions) {
          // Find admin user for this client
          const adminUser = await prisma.user.findFirst({
            where: {
              clientOrganizationId: subscription.clientOrganizationId,
            },
          });

          if (!adminUser) {
            logger.warn('No admin user found for subscription reminder', {
              subscriptionId: subscription.id,
              clientId: subscription.clientOrganizationId,
            });
            continue;
          }

          // Send reminder email
          const result = await emailService.sendTrialExpirationReminder({
            email: adminUser.email,
            name: adminUser.name,
            organizationName: subscription.clientOrganization.name,
            planName: subscription.plan.name,
            daysRemaining: days,
            trialEndsAt: subscription.trialEndsAt,
            subscriptionId: subscription.id,
          });

          if (result.success) {
            // Update subscription to mark reminder sent
            await prisma.subscription.update({
              where: { id: subscription.id },
              data: {
                renewalReminderSent: true,
                nextRenewalReminder: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
              },
            });
            totalSent++;
          }
        }
      }

      logger.info('Trial reminders sent', { totalSent });
      return { success: true, totalSent };
    } catch (error) {
      logger.error('Failed to send trial reminders', { error: error.message });
      throw error;
    }
  }

  // Send reminders for active subscriptions about to expire
  async sendSubscriptionReminders() {
    try {
      const today = new Date();

      // Find subscriptions expiring in next 30, 14, 7, and 3 days
      const reminderDays = [30, 14, 7, 3];
      let totalSent = 0;

      for (const days of reminderDays) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + days);

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const subscriptions = await prisma.subscription.findMany({
          where: {
            status: 'ACTIVE',
            autoRenew: false, // Only remind if not auto-renewing
            endDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          include: {
            clientOrganization: true,
            plan: true,
          },
        });

        for (const subscription of subscriptions) {
          const adminUser = await prisma.user.findFirst({
            where: {
              clientOrganizationId: subscription.clientOrganizationId,
            },
          });

          if (!adminUser) continue;

          const result = await emailService.sendSubscriptionExpirationReminder({
            email: adminUser.email,
            name: adminUser.name,
            organizationName: subscription.clientOrganization.name,
            planName: subscription.plan.name,
            daysRemaining: days,
            endDate: subscription.endDate,
            amount: subscription.amount,
            currency: subscription.currency,
            subscriptionId: subscription.id,
          });

          if (result.success) {
            totalSent++;
          }
        }
      }

      logger.info('Subscription reminders sent', { totalSent });
      return { success: true, totalSent };
    } catch (error) {
      logger.error('Failed to send subscription reminders', { error: error.message });
      throw error;
    }
  }

  // Main method to run all reminders
  async runAllReminders() {
    logger.info('Starting subscription reminder job...');

    const [trialResult, subscriptionResult] = await Promise.allSettled([
      this.sendTrialReminders(),
      this.sendSubscriptionReminders(),
    ]);

    const summary = {
      trialReminders: trialResult.status === 'fulfilled' ? trialResult.value : { error: trialResult.reason?.message },
      subscriptionReminders: subscriptionResult.status === 'fulfilled' ? subscriptionResult.value : { error: subscriptionResult.reason?.message },
    };

    logger.info('Subscription reminder job completed', summary);
    return summary;
  }
}

module.exports = new SubscriptionReminderService();
