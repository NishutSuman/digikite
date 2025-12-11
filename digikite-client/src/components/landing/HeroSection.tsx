import React, { useState } from 'react';
import { FaChevronDown, FaPlay, FaArrowRight, FaCheckCircle, FaStar, FaUsers, FaCalendarAlt, FaChartLine } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt, HiGlobe, HiShieldCheck } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openAuthModal } from '../../slices/authSlice';
import UserProfileDropdown from '../common/UserProfileDropdown';

const HeroSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Guild demo URL - update this to your actual Guild instance
  const GUILD_DEMO_URL = 'http://localhost:5173';

  // Asset URLs - for R2 storage, update VITE_ASSETS_BASE_URL in .env
  const ASSETS_BASE_URL = import.meta.env.VITE_ASSETS_BASE_URL || '';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const stats = [
    { value: '10K+', label: 'Active Alumni', icon: FaUsers },
    { value: '500+', label: 'Organizations', icon: HiGlobe },
    { value: '99.9%', label: 'Uptime', icon: HiShieldCheck },
    { value: '4.9/5', label: 'Rating', icon: FaStar },
  ];

  const features = [
    'Complete member management',
    'Event coordination & RSVPs',
    'Treasury & financial tracking',
    'Real-time notifications',
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        {/* Primary gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-blue-600/30 to-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-[150px]" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-4 lg:px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo - Digikite */}
            <motion.a
              href="/"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <img
                src="/brand/DigiKite.avif"
                alt="DigiKite"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const fallback = document.getElementById('digikite-logo-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback Text Logo */}
              <div id="digikite-logo-fallback" className="hidden items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-xl">D</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-md" />
                </div>
                <span className="text-2xl font-bold text-white">
                  Digi<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Kite</span>
                </span>
              </div>
            </motion.a>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden lg:flex items-center gap-1"
            >
              {/* Products Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProductsMenu(!showProductsMenu)}
                  onMouseEnter={() => setShowProductsMenu(true)}
                  className="flex items-center gap-1 px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Products
                  <FaChevronDown className={`text-xs transition-transform ${showProductsMenu ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showProductsMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      onMouseLeave={() => setShowProductsMenu(false)}
                      className="absolute top-full left-0 mt-2 w-80 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-2">
                        <a
                          href="/products/guild"
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group"
                        >
                          {/* Guild Logo */}
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600">
                            <img
                              src="/brand/guild-logo-icon-color.png"
                              alt="Guild"
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              Guild
                              <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white">Featured</span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">Complete alumni workspace solution</div>
                          </div>
                        </a>
                        <a
                          href="/products/elib"
                          className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors group opacity-60"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <HiSparkles className="text-white text-xl" />
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              e-Lib
                              <span className="px-2 py-0.5 text-xs bg-gray-700 rounded-full text-gray-300">Coming Soon</span>
                            </div>
                            <div className="text-sm text-gray-400 mt-1">Digital library system</div>
                          </div>
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a href="#pricing" className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Pricing
              </a>
              <a href="/about" className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                About
              </a>
              <a href="/contact" className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                Contact
              </a>
            </motion.div>

            {/* Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="hidden lg:flex items-center gap-3"
            >
              {user ? (
                <UserProfileDropdown user={user} />
              ) : (
                <>
                  <button
                    onClick={() => dispatch(openAuthModal('login'))}
                    className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors font-medium"
                  >
                    Sign In
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => dispatch(openAuthModal('register'))}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all"
                  >
                    Get Started
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
            >
              <div className="space-y-1.5">
                <motion.div
                  animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="w-6 h-0.5 bg-white"
                />
                <motion.div
                  animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="w-6 h-0.5 bg-white"
                />
                <motion.div
                  animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="w-6 h-0.5 bg-white"
                />
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden mt-4 bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="p-4 space-y-2">
                  <a href="/products/guild" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    Guild Platform
                  </a>
                  <a href="#pricing" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    Pricing
                  </a>
                  <a href="/about" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    About
                  </a>
                  <a href="/contact" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    Contact
                  </a>
                  <div className="pt-4 border-t border-white/10 space-y-2">
                    {user ? (
                      <a
                        href={user.role === 'ADMIN' || user.role === 'SUPER_ADMIN' ? '/admin' : '/portal'}
                        className="block w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium text-center"
                      >
                        Go to Dashboard
                      </a>
                    ) : (
                      <>
                        <button
                          onClick={() => dispatch(openAuthModal('login'))}
                          className="w-full px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors text-left"
                        >
                          Sign In
                        </button>
                        <button
                          onClick={() => dispatch(openAuthModal('register'))}
                          className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium"
                        >
                          Get Started
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-12 lg:pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center lg:text-left"
          >
            {/* Badge - Updated */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full mb-6">
              <HiSparkles className="text-blue-400" />
              <span className="text-sm font-medium text-blue-300">India's First Emerging Alumni Workspace</span>
            </motion.div>

            {/* Introducing Badge */}
            <motion.div variants={itemVariants} className="mb-4">
              <div className="inline-flex items-center gap-3">
                <span className="text-gray-500 text-sm uppercase tracking-wider">Introducing</span>
                <img
                  src="/brand/guild-logo-white.png"
                  alt="Guild"
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const fallback = document.getElementById('guild-text-fallback');
                    if (fallback) fallback.style.display = 'inline';
                  }}
                />
                <span id="guild-text-fallback" className="text-2xl font-bold text-white hidden">GUILD</span>
                <span className="text-gray-500 text-sm">by DigiKite</span>
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
              <span className="text-white">A Complete</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">
                Alumni Workspace
              </span>
              <br />
              <span className="text-white">Solution</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p variants={itemVariants} className="text-lg lg:text-xl text-gray-400 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Transform your alumni network with <span className="text-white font-semibold">Guild</span> - the most comprehensive platform for managing communities, events, treasury, and engagement all in one place.
            </motion.p>

            {/* Features List */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-10 max-w-lg mx-auto lg:mx-0">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-300">
                  <FaCheckCircle className="text-green-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <motion.a
                href={GUILD_DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-blue-500/20 transition-all"
              >
                Explore Guild
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.a>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-2xl font-semibold text-lg transition-all"
              >
                <FaPlay className="text-sm" />
                Watch Demo
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-4 gap-4 lg:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-1">
                    <stat.icon className="text-blue-400 text-sm" />
                    <span className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</span>
                  </div>
                  <span className="text-xs lg:text-sm text-gray-500">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column - Dashboard Screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            {/* Main Dashboard Preview */}
            <motion.div
              variants={floatingVariants}
              animate="animate"
              className="relative z-10"
            >
              {/* Browser Frame */}
              <div className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-3xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                {/* Browser Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0d0d12] border-b border-white/5">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-[#1a1a24] rounded-lg px-4 py-1.5 text-xs text-gray-500 flex items-center gap-2">
                      <HiShieldCheck className="text-green-400" />
                      guild.digikite.com
                    </div>
                  </div>
                </div>

                {/* Dashboard Screenshot or Fallback UI */}
                <div className="relative">
                  {/* Try to load real screenshot */}
                  <img
                    src="/screenshots/guild-dashboard.png"
                    alt="Guild Dashboard"
                    className="w-full h-auto hidden"
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).classList.remove('hidden');
                      const fallback = document.getElementById('dashboard-fallback');
                      if (fallback) fallback.classList.add('hidden');
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).classList.add('hidden');
                    }}
                  />

                  {/* Fallback Dashboard UI */}
                  <div id="dashboard-fallback" className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src="/brand/guild-logo-icon-color.png"
                          alt="Guild"
                          className="w-8 h-8 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <h3 className="text-white font-semibold text-lg">Alumni Dashboard</h3>
                          <p className="text-gray-500 text-sm">Welcome back, Admin</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <FaUsers className="text-blue-400 text-sm" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <FaCalendarAlt className="text-green-400 text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">1,248</div>
                        <div className="text-xs text-gray-400">Active Members</div>
                        <div className="mt-2 text-xs text-green-400">+12.5%</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">24</div>
                        <div className="text-xs text-gray-400">Upcoming Events</div>
                        <div className="mt-2 text-xs text-green-400">+3 new</div>
                      </div>
                      <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
                        <div className="text-2xl font-bold text-white">₹2.4L</div>
                        <div className="text-xs text-gray-400">Treasury</div>
                        <div className="mt-2 text-xs text-green-400">+8.2%</div>
                      </div>
                    </div>

                    {/* Activity Chart Placeholder */}
                    <div className="bg-[#0d0d12] rounded-xl p-4 border border-white/5">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-white">Member Activity</span>
                        <FaChartLine className="text-blue-400" />
                      </div>
                      <div className="flex items-end gap-1 h-20">
                        {[40, 60, 30, 70, 50, 80, 45, 90, 55, 75, 85, 65].map((height, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl border border-blue-500/20 backdrop-blur-sm flex items-center justify-center"
            >
              <img
                src="/brand/guild-logo-icon-color.png"
                alt="Guild"
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<svg class="text-blue-400 text-3xl" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                  }
                }}
              />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-8 -left-8 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/20 backdrop-blur-sm flex items-center justify-center"
            >
              <HiLightningBolt className="text-purple-400 text-2xl" />
            </motion.div>

            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-[100px] -z-10" />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-gray-500 uppercase tracking-wider">Scroll to explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-gray-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
