import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaQuoteLeft, FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

// Client logos configuration - can be loaded from R2 or local assets
const clientLogos = [
  { name: 'IIT Delhi', logo: '/clients/iit-delhi.png' },
  { name: 'IIT Bombay', logo: '/clients/iit-bombay.png' },
  { name: 'IIM Ahmedabad', logo: '/clients/iim-ahmedabad.png' },
  { name: 'BITS Pilani', logo: '/clients/bits-pilani.png' },
  { name: 'NIT Trichy', logo: '/clients/nit-trichy.png' },
  { name: 'VIT University', logo: '/clients/vit.png' },
  { name: 'SRM University', logo: '/clients/srm.png' },
  { name: 'Manipal University', logo: '/clients/manipal.png' },
  { name: 'Amity University', logo: '/clients/amity.png' },
  { name: 'Christ University', logo: '/clients/christ.png' },
];

const TestimonialsSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const testimonials = [
    {
      name: "Dr. Rajesh Kumar",
      role: "Alumni Secretary",
      organization: "IIT Delhi Alumni Association",
      avatar: "RK",
      rating: 5,
      text: "Guild has transformed how we manage our 15,000+ alumni network. The event management and treasury features are exceptional. Highly recommend for any educational institution.",
      highlight: "15,000+ alumni managed"
    },
    {
      name: "Priya Sharma",
      role: "President",
      organization: "Mumbai Business School Alumni",
      avatar: "PS",
      rating: 5,
      text: "The platform helped us increase event attendance by 300%. The notification system and RSVP tracking make coordination effortless. Our members love the mobile app!",
      highlight: "300% increase in engagement"
    },
    {
      name: "Ankit Patel",
      role: "IT Administrator",
      organization: "Gujarat Engineering College",
      avatar: "AP",
      rating: 5,
      text: "Setting up Guild was incredibly smooth. The multi-tenant architecture means each batch gets their own space while we maintain central control. Perfect for our needs.",
      highlight: "Multi-batch management"
    },
    {
      name: "Dr. Meera Reddy",
      role: "Dean of Alumni Relations",
      organization: "Bangalore Medical College",
      avatar: "MR",
      rating: 5,
      text: "The Life Link feature for blood donation coordination has literally saved lives. Our alumni community has never been more connected and engaged.",
      highlight: "Life-saving feature"
    },
    {
      name: "Rahul Gupta",
      role: "Treasurer",
      organization: "Kolkata University Alumni",
      avatar: "RG",
      rating: 5,
      text: "Managing dues and tracking finances used to be a nightmare. Guild's treasury module gives us complete visibility and the payment integration is seamless.",
      highlight: "Seamless payments"
    },
    {
      name: "Prof. Sarah Singh",
      role: "Alumni Coordinator",
      organization: "Chennai Arts College",
      avatar: "SS",
      rating: 5,
      text: "The photo album feature is perfect for preserving our college memories. Combined with the social feed, it keeps our alumni engaged and nostalgic.",
      highlight: "Memory preservation"
    }
  ];

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      const newScrollLeft = direction === 'left'
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      checkScrollButtons();
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

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
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="relative py-12 lg:py-16 bg-[#0a0a0f] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[300px] h-[300px] bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-12"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-full mb-6">
            <HiSparkles className="text-green-400" />
            <span className="text-sm font-medium text-green-300">Loved by Organizations</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Leading Institutions</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto">
            See why hundreds of alumni associations and educational institutions choose Guild for their community management.
          </motion.p>
        </motion.div>

        {/* Client Logo Marquee */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mb-16"
        >
          <div className="relative overflow-hidden py-8">
            {/* Gradient Overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10 pointer-events-none" />

            {/* Scrolling Container */}
            <div className="flex animate-marquee">
              {/* First set of logos */}
              {clientLogos.map((client, index) => (
                <div
                  key={`logo-1-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                >
                  <div className="w-32 h-16 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10 hover:border-white/20 transition-all">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        // Fallback to text if image doesn't exist
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-text')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'fallback-text text-gray-400 text-sm font-medium whitespace-nowrap';
                          fallback.textContent = client.name;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {clientLogos.map((client, index) => (
                <div
                  key={`logo-2-${index}`}
                  className="flex-shrink-0 mx-8 flex items-center justify-center"
                >
                  <div className="w-32 h-16 flex items-center justify-center bg-white/5 rounded-xl border border-white/10 px-4 py-2 hover:bg-white/10 hover:border-white/20 transition-all">
                    <img
                      src={client.logo}
                      alt={client.name}
                      className="max-w-full max-h-full object-contain filter brightness-0 invert opacity-60 hover:opacity-100 transition-opacity"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-text')) {
                          const fallback = document.createElement('span');
                          fallback.className = 'fallback-text text-gray-400 text-sm font-medium whitespace-nowrap';
                          fallback.textContent = client.name;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll Controls */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="flex justify-center gap-3 mb-8"
        >
          <motion.button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            whileHover={{ scale: canScrollLeft ? 1.05 : 1 }}
            whileTap={{ scale: canScrollLeft ? 0.95 : 1 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canScrollLeft
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
            }`}
          >
            <FaChevronLeft />
          </motion.button>
          <motion.button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            whileHover={{ scale: canScrollRight ? 1.05 : 1 }}
            whileTap={{ scale: canScrollRight ? 0.95 : 1 }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              canScrollRight
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
            }`}
          >
            <FaChevronRight />
          </motion.button>
        </motion.div>

        {/* Testimonials Scroll Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="flex-shrink-0 w-[380px] bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-2xl p-6 border border-white/10 hover:border-green-500/30 transition-all duration-300 group"
              >
                {/* Quote Icon */}
                <div className="mb-4">
                  <FaQuoteLeft className="text-2xl text-green-500/30" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-sm" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-gray-300 leading-relaxed mb-6 min-h-[120px]">
                  "{testimonial.text}"
                </blockquote>

                {/* Highlight Badge */}
                <div className="mb-6">
                  <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                    {testimonial.highlight}
                  </span>
                </div>

                {/* Client Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{testimonial.name}</h4>
                    <p className="text-sm text-green-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.organization}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Social Proof Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8 lg:p-12"
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Organizations' },
              { value: '2M+', label: 'Alumni Managed' },
              { value: '50K+', label: 'Events Hosted' },
              { value: '₹10Cr+', label: 'Transactions Processed' },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
