import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaCalendarAlt, FaComments, FaDollarSign, FaChartLine, FaGlobe, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { openAuthModal } from '../slices/authSlice';
import Layout from '../components/layout/Layout';

const GuildPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const features = [
    {
      icon: <FaUsers className="text-3xl text-blue-600" />,
      title: "Member Management",
      description: "Complete member profiles, registration, renewals, and communication tools"
    },
    {
      icon: <FaCalendarAlt className="text-3xl text-green-600" />,
      title: "Event Planning",
      description: "Create, manage and coordinate events with RSVP tracking and notifications"
    },
    {
      icon: <FaComments className="text-3xl text-purple-600" />,
      title: "Communication Hub",
      description: "Announcements, newsletters, group messaging, and discussion forums"
    },
    {
      icon: <FaDollarSign className="text-3xl text-emerald-600" />,
      title: "Financial Management",
      description: "Membership fees, event payments, donations, and financial reporting"
    },
    {
      icon: <FaChartLine className="text-3xl text-orange-600" />,
      title: "Analytics & Reports",
      description: "Member engagement, event attendance, financial reports, and insights"
    },
    {
      icon: <FaGlobe className="text-3xl text-indigo-600" />,
      title: "Custom Portals",
      description: "Branded community websites with member login and self-service options"
    }
  ];

  const benefits = [
    "Streamline member onboarding and renewal processes",
    "Increase event attendance with integrated planning tools",
    "Improve communication with centralized messaging",
    "Automate fee collection and financial tracking",
    "Access detailed analytics for better decision making",
    "Reduce administrative workload by up to 70%"
  ];

  const stats = [
    { number: "1000+", label: "Communities Served" },
    { number: "2M+", label: "Members Managed" },
    { number: "50K+", label: "Events Organized" },
    { number: "99.9%", label: "Uptime" }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
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
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-700 text-sm font-medium">
                  <FaUsers className="mr-2" />
                  Community Management Platform
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Manage Your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Guild</span> Community
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Complete platform for managing societies, associations, and communities. Perfect for alumni groups,
                  social clubs, and organizations with 1000-2000 members.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <motion.a
                    href="/dashboard"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-shadow"
                  >
                    Access Guild Platform
                    <FaArrowRight className="ml-2" />
                  </motion.a>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(openAuthModal('register'))}
                    className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-shadow"
                  >
                    Start Free Trial
                    <FaArrowRight className="ml-2" />
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
                >
                  Schedule Demo
                </motion.button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
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
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <FaUsers className="text-8xl text-blue-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Guild Community Platform</p>
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need to Manage Your Community</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools designed specifically for community leaders and administrators
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

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-8">Why Choose Guild Platform?</h2>
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
              <h3 className="text-2xl font-bold mb-6">Ready to Get Started?</h3>
              <p className="text-lg mb-8 text-blue-100">
                Join thousands of communities already using Guild Platform to manage their members and events efficiently.
              </p>
              {user ? (
                <motion.a
                  href="/dashboard"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
                >
                  Go to Dashboard
                  <FaArrowRight className="ml-2" />
                </motion.a>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch(openAuthModal('register'))}
                  className="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
                >
                  Start Your Free Trial
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

export default GuildPage;