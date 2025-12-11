import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  FaUsers,
  FaCalendarAlt,
  FaWallet,
  FaBell,
  FaImages,
  FaTint,
  FaComments,
  FaChartLine,
  FaShieldAlt,
  FaMobile,
  FaGlobe,
  FaCog
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const FeaturesSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const features: Feature[] = [
    {
      icon: FaUsers,
      title: 'Member Management',
      description: 'Complete profiles with batch info, verification system, and role-based access control for all members.',
      color: 'blue',
    },
    {
      icon: FaCalendarAlt,
      title: 'Event Management',
      description: 'Create events with RSVP tracking, ticketing, reminders, and comprehensive feedback collection.',
      color: 'green',
    },
    {
      icon: FaWallet,
      title: 'Treasury & Payments',
      description: 'Track finances with categories, income/expense management, and Razorpay payment integration.',
      color: 'yellow',
    },
    {
      icon: FaBell,
      title: 'Smart Notifications',
      description: 'Push notifications, email campaigns, and in-app alerts to keep everyone informed.',
      color: 'red',
    },
    {
      icon: FaImages,
      title: 'Photo Albums',
      description: 'Organize memories with beautiful galleries, event albums, and member photo sharing.',
      color: 'purple',
    },
    {
      icon: FaTint,
      title: 'Life Link',
      description: 'Blood donation network with compatibility matching and emergency request system.',
      color: 'pink',
    },
    {
      icon: FaComments,
      title: 'Social Feed',
      description: 'Community posts, likes, comments, and engagement features for active networking.',
      color: 'indigo',
    },
    {
      icon: FaChartLine,
      title: 'Analytics Dashboard',
      description: 'Track engagement, event attendance, financial reports, and member activity insights.',
      color: 'cyan',
    },
    {
      icon: FaShieldAlt,
      title: 'Secure & Private',
      description: 'Role-based permissions, data encryption, and GDPR-compliant data handling.',
      color: 'emerald',
    },
    {
      icon: FaMobile,
      title: 'Mobile App',
      description: 'Native iOS and Android apps with push notifications and offline support.',
      color: 'orange',
    },
    {
      icon: FaGlobe,
      title: 'Multi-Tenant',
      description: 'Each organization gets their own branded portal with custom domain support.',
      color: 'teal',
    },
    {
      icon: FaCog,
      title: 'Easy Configuration',
      description: 'Customize everything from branding to features without any coding required.',
      color: 'slate',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'from-green-500/20 to-green-500/5', text: 'text-green-400', border: 'border-green-500/20' },
    yellow: { bg: 'from-yellow-500/20 to-yellow-500/5', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    red: { bg: 'from-red-500/20 to-red-500/5', text: 'text-red-400', border: 'border-red-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20' },
    pink: { bg: 'from-pink-500/20 to-pink-500/5', text: 'text-pink-400', border: 'border-pink-500/20' },
    indigo: { bg: 'from-indigo-500/20 to-indigo-500/5', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    cyan: { bg: 'from-cyan-500/20 to-cyan-500/5', text: 'text-cyan-400', border: 'border-cyan-500/20' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-500/5', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    orange: { bg: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/20' },
    teal: { bg: 'from-teal-500/20 to-teal-500/5', text: 'text-teal-400', border: 'border-teal-500/20' },
    slate: { bg: 'from-slate-500/20 to-slate-500/5', text: 'text-slate-400', border: 'border-slate-500/20' },
  };

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="relative py-12 lg:py-16 bg-[#0a0a0f] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full mb-6">
            <HiSparkles className="text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Powerful Features</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Everything You Need to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Manage Your Community
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto">
            Guild comes packed with all the tools your alumni organization needs. No more juggling multiple platforms.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {features.map((feature, index) => {
            const colors = colorClasses[feature.color];
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`group relative bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} p-6 hover:border-opacity-50 transition-all duration-300`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-[#0a0a0f] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border ${colors.border}`}>
                  <feature.icon className={`text-xl ${colors.text}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>

                {/* Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10`} />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { value: '50+', label: 'Features' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '24/7', label: 'Support' },
            { value: '100%', label: 'Data Secure' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              <div className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
