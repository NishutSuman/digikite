import React from 'react';
import { motion } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
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

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="relative z-50 w-full px-4 py-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center"
          >
            <a href="/" className="flex items-center">
              <img
                src="/images/logos/digikite-logo.png"
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
            </a>
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
            <a href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              About
            </a>
            <a href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
              Contact
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