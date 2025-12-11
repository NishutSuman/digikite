import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaFileContract, FaGavel, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

const TermsPage: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing and using DigiKite's services, including but not limited to our Guild Platform and e-Lib System, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services."
    },
    {
      title: "2. Description of Services",
      content: "DigiKite provides digital solutions for communities and educational institutions, including:",
      list: [
        "Guild Platform - Alumni management and community software",
        "e-Lib System - Digital library management solution",
        "Custom software development services",
        "Implementation and training services",
        "Technical support and maintenance"
      ]
    },
    {
      title: "3. User Accounts and Registration",
      content: "To access certain features of our services, you may be required to create an account. You are responsible for:",
      list: [
        "Maintaining the confidentiality of your account credentials",
        "All activities that occur under your account",
        "Providing accurate and up-to-date information",
        "Notifying us immediately of any unauthorized use"
      ]
    },
    {
      title: "4. Acceptable Use Policy",
      content: "You agree not to use our services for any unlawful purpose or in any way that could damage, disable, or impair our services. Prohibited activities include but are not limited to:",
      list: [
        "Violating any applicable laws or regulations",
        "Transmitting harmful or malicious code",
        "Attempting to gain unauthorized access to our systems",
        "Interfering with other users' use of the services",
        "Using the services for commercial purposes without permission"
      ]
    },
    {
      title: "5. Intellectual Property Rights",
      content: "All content, features, and functionality of our services are owned by DigiKite and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission."
    },
    {
      title: "6. Payment Terms",
      content: "For paid services:",
      list: [
        "Payment is due as specified in your service agreement",
        "All fees are non-refundable unless otherwise specified in our Refund Policy",
        "We reserve the right to suspend services for non-payment",
        "Price changes will be communicated with 30 days notice"
      ]
    },
    {
      title: "7. Data Protection and Privacy",
      content: "Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these terms by reference."
    },
    {
      title: "8. Service Availability",
      content: "While we strive to provide continuous service availability with 99.9% uptime, we do not guarantee uninterrupted access. We reserve the right to modify, suspend, or discontinue services with reasonable notice."
    },
    {
      title: "9. Limitation of Liability",
      content: "To the fullest extent permitted by law, DigiKite shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid by you for the services in the preceding 12 months."
    },
    {
      title: "10. Termination",
      content: "Either party may terminate the service agreement with appropriate notice as specified in the service contract. Upon termination, your right to use the services will cease immediately, and we may delete your data after a reasonable retention period."
    },
    {
      title: "11. Governing Law",
      content: "These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka, India."
    },
    {
      title: "12. Changes to Terms",
      content: "We reserve the right to update these terms at any time. We will notify you of material changes via email or through our services. Continued use of our services after changes are posted constitutes acceptance of the new terms."
    }
  ];

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-r from-purple-600/10 to-indigo-600/10 rounded-full blur-[120px]" />
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
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-full mb-6">
              <FaFileContract className="text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Legal Agreement</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Terms and <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Conditions</span>
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
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 rounded-xl flex items-center justify-center">
                  <FaGavel className="text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-white">Agreement to Terms</h2>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Please read these Terms and Conditions carefully before using our services. By accessing or using DigiKite's
                products and services, you agree to be bound by these terms and all applicable laws and regulations.
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
                          <span className="text-purple-400 mt-1.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}

              {/* Contact Section */}
              <motion.div variants={itemVariants} className="pt-4">
                <h2 className="text-xl font-semibold text-white mb-4">13. Contact Information</h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  For questions about these Terms and Conditions, please contact us:
                </p>
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6">
                  <p className="text-white font-semibold mb-4">DigiKite Technologies - Legal Team</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaEnvelope className="text-purple-400" />
                      <span>legal@digikite.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaPhone className="text-purple-400" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-400">
                      <FaMapMarkerAlt className="text-purple-400" />
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

export default TermsPage;
