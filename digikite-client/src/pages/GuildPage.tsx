import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaUsers, FaCalendarAlt, FaComments, FaDollarSign, FaChartLine, FaGlobe, FaCheckCircle, FaArrowRight, FaMobileAlt, FaShieldAlt, FaCreditCard, FaCamera, FaTint, FaBell, FaTicketAlt, FaStore, FaFileAlt } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { openAuthModal } from '../slices/authSlice';
import Layout from '../components/layout/Layout';

const GuildPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const features = [
    {
      icon: FaUsers,
      title: "Member Management",
      description: "Complete member profiles, batch-wise organization, registration verification, and communication tools",
      color: "blue"
    },
    {
      icon: FaCalendarAlt,
      title: "Event Management",
      description: "Create events with ticketing, RSVP tracking, guest management, and automated reminders",
      color: "green"
    },
    {
      icon: FaDollarSign,
      title: "Treasury Management",
      description: "Track income, expenses, membership fees, donations with detailed financial reports",
      color: "emerald"
    },
    {
      icon: FaComments,
      title: "Social Feed",
      description: "LinkedIn-style posts with reactions, comments, and engagement analytics",
      color: "purple"
    },
    {
      icon: FaCamera,
      title: "Photo Albums",
      description: "Organized galleries for events and memories with batch tagging and sharing",
      color: "pink"
    },
    {
      icon: FaTint,
      title: "Life Link",
      description: "Blood donation network with compatibility matching and emergency requests",
      color: "red"
    },
    {
      icon: FaStore,
      title: "Merchandise Store",
      description: "Custom merchandise with inventory management and order tracking",
      color: "orange"
    },
    {
      icon: FaBell,
      title: "Notifications",
      description: "Push notifications, email campaigns, and birthday/anniversary reminders",
      color: "yellow"
    },
    {
      icon: FaTicketAlt,
      title: "Support Tickets",
      description: "Helpdesk system for member queries with SLA tracking and escalation",
      color: "cyan"
    }
  ];

  const benefits = [
    "Streamline member onboarding with automated verification workflow",
    "Increase event attendance with integrated ticketing and reminders",
    "Build lasting connections with social networking features",
    "Automate fee collection and generate financial reports instantly",
    "Preserve memories with organized photo albums and galleries",
    "Reduce administrative workload by up to 70%"
  ];

  const stats = [
    { number: "500+", label: "Organizations" },
    { number: "2M+", label: "Alumni Managed" },
    { number: "50K+", label: "Events Hosted" },
    { number: "99.9%", label: "Uptime" }
  ];

  const useCases = [
    { title: "Educational Institutions", description: "Universities, colleges, and schools managing their alumni networks" },
    { title: "Professional Associations", description: "Industry bodies and professional groups connecting members" },
    { title: "Social Clubs", description: "Community groups, rotary clubs, and social organizations" },
    { title: "Corporate Alumni", description: "Companies maintaining relationships with former employees" }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'from-green-500/20 to-green-500/5', text: 'text-green-400', border: 'border-green-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20' },
    pink: { bg: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400', border: 'border-pink-500/20' },
    red: { bg: 'from-red-500/20 to-red-500/5', text: 'text-red-400', border: 'border-red-500/20' },
    orange: { bg: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/20' },
    yellow: { bg: 'from-yellow-500/20 to-yellow-500/5', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    cyan: { bg: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/15 to-indigo-600/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-16">
            <motion.div
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={inView ? "visible" : "hidden"}
              className="grid lg:grid-cols-2 gap-12 items-center"
            >
              {/* Left Column - Content */}
              <motion.div variants={itemVariants} className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full">
                    <HiSparkles className="text-blue-400" />
                    <span className="text-sm font-medium text-blue-300">India's First Emerging Alumni Workspace</span>
                  </div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                    The Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Alumni</span> Management Platform
                  </h1>
                  <p className="text-lg text-gray-400 leading-relaxed">
                    Guild is a comprehensive platform for managing alumni networks, societies, and communities.
                    From member verification to event ticketing, treasury management to social networking - everything in one place.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {user ? (
                    <motion.a
                      href="/dashboard"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                      Access Guild Platform
                      <FaArrowRight />
                    </motion.a>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => dispatch(openAuthModal('register'))}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                      Start Free Trial
                      <FaArrowRight />
                    </motion.button>
                  )}
                  <motion.a
                    href="/contact"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    Schedule Demo
                  </motion.a>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-4 gap-4 pt-4">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{stat.number}</div>
                      <div className="text-xs lg:text-sm text-gray-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right Column - Visual */}
              <motion.div variants={itemVariants} className="relative">
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-3xl p-8 h-96 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
                      <FaUsers className="text-5xl text-white" />
                    </div>
                    <p className="text-xl font-semibold text-white mb-2">Guild Platform</p>
                    <p className="text-gray-400">Complete Alumni Management Solution</p>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white text-sm font-medium shadow-lg">
                  14-Day Free Trial
                </div>
              </motion.div>
            </motion.div>
          </section>

          {/* Features Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={itemVariants} className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full mb-6">
                    <HiLightningBolt className="text-purple-400" />
                    <span className="text-sm font-medium text-purple-300">Powerful Features</span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything You Need to Manage Your Alumni Network</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Comprehensive tools designed specifically for alumni associations and community managers
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feature, index) => {
                    const colors = colorClasses[feature.color];
                    return (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className={`bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} p-6 hover:border-opacity-50 transition-all`}
                      >
                        <div className={`w-12 h-12 bg-[#0a0a0f] rounded-xl flex items-center justify-center mb-4 ${colors.text} border ${colors.border}`}>
                          <feature.icon className="text-xl" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={itemVariants} className="text-center mb-12">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Built For Every Organization</h2>
                  <p className="text-gray-400 max-w-2xl mx-auto">
                    Guild adapts to organizations of all sizes and types
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {useCases.map((useCase, index) => (
                    <motion.div
                      key={index}
                      variants={itemVariants}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
                    >
                      <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
                      <p className="text-gray-500 text-sm">{useCase.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-3xl p-8 lg:p-12"
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <motion.div variants={itemVariants}>
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">Why Choose Guild?</h2>
                    <div className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          className="flex items-start gap-4"
                        >
                          <FaCheckCircle className="text-green-400 mt-1 flex-shrink-0" />
                          <span className="text-gray-300">{benefit}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    variants={itemVariants}
                    className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8"
                  >
                    <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
                    <p className="text-gray-400 mb-6">
                      Join 500+ organizations already using Guild to manage their alumni networks efficiently.
                    </p>
                    <div className="space-y-4">
                      {user ? (
                        <motion.a
                          href="/dashboard"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                        >
                          Go to Dashboard
                          <FaArrowRight />
                        </motion.a>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => dispatch(openAuthModal('register'))}
                          className="inline-flex items-center justify-center gap-2 w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                        >
                          Start Your Free Trial
                          <FaArrowRight />
                        </motion.button>
                      )}
                      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-2">
                          <FaShieldAlt className="text-green-400" />
                          No credit card required
                        </span>
                        <span className="flex items-center gap-2">
                          <FaMobileAlt className="text-blue-400" />
                          iOS & Android apps
                        </span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 lg:px-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#1a1a24] to-[#12121a] border border-white/10 rounded-3xl p-8 lg:p-12">
                  <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Transform Your Alumni Network Today</h2>
                  <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                    Schedule a free demo to see how Guild can help you build a thriving alumni community.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                      href="/contact"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                    >
                      Schedule a Demo
                      <FaArrowRight />
                    </motion.a>
                    <motion.a
                      href="/#pricing"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
                    >
                      View Pricing
                    </motion.a>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default GuildPage;
