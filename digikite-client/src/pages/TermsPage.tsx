import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';

const TermsPage: React.FC = () => {
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
                Terms and <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Conditions</span>
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: September 26, 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  By accessing and using DigiKite's services, including but not limited to our Guild Platform and e-Lib System,
                  you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms,
                  you may not use our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  DigiKite provides digital solutions for communities and educational institutions, including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Guild Platform - Community management software</li>
                  <li>e-Lib System - Digital library management solution</li>
                  <li>Custom software development services</li>
                  <li>Implementation and training services</li>
                  <li>Technical support and maintenance</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To access certain features of our services, you may be required to create an account. You are responsible for:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Maintaining the confidentiality of your account credentials</li>
                  <li>All activities that occur under your account</li>
                  <li>Providing accurate and up-to-date information</li>
                  <li>Notifying us immediately of any unauthorized use</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our services.
                  Prohibited activities include but are not limited to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Transmitting harmful or malicious code</li>
                  <li>Attempting to gain unauthorized access to our systems</li>
                  <li>Interfering with other users' use of the services</li>
                  <li>Using the services for commercial purposes without permission</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  All content, features, and functionality of our services are owned by DigiKite and are protected by
                  intellectual property laws. You may not reproduce, distribute, or create derivative works without
                  our express written permission.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For paid services:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Payment is due as specified in your service agreement</li>
                  <li>All fees are non-refundable unless otherwise specified</li>
                  <li>We reserve the right to suspend services for non-payment</li>
                  <li>Price changes will be communicated with 30 days notice</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Protection and Privacy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Your privacy is important to us. Our collection and use of personal information is governed by our
                  Privacy Policy, which is incorporated into these terms by reference.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  While we strive to provide continuous service availability, we do not guarantee uninterrupted access.
                  We reserve the right to modify, suspend, or discontinue services with reasonable notice.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To the fullest extent permitted by law, DigiKite shall not be liable for any indirect, incidental,
                  special, or consequential damages arising from your use of our services.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Either party may terminate the service agreement with appropriate notice as specified in the service contract.
                  Upon termination, your right to use the services will cease immediately.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction
                  of courts in New Delhi, India.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We reserve the right to update these terms at any time. Continued use of our services after changes
                  are posted constitutes acceptance of the new terms.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  For questions about these Terms and Conditions, please contact us at:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 font-medium">DigiKite Technologies</p>
                  <p className="text-gray-600">Email: legal@digikite.com</p>
                  <p className="text-gray-600">Phone: +91 98765 43210</p>
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

export default TermsPage;