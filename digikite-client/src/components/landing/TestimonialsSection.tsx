import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaGraduationCap, FaUsers, FaChartLine, FaBolt } from 'react-icons/fa';

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
      role: "Principal",
      organization: "Delhi Public School",
      rating: 5,
      text: "DigiKite's e-Lib solution completely transformed our library management. The on-site setup and training were exceptional. Our students and staff love the new digital system.",
      category: "Education"
    },
    {
      name: "Priya Sharma",
      role: "Secretary",
      organization: "Mumbai Alumni Association",
      rating: 5,
      text: "The Guild platform helped us manage our 1500 members effortlessly. Event planning, communication, and member tracking became so much easier. Highly recommended!",
      category: "Community"
    },
    {
      name: "Mr. Ankit Patel",
      role: "IT Director",
      organization: "Gujarat Engineering College",
      rating: 5,
      text: "Outstanding technical support and custom development. DigiKite understood our unique requirements and delivered exactly what we needed. Professional team!",
      category: "Technical"
    },
    {
      name: "Dr. Meera Reddy",
      role: "Librarian",
      organization: "Bangalore Medical College",
      rating: 5,
      text: "The digital catalog management system streamlined our entire workflow. The staff training was comprehensive, and the ongoing support is excellent.",
      category: "Healthcare Education"
    },
    {
      name: "Rahul Gupta",
      role: "President",
      organization: "Kolkata Business Club",
      rating: 5,
      text: "Guild platform's event coordination and member management features are fantastic. Our community engagement has increased significantly since implementation.",
      category: "Business"
    },
    {
      name: "Prof. Sarah Singh",
      role: "Head of Department",
      organization: "Chennai Arts College",
      rating: 5,
      text: "The custom software solution developed by DigiKite perfectly fits our academic requirements. The team's attention to detail is impressive.",
      category: "Arts Education"
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
      const scrollAmount = 320;
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ⭐
      </span>
    ));
  };

  return (
    <section className="py-24 bg-white">
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
            What Our <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Clients Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trusted by educational institutions and communities across India. Here's what they have to say about our solutions.
          </p>
        </motion.div>

        {/* Testimonials Scroll Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Scroll Buttons */}
          <div className="flex justify-center mb-8 gap-4">
            <motion.button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              whileHover={{ scale: canScrollLeft ? 1.05 : 1 }}
              whileTap={{ scale: canScrollLeft ? 0.95 : 1 }}
              className={`p-3 rounded-full transition-all ${
                canScrollLeft
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              whileHover={{ scale: canScrollRight ? 1.05 : 1 }}
              whileTap={{ scale: canScrollRight ? 0.95 : 1 }}
              className={`p-3 rounded-full transition-all ${
                canScrollRight
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>

          {/* Horizontal Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="flex-shrink-0 w-80 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300 group"
              >
                {/* Client Info */}
                <div className="flex items-center mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-emerald-600 font-medium">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.organization}</p>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mb-3">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    {testimonial.category}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-gray-600 leading-relaxed mb-4 italic">
                  "{testimonial.text}"
                </blockquote>

                {/* Quote Icon */}
                <div className="flex justify-end">
                  <svg className="w-8 h-8 text-emerald-200 group-hover:text-emerald-300 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 lg:p-12 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-2">Trusted by Leading Institutions</h3>
            <p className="text-emerald-100">Our impact across different sectors</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: '150+', label: 'Educational Institutions', icon: <FaGraduationCap /> },
              { number: '500+', label: 'Community Organizations', icon: <FaUsers /> },
              { number: '50K+', label: 'Active Users', icon: <FaChartLine /> },
              { number: '99.9%', label: 'Uptime Guarantee', icon: <FaBolt /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2 flex justify-center">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-emerald-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;