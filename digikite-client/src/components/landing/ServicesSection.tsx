import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCode, FaRocket, FaGraduationCap } from 'react-icons/fa';

const ServicesSection: React.FC = () => {
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

  const services = [
    {
      icon: <FaCode />,
      title: 'Custom Software Development',
      description: 'Tailored software solutions designed specifically for your business needs and requirements.',
      features: [
        'Web Applications',
        'Mobile App Development',
        'Desktop Solutions',
        'API Development',
        'Database Design',
        'Cloud Integration'
      ],
      color: 'from-blue-600 to-cyan-600',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-100 hover:border-blue-200'
    },
    {
      icon: <FaRocket />,
      title: 'Digital Transformation',
      description: 'Modernize your business processes and workflows with cutting-edge digital solutions.',
      features: [
        'Process Automation',
        'Digital Strategy Consulting',
        'Legacy System Migration',
        'Workflow Optimization',
        'Technology Assessment',
        'Change Management'
      ],
      color: 'from-purple-600 to-violet-600',
      bgGradient: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-100 hover:border-purple-200'
    },
    {
      icon: <FaGraduationCap />,
      title: 'Implementation & Training',
      description: 'Complete on-site setup, training, and ongoing support to ensure successful adoption.',
      features: [
        'On-site Setup Service',
        'Staff Training Programs',
        'Technical Documentation',
        '24/7 Technical Support',
        'Performance Monitoring',
        'Continuous Updates'
      ],
      color: 'from-emerald-600 to-teal-600',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-100 hover:border-emerald-200'
    }
  ];

  return (
    <section id="services" className="py-24 bg-gradient-to-br from-gray-50 to-slate-50">
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
            Our <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive technology services to transform your business and drive growth through innovation
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid lg:grid-cols-3 gap-8"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
              className="group relative"
            >
              <div className={`bg-gradient-to-br ${service.bgGradient} rounded-3xl p-8 h-full border ${service.borderColor} transition-all duration-300 hover:shadow-2xl`}>
                {/* Service Icon */}
                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* Features List */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">What We Offer</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-600">
                        <div className={`w-2 h-2 bg-gradient-to-r ${service.color} rounded-full mr-3`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full bg-gradient-to-r ${service.color} text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow`}
                >
                  Learn More
                </motion.button>

                {/* Decorative Elements */}
                <div className={`absolute top-6 right-6 w-20 h-20 bg-gradient-to-r ${service.color} opacity-10 rounded-full blur-xl`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Process Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Our Process</h3>
            <p className="text-lg text-gray-600">Simple, transparent, and results-driven approach</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Discovery', desc: 'Understanding your needs and goals' },
              { step: '02', title: 'Planning', desc: 'Creating detailed project roadmap' },
              { step: '03', title: 'Development', desc: 'Building your solution with precision' },
              { step: '04', title: 'Support', desc: 'Ongoing maintenance and optimization' }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{process.step}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{process.title}</h4>
                <p className="text-gray-600">{process.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 lg:p-12 text-white"
        >
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
          <p className="text-xl mb-8 text-indigo-100">
            Let's discuss how our services can help you achieve your goals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold text-lg hover:shadow-lg transition-shadow"
            >
              Schedule Consultation
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold text-lg hover:bg-white hover:text-indigo-600 transition-colors"
            >
              View Portfolio
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;