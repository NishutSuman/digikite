import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaUsers, FaLightbulb, FaHandshake, FaRocket, FaHeart, FaArrowRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import Layout from '../components/layout/Layout';

const AboutPage: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const values = [
    { icon: FaLightbulb, title: "Innovation", description: "We constantly push boundaries to deliver cutting-edge solutions that transform how communities and institutions operate.", color: "yellow" },
    { icon: FaHandshake, title: "Trust", description: "Building lasting relationships through transparency, reliability, and consistent delivery of exceptional results.", color: "blue" },
    { icon: FaUsers, title: "Community", description: "Empowering communities and educational institutions to thrive through technology and collaborative solutions.", color: "green" },
    { icon: FaRocket, title: "Excellence", description: "Striving for perfection in every project, ensuring our clients receive world-class products and services.", color: "purple" }
  ];

  const team = [
    { name: "Rajesh Kumar", role: "CEO & Founder", description: "15+ years in EdTech and community management solutions" },
    { name: "Priya Sharma", role: "CTO", description: "Expert in scalable software architecture and cloud technologies" },
    { name: "Dr. Ankit Patel", role: "Head of Product", description: "PhD in Computer Science with focus on digital library systems" },
    { name: "Meera Singh", role: "Head of Customer Success", description: "Specialist in client onboarding and training programs" }
  ];

  const stats = [
    { number: "500+", label: "Organizations" },
    { number: "2M+", label: "Alumni Managed" },
    { number: "50K+", label: "Events Hosted" },
    { number: "99.9%", label: "Uptime" }
  ];

  const milestones = [
    { year: "2020", title: "Company Founded", description: "DigiKite was founded with a mission to digitize alumni communities" },
    { year: "2021", title: "Guild Launch", description: "Launched Guild Platform - India's first emerging alumni workspace" },
    { year: "2022", title: "Mobile Apps", description: "Released native iOS and Android apps for Guild" },
    { year: "2023", title: "500+ Organizations", description: "Reached milestone of serving over 500 communities" },
    { year: "2024", title: "Multi-tenant Launch", description: "Launched enterprise multi-tenant architecture" }
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string }> = {
    yellow: { bg: 'from-yellow-500/20 to-yellow-500/5', text: 'text-yellow-400', border: 'border-yellow-500/20' },
    blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/20' },
    green: { bg: 'from-green-500/20 to-green-500/5', text: 'text-green-400', border: 'border-green-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/20' },
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
          {/* Hero Section */}
          <motion.div
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full mb-6">
              <HiSparkles className="text-blue-400" />
              <span className="text-sm font-medium text-blue-300">Our Story</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">DigiKite</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Empowering communities and educational institutions through innovative digital solutions.
              We believe technology should bring people together, not divide them.
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className="grid md:grid-cols-4 gap-6 mb-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-2xl border border-white/10 p-6 text-center hover:border-white/20 transition-all"
              >
                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">{stat.number}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Mission Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-12 items-center mb-20"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                To bridge the digital divide in communities and educational institutions across India by providing
                innovative, user-friendly, and affordable technology solutions that enhance collaboration,
                learning, and growth.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We envision a future where every community and educational institution has access to powerful
                digital tools that enable them to thrive in the modern world while preserving their unique
                identity and values.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 rounded-3xl p-8 flex items-center justify-center h-80"
            >
              <div className="text-center">
                <FaHeart className="text-7xl text-blue-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-300">Built with passion for communities</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Our Core Values</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The principles that guide every decision we make and every solution we build
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => {
                const colors = colorClasses[value.color];
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className={`bg-gradient-to-br ${colors.bg} rounded-2xl border ${colors.border} p-6 text-center hover:border-opacity-50 transition-all`}
                  >
                    <div className={`w-14 h-14 mx-auto mb-4 bg-[#0a0a0f] rounded-xl flex items-center justify-center ${colors.text} border ${colors.border}`}>
                      <value.icon className="text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-3">{value.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Timeline Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-20"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Our Journey</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Key milestones that shaped DigiKite into the company we are today
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-cyan-500/50" />

              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={`flex items-center ${index % 2 === 0 ? 'lg:justify-start' : 'lg:justify-end'}`}
                  >
                    <div className={`relative bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-2xl border border-white/10 p-6 max-w-md hover:border-white/20 transition-all ${index % 2 === 0 ? 'lg:mr-auto lg:ml-0' : 'lg:ml-auto lg:mr-0'}`}>
                      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2">{milestone.year}</div>
                      <h3 className="text-lg font-semibold text-white mb-2">{milestone.title}</h3>
                      <p className="text-gray-400 text-sm">{milestone.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-3xl p-8 lg:p-12 mb-20"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Meet Our Leadership Team</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Experienced professionals dedicated to transforming communities through technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center hover:border-white/20 transition-all"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl font-bold text-white">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{member.name}</h3>
                  <div className="text-blue-400 font-medium text-sm mb-3">{member.role}</div>
                  <p className="text-gray-500 text-sm">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#1a1a24] to-[#12121a] border border-white/10 rounded-3xl p-8 lg:p-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to Transform Your Community?</h2>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of communities and educational institutions that trust DigiKite
                to power their digital transformation journey.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Get Started Today
                <FaArrowRight />
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage;