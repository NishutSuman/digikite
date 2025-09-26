import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/landing/HeroSection';
import ProductsSection from '../components/landing/ProductsSection';
import ServicesSection from '../components/landing/ServicesSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/landing/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Products Showcase */}
      <ProductsSection />

      {/* Services Overview */}
      <ServicesSection />

      {/* Client Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;