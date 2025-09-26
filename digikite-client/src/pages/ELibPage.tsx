import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaSearch, FaDatabase, FaUsers, FaCloud, FaMobile, FaCheckCircle, FaArrowRight, FaGraduationCap, FaBookOpen } from 'react-icons/fa';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { openAuthModal } from '../slices/authSlice';
import Layout from '../components/layout/Layout';

const ELibPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const features = [
    {
      icon: <FaDatabase className="text-3xl text-purple-600" />,
      title: "Digital Catalog Management",
      description: "Comprehensive cataloging system for books, journals, multimedia, and digital resources"
    },
    {
      icon: <FaSearch className="text-3xl text-blue-600" />,
      title: "Advanced Search & Discovery",
      description: "Powerful search engine with filters, recommendations, and smart suggestions"
    },
    {
      icon: <FaUsers className="text-3xl text-green-600" />,
      title: "Member Management",
      description: "Student and faculty profiles, borrowing history, and automated notifications"
    },
    {
      icon: <FaMobile className="text-3xl text-orange-600" />,
      title: "Mobile-First Design",
      description: "Access your library from any device with our responsive web application"
    },
    {
      icon: <FaCloud className="text-3xl text-indigo-600" />,
      title: "Cloud-Based Solution",
      description: "Secure cloud hosting with automatic backups and 99.9% uptime guarantee"
    },
    {
      icon: <FaBookOpen className="text-3xl text-emerald-600" />,
      title: "Digital Reading Platform",
      description: "Built-in e-reader for digital books, PDFs, and multimedia content"
    }
  ];

  const benefits = [
    "Reduce library management workload by 60%",
    "Increase resource discovery and usage",
    "Automate fine calculations and notifications",
    "Generate detailed usage and analytics reports",
    "Support for multiple languages and formats",
    "24/7 technical support and training included"
  ];

  const services = [
    {
      title: "Complete Setup & Migration",
      description: "We handle the entire setup process including data migration from your existing system"
    },
    {
      title: "Staff Training Program",
      description: "Comprehensive training for librarians and staff members on system usage"
    },
    {
      title: "Ongoing Technical Support",
      description: "24/7 support with dedicated account manager and regular system updates"
    },
    {
      title: "Custom Integration",
      description: "Integration with existing school/college management systems and databases"
    }
  ];

  const stats = [
    { number: "150+", label: "Libraries Digitized" },
    { number: "500K+", label: "Books Cataloged" },
    { number: "50K+", label: "Active Users" },
    { number: "99.9%", label: "System Uptime" }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium">
                  <FaBook className="mr-2" />
                  Digital Library Management System
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Transform Your Library with <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">e-Lib</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Complete digital library management system for schools, colleges, and institutes.
                  Includes on-site setup, comprehensive training, and ongoing support.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <motion.a
                    href="/dashboard"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-shadow"
                  >
                    Access e-Lib System
                    <FaArrowRight className="ml-2" />
                  </motion.a>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(openAuthModal('register'))}
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-shadow"
                  >
                    Request Demo
                    <FaArrowRight className="ml-2" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-purple-600 hover:text-purple-600 transition-colors"
                >
                  Download Brochure
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <FaGraduationCap className="text-8xl text-purple-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">e-Lib Digital Library System</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Library Management Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to modernize your library and improve user experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-6">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete Implementation Service</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just provide software - we ensure your success with comprehensive support services
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-4 mt-1">
                    <FaCheckCircle className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-8">Why Choose e-Lib System?</h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center"
                  >
                    <FaCheckCircle className="text-emerald-400 mr-4 text-xl flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6">Ready to Modernize Your Library?</h3>
              <p className="text-lg mb-8 text-purple-100">
                Join 150+ educational institutions that have already transformed their libraries with our e-Lib system.
              </p>
              {user ? (
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors"
                >
                  Go to Dashboard
                  <FaArrowRight className="ml-2" />
                </motion.a>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch(openAuthModal('register'))}
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors"
                >
                  Schedule Implementation Call
                  <FaArrowRight className="ml-2" />
                </motion.button>
              )}
            </motion.div>
          </div>
        </div>
      </section>
      </div>
    </Layout>
  );
};

export default ELibPage;