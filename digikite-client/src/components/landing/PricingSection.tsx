import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaCheck, FaArrowRight, FaStar, FaRocket, FaBuilding } from 'react-icons/fa';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { openAuthModal } from '../../slices/authSlice';
import { selectPlan, setFlowStep } from '../../slices/subscriptionSlice';
import { usePlans } from '../../contexts/PlansContext';
import type { SubscriptionPlan } from '../../types/admin';

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: React.ElementType;
  color: string;
  gradient: string;
  popular?: boolean;
  features: string[];
  cta: string;
  memberLimit: string;
  hasTrial?: boolean;
}

// Static Enterprise plan - always shown as the 3rd card
const enterprisePlan: PricingPlan = {
  name: 'Enterprise',
  description: 'For large institutions with custom requirements',
  monthlyPrice: 0,
  yearlyPrice: 0,
  icon: FaBuilding,
  color: 'purple',
  gradient: 'from-purple-500 to-pink-500',
  memberLimit: 'Unlimited members',
  features: [
    'Everything in Professional',
    'Unlimited members',
    'Multiple sub-organizations',
    'White-label solution',
    'Custom integrations',
    'Dedicated account manager',
    'SLA guarantee',
    'On-premise deployment option',
    '24/7 premium support',
  ],
  cta: 'Contact Sales',
  hasTrial: false,
};

// Default plans to show while loading or if API fails
// These match the seed data in the database
const defaultPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for small alumni associations and community groups',
    monthlyPrice: 2999,
    yearlyPrice: 29999,
    icon: FaStar,
    color: 'blue',
    gradient: 'from-blue-500 to-cyan-500',
    memberLimit: 'Up to 500 members',
    features: [
      'Events & RSVPs',
      'Community posts',
      'Alumni directory',
      'Direct messaging',
      'Photo albums',
      'Polls & surveys',
      '7-day free trial',
    ],
    cta: 'Get Started',
    hasTrial: false,
  },
  {
    name: 'Professional',
    description: 'Ideal for growing organizations with advanced needs',
    monthlyPrice: 5999,
    yearlyPrice: 59999,
    icon: FaRocket,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500',
    popular: true,
    memberLimit: 'Up to 2,000 members',
    features: [
      'Everything in Starter',
      'Treasury management',
      'Merchandise store',
      'Custom branding',
      'Priority support',
      '7-day free trial',
    ],
    cta: 'Get Started',
    hasTrial: false,
  },
];

// Map API plan to our PricingPlan format
const mapApiPlanToPricingPlan = (apiPlan: SubscriptionPlan, index: number): PricingPlan => {
  const isFirstPlan = index === 0;

  return {
    name: apiPlan.name,
    description: apiPlan.description || (isFirstPlan
      ? 'Perfect for small alumni groups getting started'
      : 'For growing organizations with advanced needs'),
    monthlyPrice: apiPlan.monthlyPrice || apiPlan.priceMonthly || 0,
    yearlyPrice: apiPlan.yearlyPrice || apiPlan.priceYearly || 0,
    icon: isFirstPlan ? FaStar : FaRocket,
    color: isFirstPlan ? 'blue' : 'indigo',
    gradient: isFirstPlan ? 'from-blue-500 to-cyan-500' : 'from-indigo-500 to-purple-500',
    popular: apiPlan.isPopular || !isFirstPlan,
    memberLimit: `Up to ${apiPlan.maxUsers.toLocaleString()} members`,
    features: apiPlan.features || [],
    cta: 'Get Started', // Always "Get Started" - free trial is separate flow
    hasTrial: false, // Plan cards always require payment
  };
};

const PricingSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isYearly, setIsYearly] = useState(true);
  const { plans: rawApiPlans } = usePlans();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  // Map API plans to display format, memoized
  const apiPlans = useMemo(() => {
    if (rawApiPlans.length >= 2) {
      return rawApiPlans.slice(0, 2).map((plan, idx) =>
        mapApiPlanToPricingPlan(plan, idx)
      );
    }
    return defaultPlans;
  }, [rawApiPlans]);

  // Combine API plans (first 2) with static Enterprise plan
  const plans: PricingPlan[] = [...apiPlans, enterprisePlan];

  // Handle plan selection - triggers subscription flow with PAYMENT required
  const handlePlanSelect = (planName: string, index: number) => {
    if (planName === 'Enterprise') {
      window.location.href = '/contact';
      return;
    }

    // Find the raw API plan data
    const rawPlan = rawApiPlans[index];
    if (!rawPlan) {
      // Fallback to auth modal if no raw plan data
      dispatch(openAuthModal('register'));
      return;
    }

    const billingCycle = isYearly ? 'YEARLY' : 'MONTHLY';
    const amount = isYearly
      ? (rawPlan.yearlyPrice || rawPlan.priceYearly || 0)
      : (rawPlan.monthlyPrice || rawPlan.priceMonthly || 0);

    // Dispatch selectPlan action - this opens the subscription modal
    // isFreeTrial is ALWAYS false from plan cards - payment is required
    dispatch(selectPlan({
      plan: rawPlan,
      billingCycle,
      amount,
      isFreeTrial: false, // Plan cards always require payment
    }));

    // If user is already logged in, skip to organization step
    if (user) {
      dispatch(setFlowStep('organization'));
    } else {
      // Show auth first
      dispatch(setFlowStep('auth'));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Custom';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="pricing" className="relative py-12 lg:py-16 bg-[#0a0a0f] overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-[100px]" />
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
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-full mb-6">
            <HiSparkles className="text-indigo-400" />
            <span className="text-sm font-medium text-indigo-300">Simple, Transparent Pricing</span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Guild Plan</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
            Start with a 14-day free trial. No credit card required. Scale as your community grows.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div variants={itemVariants} className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-white' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-16 h-8 bg-[#1a1a24] rounded-full border border-white/10 transition-colors"
            >
              <motion.div
                animate={{ x: isYearly ? 32 : 4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-white' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                Save 17%
              </span>
            )}
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-3xl border transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-br from-[#1a1a24] to-[#12121a] border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                  : 'bg-[#12121a] border-white/10 hover:border-white/20'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-sm font-medium shadow-lg shadow-indigo-500/30">
                    <HiLightningBolt className="text-yellow-300" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${plan.gradient} rounded-xl flex items-center justify-center`}>
                    <plan.icon className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-500">{plan.memberLimit}</p>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthlyPrice === 0 ? (
                    <div className="text-4xl font-bold text-white">Custom</div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">
                          {formatPrice(isYearly ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice)}
                        </span>
                        <span className="text-gray-500">/month</span>
                      </div>
                      {isYearly && (
                        <p className="text-sm text-gray-500 mt-1">
                          Billed {formatPrice(plan.yearlyPrice)} yearly
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlanSelect(plan.name, index)}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.cta}
                  <FaArrowRight className="text-sm" />
                </motion.button>

                {/* Features List */}
                <div className="mt-8 space-y-4">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">What's included</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 text-sm">
                        <FaCheck className={`mt-0.5 flex-shrink-0 ${plan.popular ? 'text-indigo-400' : 'text-green-400'}`} />
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="mt-16 text-center"
        >
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-[#1a1a24] to-[#12121a] border border-white/10 rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Not sure which plan is right for you?
            </h3>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Schedule a free demo with our team. We'll help you understand which plan best fits your organization's needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all"
              >
                Schedule a Demo
                <FaArrowRight />
              </motion.a>
              <motion.a
                href="/about"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
              >
                Learn More About Guild
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
