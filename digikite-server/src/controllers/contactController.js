const { PrismaClient } = require('@prisma/client');
const { logger } = require('../utils/logger');
const emailService = require('../services/emailService');
const adminService = require('../services/adminService');

const prisma = new PrismaClient();

// Map frontend subject values to enum values
const subjectMap = {
  demo: 'DEMO',
  pricing: 'PRICING',
  support: 'SUPPORT',
  partnership: 'PARTNERSHIP',
  other: 'OTHER',
};

// Submit contact form (public endpoint)
const submitContactForm = async (req, res) => {
  try {
    const { name, email, organization, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required',
      });
    }

    // Map subject to enum
    const subjectEnum = subjectMap[subject] || 'OTHER';

    // Create contact submission
    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        organization: organization || null,
        subject: subjectEnum,
        message,
      },
    });

    // Send confirmation email to the submitter
    await emailService.sendContactConfirmationEmail({
      email,
      name,
      subject: subjectEnum,
    });

    // Send notification email to admin
    await emailService.sendContactNotificationToAdmin({
      name,
      email,
      organization,
      subject: subjectEnum,
      message,
      submissionId: submission.id,
    });

    // Create admin notification
    await adminService.createNotification(
      'CONTACT_SUBMISSION',
      `New Contact: ${name}`,
      `New ${subjectEnum.toLowerCase()} inquiry from ${name} (${email})`,
      { submissionId: submission.id, email, organization }
    );

    logger.info('Contact form submitted successfully', {
      submissionId: submission.id,
      email,
      subject: subjectEnum,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you shortly.',
      data: {
        id: submission.id,
      },
    });
  } catch (error) {
    logger.error('Failed to submit contact form', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.',
    });
  }
};

// Get all contact submissions (admin only)
const getContactSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.contactSubmission.count({ where }),
    ]);

    res.json({
      success: true,
      message: 'Contact submissions retrieved successfully',
      data: {
        submissions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    logger.error('Failed to get contact submissions', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact submissions',
    });
  }
};

// Update contact submission status (admin only)
const updateContactSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'RESOLVED' || status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    const submission = await prisma.contactSubmission.update({
      where: { id },
      data: updateData,
    });

    logger.info('Contact submission updated', { id, status });

    res.json({
      success: true,
      message: 'Contact submission updated successfully',
      data: submission,
    });
  } catch (error) {
    logger.error('Failed to update contact submission', { error: error.message, id: req.params.id });
    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission',
    });
  }
};

module.exports = {
  submitContactForm,
  getContactSubmissions,
  updateContactSubmission,
};
