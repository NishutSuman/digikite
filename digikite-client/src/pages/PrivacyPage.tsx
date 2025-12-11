import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaShieldAlt, FaLock, FaUserShield, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

const PrivacyPage: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include:",
      list: [
        "Personal information (name, email address, phone number)",
        "Account credentials and preferences",
        "Usage data and activity logs",
        "Communication records and support tickets",
        "Payment information (processed securely by third-party providers)"
      ]
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to:",
      list: [
        "Provide, maintain, and improve our services",
        "Process transactions and send related information",
        "Send technical notices, updates, and support messages",
        "Respond to your comments, questions, and customer service requests",
        "Monitor and analyze trends, usage, and activities",
        "Personalize and improve your experience"
      ]
    },
    {
      title: "3. Information Sharing and Disclosure",
      content: "We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy:",
      list: [
        "With your consent or at your direction",
        "To service providers who assist in our operations",
        "To comply with legal obligations or protect our rights",
        "In connection with a business transaction (merger, acquisition, etc.)"
      ]
    },
    {
      title: "4. Data Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:",
      list: [
        "Encryption of data in transit and at rest",
        "Regular security assessments and audits",
        "Access controls and authentication measures",
        "Employee training on data protection"
      ]
    },
    {
      title: "5. Data Retention",
      content: "We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy, unless a longer retention period is required or permitted by law."
    },
    {
      title: "6. Your Rights and Choices",
      content: "You have the following rights regarding your personal information:",
      list: [
        "Access and review your personal information",
        "Correct or update inaccurate information",
        "Delete your personal information (subject to certain limitations)",
        "Object to or restrict processing of your information",
        "Data portability for information you provided"
      ]
    },
    {
      title: "7. Cookies and Tracking Technologies",
      content: "We use cookies and similar tracking technologies to collect and use personal information about you. You can control cookies through your browser settings, though disabling cookies may affect functionality."
    },
    {
      title: "8. Third-Party Services",
      content: "Our services may contain links to third-party websites or integrate with third-party services. This privacy policy does not apply to third-party services, and we encourage you to review their privacy policies."
    },
    {
      title: "9. Children's Privacy",
      content: "Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us."
    },
    {
      title: "10. International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information during such transfers."
    },
    {
      title: "11. Changes to This Privacy Policy",
      content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the \"last updated\" date."
    }
  ];

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-[100px]" />
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
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full mb-6">
              <FaShieldAlt className="text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Your Privacy Matters</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Policy</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-gray-400">
              Last updated: December 11, 2025
            </motion.p>
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
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <FaLock className="text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Your Privacy is Our Priority</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                At DigiKite, we are committed to protecting your privacy and ensuring the security of your personal information.
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services.
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
                          <span className="text-blue-400 mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}

              {/* Contact Section */}
              <motion.div variants={itemVariants} className="pt-4">
                <h2 className="text-xl font-semibold text-white mb-4">12. Contact Us</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  If you have any questions about this privacy policy or our data practices, please contact us:
                </p>
                <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-2xl p-6">
                  <p className="text-white font-semibold mb-4">DigiKite Technologies - Privacy Team</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaEnvelope className="text-blue-400" />
                      <span>privacy@digikite.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaPhone className="text-blue-400" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaMapMarkerAlt className="text-blue-400" />
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

export default PrivacyPage;
