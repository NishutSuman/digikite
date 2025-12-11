import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaPhone, FaComments, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const FAQSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What is Guild and who is it for?",
      answer: "Guild is India's first emerging workplace platform specifically designed for alumni associations, educational institutions, and community organizations. It's perfect for groups with 500-10,000+ members who need to manage memberships, events, finances, and engagement in one unified platform.",
      category: "About Guild"
    },
    {
      question: "How does the subscription pricing work?",
      answer: "We offer three plans: Starter (₹2,999/month for up to 500 members), Professional (₹5,999/month for up to 2,000 members), and Enterprise (custom pricing for unlimited members). All plans include a 14-day free trial with no credit card required.",
      category: "Pricing"
    },
    {
      question: "Can each batch or chapter have their own space?",
      answer: "Yes! Guild's multi-tenant architecture allows you to create separate spaces for different batches, chapters, or departments while maintaining central control. Each group gets their own dashboard, members, events, and treasury.",
      category: "Features"
    },
    {
      question: "Is there a mobile app available?",
      answer: "Absolutely! Guild comes with native iOS and Android apps that include push notifications, event RSVPs, member directory access, and the social feed. Members can stay connected on the go.",
      category: "Mobile App"
    },
    {
      question: "How secure is our data?",
      answer: "Security is our top priority. We implement bank-level encryption, secure cloud hosting on AWS, regular security audits, role-based access controls, automated backups, and GDPR compliance.",
      category: "Security"
    },
    {
      question: "What payment methods are supported?",
      answer: "Guild integrates with Razorpay, supporting all major payment methods including UPI, credit/debit cards, net banking, and wallets. You can collect membership fees and event registrations directly.",
      category: "Payments"
    },
    {
      question: "How long does implementation take?",
      answer: "Most organizations are up and running within 2-4 weeks. This includes account setup, data migration from existing systems, branding customization, and admin training.",
      category: "Implementation"
    },
    {
      question: "Do you provide training and support?",
      answer: "Yes! All plans include comprehensive onboarding, video tutorials, and documentation. Professional and Enterprise plans get dedicated account managers and priority support.",
      category: "Support"
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
      transition: { duration: 0.5 },
    },
  };

  // Split FAQs into two columns
  const leftColumnFaqs = faqs.filter((_, index) => index % 2 === 0);
  const rightColumnFaqs = faqs.filter((_, index) => index % 2 !== 0);

  const FAQItem = ({ faq, index, actualIndex }: { faq: typeof faqs[0]; index: number; actualIndex: number }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-xl border transition-all duration-300 overflow-hidden ${
        expandedIndex === actualIndex ? 'border-purple-500/30' : 'border-white/10 hover:border-white/20'
      }`}
    >
      <button
        onClick={() => toggleFAQ(actualIndex)}
        className="w-full px-5 py-4 text-left flex items-start justify-between transition-colors"
      >
        <div className="flex-1 pr-3">
          <span className="inline-block px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20 mb-2">
            {faq.category}
          </span>
          <h3 className="text-base font-semibold text-white leading-snug">
            {faq.question}
          </h3>
        </div>
        <motion.div
          animate={{ rotate: expandedIndex === actualIndex ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 mt-1"
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            expandedIndex === actualIndex
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              : 'bg-white/5 text-gray-400 border border-white/10'
          }`}>
            <FaChevronDown className="text-xs" />
          </div>
        </motion.div>
      </button>
      <AnimatePresence>
        {expandedIndex === actualIndex && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              <div className="border-t border-white/10 pt-3">
                <p className="text-gray-400 leading-relaxed text-sm">
                  {faq.answer}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <section className="relative py-12 lg:py-16 bg-[#0a0a0f] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-gradient-to-r from-indigo-600/10 to-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-10"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full mb-4">
            <HiSparkles className="text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Got Questions?</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Questions</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-base text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about Guild. Can't find the answer? Reach out to our support team.
          </motion.p>
        </motion.div>

        {/* Two Column FAQ List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid lg:grid-cols-2 gap-4"
        >
          {/* Left Column */}
          <div className="space-y-4">
            {leftColumnFaqs.map((faq, index) => (
              <FAQItem key={index * 2} faq={faq} index={index} actualIndex={index * 2} />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {rightColumnFaqs.map((faq, index) => (
              <FAQItem key={index * 2 + 1} faq={faq} index={index} actualIndex={index * 2 + 1} />
            ))}
          </div>
        </motion.div>

        {/* Bottom CTA - Compact */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-10"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 lg:p-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-center lg:text-left">
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">Still Have Questions?</h3>
                <p className="text-gray-400 text-sm">
                  Our team is here to help you find the perfect solution.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-end">
                <motion.a
                  href="/contact"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/25 transition-all text-center"
                >
                  Contact Support
                </motion.a>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
                >
                  Schedule Demo
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Contact Options - Horizontal */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-8"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: <FaPhone />,
                title: "Phone Support",
                contact: "+91 98765 43210",
                color: "blue"
              },
              {
                icon: <FaComments />,
                title: "Live Chat",
                contact: "Available 24/7",
                color: "green"
              },
              {
                icon: <FaEnvelope />,
                title: "Email Support",
                contact: "support@digikite.com",
                color: "purple"
              }
            ].map((contact, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -3 }}
                className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-xl border border-white/10 hover:border-white/20 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  contact.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  contact.color === 'green' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {contact.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{contact.title}</h4>
                  <p className={`text-sm font-medium ${
                    contact.color === 'blue' ? 'text-blue-400' :
                    contact.color === 'green' ? 'text-green-400' :
                    'text-purple-400'
                  }`}>{contact.contact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
