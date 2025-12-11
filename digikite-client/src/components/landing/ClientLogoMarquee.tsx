import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ClientLogoMarquee: React.FC = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  // Client logos - 7 available (URL encoded for spaces in filenames)
  const clientLogos = [
    { src: '/clients/JAAJ%20Logo.png', alt: 'JAAJ' },
    { src: '/clients/JKPAA.png', alt: 'JKPAA' },
    { src: '/clients/JNV%20Bagudi.jpg', alt: 'JNV Bagudi' },
    { src: '/clients/NABAKRUSHNA-CHOUDHURY-COLLEGE-OF-TEACHER-EDUCATION-logo-1-300x242-1.png', alt: 'NCCTE' },
    { src: '/clients/Naao-Logo.png', alt: 'Naao' },
    { src: '/clients/jnaab_logo.jpg', alt: 'JNAAB' },
    { src: '/clients/odisha-sasan-logo.jpeg', alt: 'Odisha Sasan' },
  ];

  // Duplicate logos for seamless infinite scroll
  const duplicatedLogos = [...clientLogos, ...clientLogos, ...clientLogos];

  return (
    <section ref={ref} className="relative py-10 lg:py-12 bg-[#0a0a0f] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            Trusted by Leading{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Organizations
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join the growing community of educational institutions and alumni associations transforming their engagement with Guild.
          </p>
        </motion.div>

        {/* Logo Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Gradient Fade Edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

          {/* Marquee Container */}
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center gap-12"
              animate={{
                x: [0, -100 * clientLogos.length],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: 'loop',
                  duration: 30,
                  ease: 'linear',
                },
              }}
            >
              {duplicatedLogos.map((logo, index) => (
                <div
                  key={`${logo.alt}-${index}`}
                  className="flex-shrink-0 w-40 h-24 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="max-w-full max-h-full object-contain filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Below Marquee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8"
        >
          {[
            { value: '500+', label: 'Organizations' },
            { value: '2M+', label: 'Alumni Connected' },
            { value: '50K+', label: 'Events Hosted' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <div className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ClientLogoMarquee;
