import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import ClientLogoMarquee from '../components/landing/ClientLogoMarquee';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import Footer from '../components/landing/Footer';
import { PlansProvider } from '../contexts/PlansContext';

const LandingPage: React.FC = () => {
  return (
    <PlansProvider>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Hero Section - Guild as main product */}
        <HeroSection />

        {/* Client Logo Marquee - Trusted Organizations */}
        <ClientLogoMarquee />

        {/* Features Section - Guild capabilities */}
        <FeaturesSection />

        {/* How It Works - Setup process */}
        <HowItWorksSection />

        {/* Pricing Section - Subscription plans */}
        <PricingSection />

        {/* Client Testimonials */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Footer */}
        <Footer />
      </div>
    </PlansProvider>
  );
};

export default LandingPage;
