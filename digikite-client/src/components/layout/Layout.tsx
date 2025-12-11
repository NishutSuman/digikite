import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useState } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openAuthModal } from '../../slices/authSlice';
import UserProfileDropdown from '../common/UserProfileDropdown';
import Footer from '../landing/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Navigation */}
      <nav className="relative z-50 w-full px-4 lg:px-8 py-5 bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-white/5">
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
                  const fallback = document.getElementById('digikite-nav-fallback');
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              {/* Fallback Text Logo */}
              <div id="digikite-nav-fallback" className="hidden items-center gap-3">
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
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
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

              <a href="/#pricing" className="px-4 py-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
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
                  <a href="/#pricing" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    Pricing
                  </a>
                  <a href="/about" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    About
                  </a>
                  <a href="/contact" className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
                    Contact
                  </a>
                  <div className="pt-4 border-t border-white/10 space-y-2">
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
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
