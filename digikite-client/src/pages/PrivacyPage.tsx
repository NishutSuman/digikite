import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';

const PrivacyPage: React.FC = () => {
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
                Privacy <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Policy</span>
              </h1>
              <p className="text-lg text-gray-600">
                Last updated: September 26, 2025
              </p>
            </div>

            <div className="prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.
                  This may include:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Personal information (name, email address, phone number)</li>
                  <li>Account credentials and preferences</li>
                  <li>Usage data and activity logs</li>
                  <li>Communication records and support tickets</li>
                  <li>Payment information (processed securely by third-party providers)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and customer service requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Personalize and improve your experience</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing and Disclosure</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>With your consent or at your direction</li>
                  <li>To service providers who assist in our operations</li>
                  <li>To comply with legal obligations or protect our rights</li>
                  <li>In connection with a business transaction (merger, acquisition, etc.)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and audits</li>
                  <li>Access controls and authentication measures</li>
                  <li>Employee training on data protection</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes
                  outlined in this privacy policy, unless a longer retention period is required or permitted by law.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights and Choices</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-4">
                  <li>Access and review your personal information</li>
                  <li>Correct or update inaccurate information</li>
                  <li>Delete your personal information (subject to certain limitations)</li>
                  <li>Object to or restrict processing of your information</li>
                  <li>Data portability for information you provided</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We use cookies and similar tracking technologies to collect and use personal information about you.
                  You can control cookies through your browser settings, though disabling cookies may affect functionality.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Services</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our services may contain links to third-party websites or integrate with third-party services.
                  This privacy policy does not apply to third-party services, and we encourage you to review their privacy policies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children's Privacy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal
                  information from children under 13. If you become aware that a child has provided us with personal information,
                  please contact us.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. International Data Transfers</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Your information may be transferred to and processed in countries other than your own.
                  We ensure appropriate safeguards are in place to protect your information during such transfers.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  We may update this privacy policy from time to time. We will notify you of any changes by posting
                  the new policy on this page and updating the "last updated" date.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 font-medium">DigiKite Technologies - Privacy Team</p>
                  <p className="text-gray-600">Email: privacy@digikite.com</p>
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

export default PrivacyPage;