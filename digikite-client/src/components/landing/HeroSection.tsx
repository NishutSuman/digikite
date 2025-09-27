import React, { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { useInView } from 'react-intersection-observer';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openAuthModal } from '../../slices/authSlice';
import UserProfileDropdown from '../common/UserProfileDropdown';

const HeroSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [animationFailed, setAnimationFailed] = useState(false);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });


  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 w-full h-full">
        {/* For now using a placeholder - replace with actual Lottie when R2 is set up */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full px-4 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center"
          >
            <img
              src={`${import.meta.env.VITE_ASSETS_BASE_URL}/images/logos/Digikite.jpg`}
              alt="DigiKite Logo"
              className="h-12 w-auto object-contain"
              onError={(e) => {
                // Fallback if logo fails to load
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling.style.display = 'flex';
              }}
            />
            <div className="h-12 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
              <span className="text-white font-bold text-2xl">DigiKite</span>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex items-center space-x-8"
          >
            <div className="relative">
              <button
                onClick={() => setShowProductsMenu(!showProductsMenu)}
                onMouseEnter={() => setShowProductsMenu(true)}
                className="flex items-center text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Products
                <FaChevronDown className="ml-1 text-xs" />
              </button>

              {showProductsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  onMouseLeave={() => setShowProductsMenu(false)}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                >
                  <a
                    href="/products/guild"
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <div className="font-medium">Guild Platform</div>
                    <div className="text-sm text-gray-500">Community Management</div>
                  </a>
                  <a
                    href="/products/elib"
                    className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <div className="font-medium">e-Lib System</div>
                    <div className="text-sm text-gray-500">Digital Library Management</div>
                  </a>
                </motion.div>
              )}
            </div>
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Services
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </a>
{user ? (
              <UserProfileDropdown user={user} />
            ) : (
              <>
                <button
                  onClick={() => dispatch(openAuthModal('login'))}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch(openAuthModal('register'))}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Get Started
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:hidden w-10 h-10 flex items-center justify-center"
          >
            <div className="space-y-2">
              <div className="w-6 h-0.5 bg-gray-600"></div>
              <div className="w-6 h-0.5 bg-gray-600"></div>
              <div className="w-6 h-0.5 bg-gray-600"></div>
            </div>
          </motion.button>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="space-y-8"
          >
            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="block text-gray-900">Digital Solutions</span>
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  That Transform
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Empowering communities and educational institutions with cutting-edge software solutions.
                From society management to digital library systems, we bring innovation to every corner.
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              {user ? (
                <>
                  <motion.a
                    href="/dashboard"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-shadow text-center"
                  >
                    Go to Dashboard
                  </motion.a>
                  <motion.a
                    href="/profile"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-colors text-center"
                  >
                    View Profile
                  </motion.a>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(openAuthModal('register'))}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-shadow"
                  >
                    Get Started Free
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(openAuthModal('login'))}
                    className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-8 pt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1000+</div>
                <div className="text-gray-600">Communities Served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">50+</div>
                <div className="text-gray-600">Libraries Digitized</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">99%</div>
                <div className="text-gray-600">Client Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative"
          >
            {/* Lottie Animation from R2 */}
            <div className="w-full h-[600px] flex items-center justify-center relative">
              {!animationFailed && (
                <Player
                  autoplay
                  loop
                  src={`${import.meta.env.VITE_ASSETS_BASE_URL}/animations/Ai-powered marketing tools abstract.json`}
                  style={{ height: '600px', width: '600px' }}
                  onError={() => {
                    console.log('Lottie animation failed to load, showing fallback');
                    setAnimationFailed(true);
                  }}
                />
              )}

              {/* Fallback if animation fails */}
              <div className={`w-96 h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center absolute transition-opacity duration-500 ${animationFailed ? 'opacity-100' : 'opacity-0'}`}>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-white rounded-lg"></div>
                  </div>
                  <p className="text-gray-600 font-medium">AI-Powered Marketing Tools</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-10 left-10 w-20 h-20 bg-blue-200/50 rounded-2xl flex items-center justify-center backdrop-blur-sm"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute bottom-10 right-10 w-16 h-16 bg-indigo-200/50 rounded-xl flex items-center justify-center backdrop-blur-sm"
            >
              <div className="w-6 h-6 bg-indigo-600 rounded-full"></div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;