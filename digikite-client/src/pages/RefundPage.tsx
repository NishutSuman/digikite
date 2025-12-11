import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaUndo, FaCheckCircle, FaTimesCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

const RefundPage: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const refundTimeframes = [
    {
      title: "Free Trial Period",
      description: "Full refund available if cancelled within 14 days of initial sign-up for new customers.",
      color: "blue"
    },
    {
      title: "Software Subscriptions",
      description: "Refund requests must be submitted within 7 days of billing for technical issues preventing usage.",
      color: "green"
    },
    {
      title: "Implementation Services",
      description: "Custom implementation services are eligible for partial refund if cancelled before completion.",
      color: "purple"
    }
  ];

  const sections = [
    {
      title: "1. Our Commitment to Customer Satisfaction",
      content: "At DigiKite, we are committed to providing exceptional products and services. If you are not satisfied with your purchase, we offer refunds under specific conditions outlined in this policy."
    },
    {
      title: "2. Refund Eligibility",
      content: "Refunds may be requested under the following circumstances:",
      list: [
        "Technical issues that prevent normal use of our services",
        "Services not delivered as specified in the agreement",
        "Cancellation within the specified trial period",
        "Billing errors or unauthorized charges"
      ]
    },
    {
      title: "4. Non-Refundable Items",
      content: "The following items are generally not eligible for refunds:",
      list: [
        "Services that have been fully delivered and accepted",
        "Custom development work that has been completed",
        "Training services that have been completed",
        "Third-party licensing fees",
        "Services used beyond the trial period without reported issues"
      ]
    },
    {
      title: "5. Refund Process",
      content: "To request a refund, please follow these steps:",
      orderedList: [
        "Contact our customer support team at support@digikite.com",
        "Provide your account details and reason for the refund request",
        "Our team will review your request within 3-5 business days",
        "If approved, refunds will be processed within 7-10 business days",
        "Refunds will be credited to the original payment method"
      ]
    },
    {
      title: "6. Partial Refunds",
      content: "In some cases, we may offer partial refunds based on:",
      list: [
        "Portion of services used or delivered",
        "Time elapsed since service activation",
        "Resources allocated to your project",
        "Third-party costs that cannot be recovered"
      ]
    },
    {
      title: "7. Subscription Cancellations",
      content: "For ongoing subscription services:",
      list: [
        "Monthly subscriptions can be cancelled at any time",
        "Annual subscriptions may be eligible for prorated refunds",
        "Cancellation takes effect at the end of the current billing period",
        "No refund for the current billing period unless technical issues prevent usage"
      ]
    },
    {
      title: "8. Technical Issue Refunds",
      content: "If you experience technical issues that prevent normal use of our services:",
      list: [
        "Contact support immediately to troubleshoot the issue",
        "Allow our technical team 48-72 hours to resolve critical issues",
        "If unresolvable, you may be eligible for a full or partial refund",
        "Service credits may be offered as an alternative to refunds"
      ]
    },
    {
      title: "9. Enterprise and Custom Solutions",
      content: "For enterprise clients and custom solutions, refund terms may vary based on the specific service agreement. Please refer to your contract or contact your account manager for details."
    },
    {
      title: "10. Dispute Resolution",
      content: "If you disagree with a refund decision, you may:",
      list: [
        "Request escalation to a senior manager",
        "Provide additional documentation to support your case",
        "Seek mediation through our customer relations team"
      ]
    },
    {
      title: "11. Changes to This Policy",
      content: "We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of any changes."
    }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'from-green-500/20 to-green-500/5', text: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20' },
  };

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 lg:px-8 py-20">
          {/* Header */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-12"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full mb-6">
              <FaUndo className="text-green-400" />
              <span className="text-sm font-medium text-green-300">Fair & Transparent</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Refund <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Policy</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-gray-400">
              Last updated: December 11, 2025
            </motion.p>
          </motion.div>

          {/* Refund Timeframes Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid md:grid-cols-3 gap-4 mb-12"
          >
            {refundTimeframes.map((timeframe, index) => {
              const colors = colorClasses[timeframe.color];
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} p-6`}
                >
                  <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>{timeframe.title}</h3>
                  <p className="text-gray-400 text-sm">{timeframe.description}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Content Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-3xl border border-white/10 p-8 lg:p-12"
          >
            {/* Introduction */}
            <motion.div variants={itemVariants} className="mb-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/20 rounded-xl flex items-center justify-center">
                  <FaCheckCircle className="text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Customer Satisfaction Guarantee</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                We want you to be completely satisfied with our services. If for any reason you're not happy,
                we're here to help. Review our refund policy below or contact our support team for assistance.
              </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div key={index} variants={itemVariants} className="border-b border-white/5 pb-8 last:border-b-0">
                  <h2 className="text-xl font-semibold text-white mb-4">{section.title}</h2>
                  <p className="text-gray-400 leading-relaxed mb-4">{section.content}</p>
                  {section.list && (
                    <ul className="space-y-2">
                      {section.list.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400">
                          <span className="text-green-400 mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.orderedList && (
                    <ol className="space-y-2">
                      {section.orderedList.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-400">
                          <span className="text-green-400 font-semibold min-w-[24px]">{i + 1}.</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </motion.div>
              ))}

              {/* Contact Section */}
              <motion.div variants={itemVariants} className="pt-4">
                <h2 className="text-xl font-semibold text-white mb-4">12. Contact Information</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  For refund requests or questions about this policy, please contact us:
                </p>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
                  <p className="text-white font-semibold mb-4">DigiKite Customer Support</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaEnvelope className="text-green-400" />
                      <span>support@digikite.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaPhone className="text-green-400" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaClock className="text-green-400" />
                      <span>Mon-Fri, 9 AM - 6 PM IST</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaMapMarkerAlt className="text-green-400" />
                      <span>Bangalore, Karnataka, India - 560001</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPage;
