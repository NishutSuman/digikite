import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaUserPlus, FaCogs, FaRocket, FaChartLine } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { selectPlan, setFlowStep } from '../../slices/subscriptionSlice';
import { usePlans } from '../../contexts/PlansContext';

const HowItWorksSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { plans } = usePlans();
  const essentialPlan = plans.length > 0 ? plans[0] : null;
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Handle free trial click - Essential plan, no payment required
  const handleFreeTrialClick = () => {
    if (!essentialPlan) {
      // Scroll to pricing section if plan not loaded
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Select Essential plan with yearly billing (best value) and free trial
    const amount = essentialPlan.yearlyPrice || essentialPlan.priceYearly || 0;

    dispatch(selectPlan({
      plan: essentialPlan,
      billingCycle: 'YEARLY',
      amount,
      isFreeTrial: true, // Free trial - no payment required
    }));

    // If user is logged in, skip to organization step
    if (user) {
      dispatch(setFlowStep('organization'));
    } else {
      dispatch(setFlowStep('auth'));
    }
  };

  // Handle select plan click - scrolls to pricing section
  const handleSelectPlanClick = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      step: '01',
      icon: FaUserPlus,
      title: 'Sign Up & Setup',
      description: 'Create your organization account in minutes. Add your branding, configure settings, and invite your team.',
      color: 'blue',
    },
    {
      step: '02',
      icon: FaCogs,
      title: 'Import Members',
      description: 'Bulk import alumni data from Excel or CSV. Our smart system auto-organizes by batch, department, and year.',
      color: 'purple',
    },
    {
      step: '03',
      icon: FaRocket,
      title: 'Launch Platform',
      description: 'Go live with your branded alumni portal. Members get instant access via web and mobile apps.',
      color: 'green',
    },
    {
      step: '04',
      icon: FaChartLine,
      title: 'Grow & Engage',
      description: 'Track engagement, host events, manage finances, and build a thriving alumni community.',
      color: 'orange',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    blue: { bg: 'from-blue-500/20 to-blue-500/5', text: 'text-blue-400', border: 'border-blue-500/30', glow: 'shadow-blue-500/20' },
    purple: { bg: 'from-purple-500/20 to-purple-500/5', text: 'text-purple-400', border: 'border-purple-500/30', glow: 'shadow-purple-500/20' },
    green: { bg: 'from-green-500/20 to-green-500/5', text: 'text-green-400', border: 'border-green-500/30', glow: 'shadow-green-500/20' },
    orange: { bg: 'from-orange-500/20 to-orange-500/5', text: 'text-orange-400', border: 'border-orange-500/30', glow: 'shadow-orange-500/20' },
  };

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
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full mb-6">
            <HiSparkles className="text-purple-400" />
            <span className="text-sm font-medium text-purple-300">Simple Setup</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Get Started in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">4 Easy Steps</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto">
            Launch your alumni platform in days, not months. Our streamlined onboarding process gets you up and running quickly.
          </motion.p>
        </motion.div>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="relative"
        >
          {/* Connection Line - removed as cards are redesigned */}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const colors = colorClasses[step.color];
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="relative"
                >
                  {/* Card */}
                  <div className={`bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all h-full`}>
                    {/* Step Number & Icon Row */}
                    <div className="flex items-center gap-4 mb-4">
                      {/* Step Number */}
                      <div className={`w-10 h-10 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-full flex items-center justify-center ${colors.text} font-bold text-sm shadow-lg ${colors.glow} flex-shrink-0`}>
                        {step.step}
                      </div>
                      {/* Icon */}
                      <div className={`w-12 h-12 bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <step.icon className={`text-xl ${colors.text}`} />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{step.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="text-center mt-12 relative z-20"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button
              onClick={handleFreeTrialClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-green-500/20 hover:shadow-green-500/30 transition-all"
            >
              Start Free Trial
            </motion.button>
            <motion.button
              onClick={handleSelectPlanClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-2xl font-semibold text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/30 transition-all"
            >
              Select Your Plan
            </motion.button>
          </div>
          <p className="mt-4 text-gray-500 text-sm">14-day free trial available. No credit card required for trial.</p>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
