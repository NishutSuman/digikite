import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaLinkedin, FaTwitter, FaPaperPlane, FaInstagram, FaCheckCircle } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Layout from '../components/layout/Layout';
import api from '../utils/api';

const ContactPage: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Reset status when user starts typing again
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      await api.post('/contact/submit', formData);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', organization: '', subject: '', message: '' });
    } catch (error: any) {
      setSubmitStatus('error');
      setErrorMessage(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    { icon: <FaPhone className="text-2xl" />, title: "Phone Support", details: "+91 98765 43210", subtitle: "Mon-Fri, 9 AM - 6 PM IST", color: "blue" },
    { icon: <FaEnvelope className="text-2xl" />, title: "Email Support", details: "hello@digikite.com", subtitle: "We respond within 24 hours", color: "green" },
    { icon: <FaMapMarkerAlt className="text-2xl" />, title: "Our Office", details: "Bangalore, Karnataka", subtitle: "India - 560001", color: "purple" },
    { icon: <FaClock className="text-2xl" />, title: "Business Hours", details: "Mon - Fri: 9 AM - 6 PM", subtitle: "Weekend support available", color: "orange" }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'from-green-500/20 to-green-500/5', text: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20' },
    orange: { bg: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/20' },
  };

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-20">
          {/* Header */}
          <motion.div ref={ref} variants={containerVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-16">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full mb-6">
              <HiSparkles className="text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Let's Connect</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Touch</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto">
              Have questions about Guild or need help getting started? We're here to help you succeed.
            </motion.p>
          </motion.div>

          {/* Contact Info Cards */}
          <motion.div variants={containerVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, index) => {
              const colors = colorClasses[info.color];
              return (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className={`bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} p-6 text-center hover:border-opacity-50 transition-all`}>
                  <div className={`w-14 h-14 mx-auto mb-4 bg-[#0a0a0f] rounded-xl flex items-center justify-center ${colors.text} border ${colors.border}`}>{info.icon}</div>
                  <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                  <p className="text-white font-medium mb-1">{info.details}</p>
                  <p className="text-sm text-gray-500">{info.subtitle}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div variants={itemVariants} initial="hidden" animate={inView ? "visible" : "hidden"}
              className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-3xl border border-white/10 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      placeholder="Your full name" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email Address *</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                      placeholder="your.email@example.com" />
                  </div>
                </div>
                <div>
                  <label htmlFor="organization" className="block text-sm font-medium text-gray-300 mb-2">Organization Name</label>
                  <input type="text" id="organization" name="organization" value={formData.organization} onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                    placeholder="Your organization or institution" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject *</label>
                  <select id="subject" name="subject" value={formData.subject} onChange={handleInputChange} required
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all">
                    <option value="" className="bg-[#1a1a24]">Select a topic</option>
                    <option value="demo" className="bg-[#1a1a24]">Schedule a Demo</option>
                    <option value="pricing" className="bg-[#1a1a24]">Pricing Inquiry</option>
                    <option value="support" className="bg-[#1a1a24]">Technical Support</option>
                    <option value="partnership" className="bg-[#1a1a24]">Partnership Opportunity</option>
                    <option value="other" className="bg-[#1a1a24]">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
                  <textarea id="message" name="message" value={formData.message} onChange={handleInputChange} required rows={5}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all resize-none"
                    placeholder="Tell us more about your inquiry..." />
                </div>
                {/* Success Message */}
                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400"
                  >
                    <FaCheckCircle className="text-xl flex-shrink-0" />
                    <div>
                      <p className="font-medium">Message sent successfully!</p>
                      <p className="text-sm text-green-400/80">We'll get back to you within 24 hours.</p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
                  >
                    <p className="font-medium">{errorMessage}</p>
                  </motion.div>
                )}

                <motion.button type="submit" disabled={isSubmitting || submitStatus === 'success'} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (<><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>) : submitStatus === 'success' ? (<><FaCheckCircle />Sent!</>) : (<>Send Message<FaPaperPlane /></>)}
                </motion.button>
              </form>
            </motion.div>

            {/* Right Column */}
            <motion.div variants={containerVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="space-y-8">
              <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-3xl border border-white/10 p-8">
                <h3 className="text-xl font-bold text-white mb-6">Need Immediate Help?</h3>
                <div className="space-y-4">
                  <a href="tel:+919876543210" className="flex items-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-colors">
                    <FaPhone className="text-blue-400 mr-4 text-xl" />
                    <div><div className="font-medium text-white">Call us directly</div><div className="text-sm text-gray-400">For urgent technical support</div></div>
                  </a>
                  <a href="mailto:support@digikite.com" className="flex items-center p-4 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition-colors">
                    <FaEnvelope className="text-green-400 mr-4 text-xl" />
                    <div><div className="font-medium text-white">Email Support</div><div className="text-sm text-gray-400">Response within 2 hours</div></div>
                  </a>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-4">Connect With Us</h3>
                <p className="text-gray-400 mb-6">Follow us on social media for updates, tips, and community discussions.</p>
                <div className="flex gap-3">
                  {[{ icon: <FaLinkedin />, href: '#', label: 'LinkedIn' }, { icon: <FaTwitter />, href: '#', label: 'Twitter' }, { icon: <FaInstagram />, href: '#', label: 'Instagram' }].map((social, index) => (
                    <motion.a key={index} href={social.href} whileHover={{ scale: 1.1, y: -2 }} whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 bg-white/10 border border-white/10 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/20 transition-all" aria-label={social.label}>
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-3xl border border-white/10 p-8">
                <h3 className="text-xl font-bold text-white mb-4">Frequently Asked Questions</h3>
                <p className="text-gray-400 mb-6">Check out our FAQ section for quick answers to common questions about Guild.</p>
                <a href="/#faq" className="inline-flex items-center text-blue-400 font-medium hover:text-blue-300 transition-colors">
                  View FAQ Section
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;