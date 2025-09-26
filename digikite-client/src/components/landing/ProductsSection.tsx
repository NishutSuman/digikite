import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaUsers, FaBook } from 'react-icons/fa';

const ProductsSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section id="products" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Our <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Products</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our flagship products designed to revolutionize community management and educational institutions
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-12"
        >
          {/* Guild Product Card */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="group relative"
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12 h-full border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-2xl">
              {/* Product Icon/Illustration */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaUsers className="text-white text-3xl" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Guild</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  End-to-end platform for managing societies, associations, and communities. Perfect for alumni groups, social clubs, and organizations of 1000-2000 members.
                </p>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Features</h4>
                <ul className="space-y-3">
                  {[
                    'Member Management System',
                    'Event Planning & Coordination',
                    'Communication Tools',
                    'Financial Management',
                    'Activity Tracking',
                    'Custom Community Portals'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow"
              >
                Explore Guild Platform
              </motion.button>

              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-blue-200/30 to-indigo-200/30 rounded-full blur-xl"></div>
            </div>
          </motion.div>

          {/* e-Lib Product Card */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -10, transition: { duration: 0.3 } }}
            className="group relative"
          >
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 lg:p-12 h-full border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-2xl">
              {/* Product Icon/Illustration */}
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <FaBook className="text-white text-3xl" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">e-Lib</h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Comprehensive digital library management system for schools, colleges, and institutes. Includes on-site setup, training, and ongoing support.
                </p>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">What We Provide</h4>
                <ul className="space-y-3">
                  {[
                    'Digital Catalog Management',
                    'Book Tracking & Inventory',
                    'Member Management',
                    'On-site Setup Service',
                    'Staff Training Programs',
                    'Technical Support'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow"
              >
                Discover e-Lib Solution
              </motion.button>

              {/* Decorative Elements */}
              <div className="absolute top-8 right-8 w-24 h-24 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-lg text-gray-600 mb-8">
            Need a custom solution? We build tailored software for your specific requirements.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
          >
            Request Custom Solution
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductsSection;