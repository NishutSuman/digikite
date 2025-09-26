import React from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaLightbulb, FaHandshake, FaRocket, FaGraduationCap, FaBook, FaCode, FaHeart } from 'react-icons/fa';
import Layout from '../components/layout/Layout';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: <FaLightbulb className="text-3xl text-yellow-600" />,
      title: "Innovation",
      description: "We constantly push boundaries to deliver cutting-edge solutions that transform how communities and institutions operate."
    },
    {
      icon: <FaHandshake className="text-3xl text-blue-600" />,
      title: "Trust",
      description: "Building lasting relationships through transparency, reliability, and consistent delivery of exceptional results."
    },
    {
      icon: <FaUsers className="text-3xl text-green-600" />,
      title: "Community",
      description: "Empowering communities and educational institutions to thrive through technology and collaborative solutions."
    },
    {
      icon: <FaRocket className="text-3xl text-purple-600" />,
      title: "Excellence",
      description: "Striving for perfection in every project, ensuring our clients receive world-class products and services."
    }
  ];

  const team = [
    {
      name: "Rajesh Kumar",
      role: "CEO & Founder",
      description: "15+ years in EdTech and community management solutions"
    },
    {
      name: "Priya Sharma",
      role: "CTO",
      description: "Expert in scalable software architecture and cloud technologies"
    },
    {
      name: "Dr. Ankit Patel",
      role: "Head of Product",
      description: "PhD in Computer Science with focus on digital library systems"
    },
    {
      name: "Meera Singh",
      role: "Head of Customer Success",
      description: "Specialist in client onboarding and training programs"
    }
  ];

  const stats = [
    { number: "1000+", label: "Communities Served" },
    { number: "150+", label: "Educational Institutions" },
    { number: "2M+", label: "Users Empowered" },
    { number: "99.9%", label: "Client Satisfaction" }
  ];

  const milestones = [
    { year: "2018", title: "Company Founded", description: "DigiKite was founded with a mission to digitize communities" },
    { year: "2019", title: "First Product Launch", description: "Launched Guild Platform for community management" },
    { year: "2021", title: "e-Lib System", description: "Introduced comprehensive digital library management solution" },
    { year: "2023", title: "1000+ Communities", description: "Reached milestone of serving over 1000 communities" },
    { year: "2024", title: "AI Integration", description: "Integrated AI-powered features across all platforms" }
  ];

  return (
    <Layout>
      <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DigiKite</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Empowering communities and educational institutions through innovative digital solutions.
                We believe technology should bring people together, not divide them.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid md:grid-cols-4 gap-8 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center bg-white rounded-2xl p-6 shadow-lg"
                >
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  To bridge the digital divide in communities and educational institutions across India by providing
                  innovative, user-friendly, and affordable technology solutions that enhance collaboration,
                  learning, and growth.
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  We envision a future where every community and educational institution has access to powerful
                  digital tools that enable them to thrive in the modern world while preserving their unique
                  identity and values.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl p-8 flex items-center justify-center h-96"
              >
                <div className="text-center">
                  <FaHeart className="text-8xl text-blue-600 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700">Built with passion for communities</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                The principles that guide every decision we make and every solution we build
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="mb-6 flex justify-center">{value.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Journey</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Key milestones that shaped DigiKite into the company we are today
              </p>
            </motion.div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white max-w-md ${index % 2 === 0 ? 'mr-4' : 'ml-4'}`}>
                    <div className="text-2xl font-bold mb-2">{milestone.year}</div>
                    <h3 className="text-xl font-bold mb-3">{milestone.title}</h3>
                    <p className="text-blue-100">{milestone.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-6">Meet Our Leadership Team</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Experienced professionals dedicated to transforming communities through technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
                >
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl font-bold">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <div className="text-blue-200 font-medium mb-4">{member.role}</div>
                  <p className="text-blue-100 text-sm">{member.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Transform Your Community?</h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join thousands of communities and educational institutions that trust DigiKite
                to power their digital transformation journey.
              </p>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:shadow-xl transition-shadow"
              >
                Get Started Today
                <FaRocket className="ml-2" />
              </motion.a>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;