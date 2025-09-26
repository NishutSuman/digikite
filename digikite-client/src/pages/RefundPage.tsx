import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';

const RefundPage: React.FC = () => {
  return (
    <Layout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl shadow-xl p-8 lg:p-12"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Refund <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Policy</span>
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: September 26, 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Our Commitment to Customer Satisfaction</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  At DigiKite, we are committed to providing exceptional products and services. If you are not satisfied
                  with your purchase, we offer refunds under specific conditions outlined in this policy.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Refund Eligibility</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Refunds may be requested under the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Technical issues that prevent normal use of our services</li>
                  <li>Services not delivered as specified in the agreement</li>
                  <li>Cancellation within the specified trial period</li>
                  <li>Billing errors or unauthorized charges</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Timeframes</h2>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Free Trial Period</h3>
                    <p className="text-blue-700">
                      Full refund available if cancelled within 30 days of initial sign-up for new customers.
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-green-900 mb-2">Software Services</h3>
                    <p className="text-green-700">
                      Refund requests must be submitted within 14 days of service activation for technical issues.
                    </p>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-purple-900 mb-2">Implementation Services</h3>
                    <p className="text-purple-700">
                      Custom implementation services are eligible for partial refund if cancelled before completion.
                    </p>
                  </div>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Non-Refundable Items</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The following items are generally not eligible for refunds:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Services that have been fully delivered and accepted</li>
                  <li>Custom development work that has been completed</li>
                  <li>Training services that have been completed</li>
                  <li>Third-party licensing fees</li>
                  <li>Services used beyond the trial period without reported issues</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Process</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To request a refund, please follow these steps:
                </p>
                <ol className="list-decimal pl-6 text-gray-600 mb-4 space-y-2">
                  <li>Contact our customer support team at <strong>support@digikite.com</strong></li>
                  <li>Provide your account details and reason for the refund request</li>
                  <li>Our team will review your request within 3-5 business days</li>
                  <li>If approved, refunds will be processed within 7-10 business days</li>
                  <li>Refunds will be credited to the original payment method</li>
                </ol>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Partial Refunds</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  In some cases, we may offer partial refunds based on:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Portion of services used or delivered</li>
                  <li>Time elapsed since service activation</li>
                  <li>Resources allocated to your project</li>
                  <li>Third-party costs that cannot be recovered</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Subscription Cancellations</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For ongoing subscription services:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Monthly subscriptions can be cancelled at any time</li>
                  <li>Annual subscriptions may be eligible for prorated refunds</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                  <li>No refund for the current billing period unless technical issues prevent usage</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Technical Issue Refunds</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you experience technical issues that prevent normal use of our services:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Contact support immediately to troubleshoot the issue</li>
                  <li>Allow our technical team 48-72 hours to resolve critical issues</li>
                  <li>If unresolvable, you may be eligible for a full or partial refund</li>
                  <li>Service credits may be offered as an alternative to refunds</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Enterprise and Custom Solutions</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For enterprise clients and custom solutions, refund terms may vary based on the specific
                  service agreement. Please refer to your contract or contact your account manager for details.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Dispute Resolution</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you disagree with a refund decision, you may:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Request escalation to a senior manager</li>
                  <li>Provide additional documentation to support your case</li>
                  <li>Seek mediation through our customer relations team</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We reserve the right to modify this refund policy at any time. Changes will be effective immediately
                  upon posting on our website. Continued use of our services constitutes acceptance of any changes.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For refund requests or questions about this policy, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 font-medium">DigiKite Customer Support</p>
                  <p className="text-gray-600">Email: support@digikite.com</p>
                  <p className="text-gray-600">Phone: +91 98765 43210</p>
                  <p className="text-gray-600">Support Hours: Mon-Fri, 9 AM - 6 PM IST</p>
                  <p className="text-gray-600">Address: 123 Innovation Hub, Tech City, India - 110001</p>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPage;