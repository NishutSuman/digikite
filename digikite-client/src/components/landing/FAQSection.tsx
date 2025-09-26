import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaPhone, FaComments, FaEnvelope } from 'react-icons/fa';

const FAQSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Guild platform and how does it help communities?",
      answer: "Guild is our comprehensive community management platform designed for societies, associations, and organizations with 1000-2000 members. It offers member management, event planning, communication tools, financial tracking, and custom community portals. The platform streamlines operations, improves member engagement, and provides powerful analytics to help communities thrive.",
      category: "Guild Platform"
    },
    {
      question: "What makes e-Lib different from other library management systems?",
      answer: "e-Lib combines cutting-edge software with comprehensive service support. Unlike other systems, we provide complete on-site setup, extensive staff training, digital catalog management, book tracking, and ongoing technical support. Our solution is specifically designed for educational institutions with dedicated customer success managers.",
      category: "e-Lib Solution"
    },
    {
      question: "Do you provide custom software development services?",
      answer: "Yes, we specialize in custom software development tailored to your specific needs. Our services include web applications, mobile apps, desktop solutions, API development, database design, and cloud integration. We work closely with clients to understand their unique requirements and deliver solutions that perfectly fit their business processes.",
      category: "Custom Development"
    },
    {
      question: "What kind of training and support do you provide?",
      answer: "We offer comprehensive training programs including on-site setup services, hands-on staff training sessions, detailed technical documentation, and 24/7 ongoing support. Our team ensures smooth implementation and provides continuous assistance to maximize the value of our solutions.",
      category: "Support & Training"
    },
    {
      question: "How long does it take to implement your solutions?",
      answer: "Implementation timelines vary based on the solution complexity. Guild platform typically takes 2-4 weeks for full deployment, while e-Lib installations are completed within 1-2 weeks including training. Custom development projects timeline depends on requirements but we always provide detailed project schedules upfront.",
      category: "Implementation"
    },
    {
      question: "What are your pricing models and payment options?",
      answer: "We offer flexible pricing models including one-time licenses, subscription-based pricing, and custom enterprise packages. Payment options include annual subscriptions, quarterly payments, and installment plans. Contact us for a detailed quote based on your specific requirements and organization size.",
      category: "Pricing"
    },
    {
      question: "Do you provide data migration and integration services?",
      answer: "Absolutely! We handle complete data migration from your existing systems to our platforms. Our team ensures seamless integration with your current workflows, third-party applications, and databases. We also provide API integrations to connect with other tools your organization uses.",
      category: "Integration"
    },
    {
      question: "What security measures are in place to protect our data?",
      answer: "Security is our top priority. We implement enterprise-grade security including encrypted data transmission, secure cloud hosting, regular security audits, role-based access controls, automated backups, and compliance with industry standards. Your data is protected with bank-level security protocols.",
      category: "Security"
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Frequently Asked <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get answers to the most common questions about our solutions, services, and implementation process.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100"
            >
              {/* Question Header */}
              <motion.button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                whileHover={{ backgroundColor: "rgba(249, 250, 251, 0.8)" }}
              >
                <div className="flex-1 pr-4">
                  {/* Category Badge */}
                  <div className="mb-2">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                      {faq.category}
                    </span>
                  </div>
                  {/* Question */}
                  <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                    {faq.question}
                  </h3>
                </div>

                {/* Expand/Collapse Icon */}
                <motion.div
                  animate={{ rotate: expandedIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 ml-4"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    expandedIndex === index
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </motion.div>
              </motion.button>

              {/* Answer Content */}
              <AnimatePresence>
                {expandedIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-600 leading-relaxed text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-4">Still Have Questions?</h3>
          <p className="text-xl mb-8 text-indigo-100">
            Our team is here to help you find the perfect solution for your needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow"
            >
              Contact Support
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Schedule Demo
            </motion.button>
          </div>
        </motion.div>

        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <FaPhone />,
                title: "Phone Support",
                description: "Call us for immediate assistance",
                contact: "+91 98765 43210"
              },
              {
                icon: <FaComments />,
                title: "Live Chat",
                description: "Chat with our support team",
                contact: "Available 24/7"
              },
              {
                icon: <FaEnvelope />,
                title: "Email Support",
                description: "Send us your questions",
                contact: "support@digikite.com"
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="text-3xl mb-3">{contact.icon}</div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{contact.title}</h4>
                <p className="text-gray-600 mb-2">{contact.description}</p>
                <p className="text-indigo-600 font-semibold">{contact.contact}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;