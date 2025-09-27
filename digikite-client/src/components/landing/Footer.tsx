import React from 'react';
import { motion } from 'framer-motion';
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { MdSecurity } from 'react-icons/md';
import { IoShieldCheckmark } from 'react-icons/io5';

const Footer: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-slate-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid lg:grid-cols-4 md:grid-cols-2 gap-8"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <img
                src="/images/logos/digikite-logo.png"
                alt="DigiKite Logo"
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  // Fallback if logo fails to load
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling.style.display = 'flex';
                }}
              />
              <div className="h-16 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                <span className="text-white font-bold text-3xl">DigiKite</span>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Empowering communities and educational institutions with cutting-edge software solutions.
              Transforming digital experiences through innovation and excellence.
            </p>

            {/* Social Media */}
            <div className="flex space-x-4">
              {[
                { name: 'LinkedIn', icon: <FaLinkedin />, href: '#' },
                { name: 'Twitter', icon: <FaTwitter />, href: '#' },
                { name: 'Facebook', icon: <FaFacebook />, href: '#' },
                { name: 'Instagram', icon: <FaInstagram />, href: '#' }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 text-lg"
                  title={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Products */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-6 text-white">Products</h3>
            <ul className="space-y-3">
              {[
                { name: 'Guild Platform', href: '#products' },
                { name: 'e-Lib Solution', href: '#products' },
                { name: 'Custom Development', href: '#services' },
                { name: 'Digital Transformation', href: '#services' }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-blue-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 group-hover:bg-blue-400 transition-colors"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-6 text-white">Services</h3>
            <ul className="space-y-3">
              {[
                { name: 'Implementation & Training', href: '#services' },
                { name: 'Technical Support', href: '#services' },
                { name: 'System Integration', href: '#services' },
                { name: 'Consulting Services', href: '#services' }
              ].map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-indigo-400 transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3 group-hover:bg-indigo-400 transition-colors"></span>
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact & Support */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-bold mb-6 text-white">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-start group">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3 mt-1 group-hover:bg-emerald-500 transition-colors">
                  <FaMapMarkerAlt className="text-white" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">
                    123 Innovation Hub<br />
                    Tech City, India - 110001
                  </p>
                </div>
              </div>

              <div className="flex items-center group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500 transition-colors">
                  <FaPhone className="text-white" />
                </div>
                <a href="tel:+919876543210" className="text-gray-300 hover:text-blue-400 transition-colors">
                  +91 98765 43210
                </a>
              </div>

              <div className="flex items-center group">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-500 transition-colors">
                  <FaEnvelope className="text-white" />
                </div>
                <a href="mailto:info@digikite.com" className="text-gray-300 hover:text-purple-400 transition-colors">
                  info@digikite.com
                </a>
              </div>

              <div className="flex items-center group">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3 group-hover:bg-orange-500 transition-colors">
                  <FaClock className="text-white" />
                </div>
                <div className="text-gray-300 text-sm">
                  Mon - Fri: 9:00 AM - 6:00 PM<br />
                  <span className="text-gray-400">24/7 Support Available</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-gray-700"
        >
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6">
              Subscribe to our newsletter for the latest updates on products, features, and company news.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow whitespace-nowrap"
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Links & Legal */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Quick Links */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm">
              {[
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Refund Policy', href: '/refund' },
                { name: 'Support', href: '/contact' },
                { name: 'About Us', href: '/about' }
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors duration-300"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Certifications & Trust Badges */}
            <div className="flex items-center gap-4">
              {[
                { name: 'ISO 27001', icon: <IoShieldCheckmark /> },
                { name: 'GDPR', icon: <MdSecurity /> },
                { name: 'Security', icon: <IoShieldCheckmark /> }
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                  title={badge.name}
                >
                  <span>{badge.icon}</span>
                  <span>{badge.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {currentYear} DigiKite. All rights reserved. Built with care in India.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Powered by</span>
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-semibold">
                DigiKite Technology
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;