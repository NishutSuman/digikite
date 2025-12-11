import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  HiX,
  HiCheck,
  HiSparkles,
  HiLightningBolt,
  HiOfficeBuilding,
  HiCreditCard,
  HiShieldCheck,
  HiArrowRight,
  HiCheckCircle,
} from 'react-icons/hi';
import { FaStar, FaRocket } from 'react-icons/fa';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { openAuthModal } from '../../slices/authSlice';
import {
  closeSubscriptionModal,
  setFlowStep,
  setOrganizationDetails,
  setPaymentStatus,
  resetSubscriptionFlow,
} from '../../slices/subscriptionSlice';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PlanSelectionModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { selectedPlan, isModalOpen, flowStep, organizationDetails, paymentStatus } = useAppSelector(
    (state) => state.subscription
  );

  const [orgForm, setOrgForm] = useState({
    name: '',
    shortName: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [existingOrgInfo, setExistingOrgInfo] = useState<{
    exists: boolean;
    hasActiveSubscription?: boolean;
    subscriptionStatus?: string;
  } | null>(null);

  // Update contact email when user logs in
  useEffect(() => {
    if (user?.email && !orgForm.contactEmail) {
      setOrgForm((prev) => ({ ...prev, contactEmail: user.email }));
    }
  }, [user]);

  // Look up existing organization when email changes (debounced)
  useEffect(() => {
    const lookupOrg = async () => {
      if (!orgForm.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgForm.contactEmail)) {
        setExistingOrgInfo(null);
        return;
      }

      setIsLookingUp(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/v1/payments/lookup-organization?email=${encodeURIComponent(orgForm.contactEmail)}`
        );
        const data = await response.json();

        if (data.success && data.data?.exists) {
          // Prefill form with existing organization data
          const org = data.data.organization;
          setOrgForm((prev) => ({
            ...prev,
            name: org.name || prev.name,
            shortName: org.shortName || prev.shortName,
            contactPhone: org.contactPhone || prev.contactPhone,
            address: org.address || prev.address,
          }));

          setExistingOrgInfo({
            exists: true,
            hasActiveSubscription: data.data.subscription?.status === 'ACTIVE',
            subscriptionStatus: data.data.subscription?.status,
          });
        } else {
          setExistingOrgInfo({ exists: false });
        }
      } catch (error) {
        console.error('Failed to lookup organization:', error);
        setExistingOrgInfo(null);
      } finally {
        setIsLookingUp(false);
      }
    };

    const debounceTimer = setTimeout(lookupOrg, 500);
    return () => clearTimeout(debounceTimer);
  }, [orgForm.contactEmail]);

  // When flowStep is 'auth', automatically open auth modal
  useEffect(() => {
    if (flowStep === 'auth' && !user) {
      dispatch(closeSubscriptionModal());
      dispatch(openAuthModal('register'));
    }
  }, [flowStep, user, dispatch]);

  if (!isModalOpen || !selectedPlan) {
    return null;
  }

  // Don't render if we're in auth step - the auth modal will handle it
  if (flowStep === 'auth') {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isProcessing) {
      dispatch(closeSubscriptionModal());
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleProceedToAuth = () => {
    // Close this modal and open auth modal
    dispatch(closeSubscriptionModal());
    dispatch(openAuthModal('register'));
  };

  const validateOrgForm = () => {
    const errors: Record<string, string> = {};

    if (!orgForm.name.trim()) {
      errors.name = 'Organization name is required';
    }
    if (!orgForm.shortName.trim()) {
      errors.shortName = 'Short name is required';
    } else if (orgForm.shortName.length < 2 || orgForm.shortName.length > 10) {
      errors.shortName = 'Short name must be 2-10 characters';
    }
    if (!orgForm.contactEmail.trim()) {
      errors.contactEmail = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgForm.contactEmail)) {
      errors.contactEmail = 'Invalid email format';
    }
    if (orgForm.contactPhone && !/^[+]?[\d\s-]{10,}$/.test(orgForm.contactPhone)) {
      errors.contactPhone = 'Invalid phone number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOrgFormSubmit = () => {
    if (validateOrgForm()) {
      dispatch(setOrganizationDetails(orgForm));
      dispatch(setFlowStep('payment'));
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedPlan || !organizationDetails) return;

    setIsProcessing(true);
    dispatch(setPaymentStatus('processing'));

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      // Get auth token if available
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Call backend to initiate checkout
      const checkoutResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/v1/payments/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          planId: selectedPlan.plan.id,
          billingCycle: selectedPlan.billingCycle,
          organizationDetails: {
            name: organizationDetails.name,
            shortName: organizationDetails.shortName,
            contactEmail: organizationDetails.contactEmail,
            contactPhone: organizationDetails.contactPhone,
            address: organizationDetails.address,
          },
          isFreeTrial: selectedPlan.isFreeTrial,
        }),
      });

      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        throw new Error(checkoutData.message || 'Failed to initiate checkout');
      }

      // For trial plans, redirect to success/portal
      if (selectedPlan.isFreeTrial || checkoutData.data?.isFreeTrial) {
        toast.success('Trial activated successfully!');
        dispatch(setPaymentStatus('success'));
        dispatch(setFlowStep('success'));
        setIsProcessing(false);
        return;
      }

      // For paid plans, open Razorpay with the order from backend
      const { orderId, keyId, amount, currency, planName, subscriptionId } = checkoutData.data;

      const options = {
        key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: 'DigiKite',
        description: `${planName} Plan - ${selectedPlan.billingCycle}`,
        image: '/brand/DigiKite.avif',
        order_id: orderId,
        handler: async function (response: any) {
          // Payment successful - verify with backend
          try {
            const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/v1/payments/verify-checkout`, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (!verifyResponse.ok) {
              throw new Error(verifyData.message || 'Payment verification failed');
            }

            toast.success('Payment successful! Redirecting...');
            dispatch(setPaymentStatus('success'));
            dispatch(setFlowStep('success'));
            setIsProcessing(false);

            // Redirect to subscription page after a short delay
            setTimeout(() => {
              dispatch(resetSubscriptionFlow());
              navigate(verifyData.data?.redirectUrl || '/portal/subscription');
            }, 2000);
          } catch (verifyError: any) {
            console.error('Payment verification error:', verifyError);
            toast.error(verifyError.message || 'Payment verification failed');
            setIsProcessing(false);
            dispatch(setPaymentStatus('failed'));
          }
        },
        prefill: {
          name: user?.name || '',
          email: organizationDetails.contactEmail,
          contact: organizationDetails.contactPhone,
        },
        notes: {
          organization_name: organizationDetails.name,
          subscription_id: subscriptionId,
        },
        theme: {
          color: '#4F46E5',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
            dispatch(setPaymentStatus('idle'));
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response.error);
        toast.error(response.error.description || 'Payment failed');
        setIsProcessing(false);
        dispatch(setPaymentStatus('failed'));
      });

      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment initialization failed');
      setIsProcessing(false);
      dispatch(setPaymentStatus('failed'));
    }
  };

  const handleGoToDashboard = () => {
    dispatch(resetSubscriptionFlow());
    navigate('/portal');
  };

  const renderPlanConfirmation = () => (
    <div className="space-y-6">
      {/* Plan Summary */}
      <div className="bg-gradient-to-br from-[#1a1a24] to-[#12121a] rounded-2xl border border-white/10 p-6">
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              selectedPlan.plan.name.toLowerCase().includes('essential') || selectedPlan.plan.sortOrder === 1
                ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                : 'bg-gradient-to-br from-indigo-500 to-purple-500'
            }`}
          >
            {selectedPlan.plan.name.toLowerCase().includes('essential') || selectedPlan.plan.sortOrder === 1 ? (
              <FaStar className="text-white text-xl" />
            ) : (
              <FaRocket className="text-white text-xl" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">{selectedPlan.plan.name} Plan</h3>
              {selectedPlan.isFreeTrial && (
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                  Free Trial
                </span>
              )}
            </div>
            <p className="text-gray-400 text-sm">
              Up to {selectedPlan.plan.maxUsers.toLocaleString()} members
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-baseline justify-between">
            <span className="text-gray-400">
              {selectedPlan.billingCycle === 'YEARLY' ? 'Yearly' : 'Monthly'} billing
            </span>
            <div className="text-right">
              {selectedPlan.isFreeTrial ? (
                <div>
                  <span className="text-3xl font-bold text-white">Free</span>
                  <p className="text-sm text-gray-500">for {selectedPlan.plan.trialDays || 14} days</p>
                </div>
              ) : (
                <div>
                  <span className="text-3xl font-bold text-white">{formatPrice(selectedPlan.amount)}</span>
                  <span className="text-gray-500">
                    /{selectedPlan.billingCycle === 'YEARLY' ? 'year' : 'month'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Preview */}
        {selectedPlan.plan.features && selectedPlan.plan.features.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-sm font-medium text-gray-400 mb-3">Includes:</p>
            <ul className="space-y-2">
              {selectedPlan.plan.features.slice(0, 5).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <HiCheck className="text-green-400 flex-shrink-0" />
                  {feature}
                </li>
              ))}
              {selectedPlan.plan.features.length > 5 && (
                <li className="text-sm text-gray-500">
                  +{selectedPlan.plan.features.length - 5} more features
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {user ? (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => dispatch(setFlowStep('organization'))}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
          >
            Continue
            <HiArrowRight />
          </motion.button>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleProceedToAuth}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
            >
              Sign Up to Continue
              <HiArrowRight />
            </motion.button>
            <p className="text-center text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => {
                  dispatch(closeSubscriptionModal());
                  dispatch(openAuthModal('login'));
                }}
                className="text-blue-400 hover:underline"
              >
                Sign in
              </button>
            </p>
          </>
        )}
      </div>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
        <HiShieldCheck className="text-green-400" />
        <span>Secure checkout powered by Razorpay</span>
      </div>
    </div>
  );

  const renderOrganizationForm = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl mb-4">
          <HiOfficeBuilding className="text-blue-400 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-white">Organization Details</h3>
        <p className="text-gray-400 text-sm mt-1">Tell us about your organization</p>
      </div>

      {/* Existing Organization Notice */}
      {existingOrgInfo?.exists && (
        <div className={`rounded-xl p-4 border ${
          existingOrgInfo.hasActiveSubscription
            ? 'bg-yellow-500/10 border-yellow-500/20'
            : 'bg-blue-500/10 border-blue-500/20'
        }`}>
          <div className="flex items-start gap-3">
            <HiCheckCircle className={`text-xl flex-shrink-0 mt-0.5 ${
              existingOrgInfo.hasActiveSubscription ? 'text-yellow-400' : 'text-blue-400'
            }`} />
            <div>
              <p className={`font-medium ${
                existingOrgInfo.hasActiveSubscription ? 'text-yellow-400' : 'text-blue-400'
              }`}>
                {existingOrgInfo.hasActiveSubscription
                  ? 'Active Subscription Found'
                  : 'Welcome Back!'}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {existingOrgInfo.hasActiveSubscription
                  ? 'You already have an active subscription. Go to your dashboard to manage it.'
                  : 'We found your organization details. You can update them and complete your payment.'}
              </p>
              {existingOrgInfo.hasActiveSubscription && (
                <button
                  onClick={() => {
                    dispatch(resetSubscriptionFlow());
                    navigate('/portal/subscription');
                  }}
                  className="mt-2 text-sm text-yellow-400 hover:text-yellow-300 underline"
                >
                  Go to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {/* Contact Email - First so lookup happens early */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Contact Email <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={orgForm.contactEmail}
              onChange={(e) => setOrgForm({ ...orgForm, contactEmail: e.target.value })}
              placeholder="admin@organization.com"
              className={`w-full px-4 py-3 bg-[#1a1a24] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.contactEmail ? 'border-red-500' : 'border-white/10'
              }`}
            />
            {isLookingUp && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
          {formErrors.contactEmail && <p className="text-red-400 text-xs mt-1">{formErrors.contactEmail}</p>}
          {existingOrgInfo?.exists && !existingOrgInfo.hasActiveSubscription && (
            <p className="text-blue-400 text-xs mt-1">Organization found - details prefilled below</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Organization Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={orgForm.name}
            onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
            placeholder="e.g., ABC College Alumni Association"
            className={`w-full px-4 py-3 bg-[#1a1a24] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.name ? 'border-red-500' : 'border-white/10'
            }`}
          />
          {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Short Name / Code <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={orgForm.shortName}
            onChange={(e) => setOrgForm({ ...orgForm, shortName: e.target.value.toUpperCase() })}
            placeholder="e.g., ABCAA"
            maxLength={10}
            className={`w-full px-4 py-3 bg-[#1a1a24] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.shortName ? 'border-red-500' : 'border-white/10'
            }`}
          />
          <p className="text-gray-500 text-xs mt-1">Used as your unique tenant code</p>
          {formErrors.shortName && <p className="text-red-400 text-xs mt-1">{formErrors.shortName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Contact Phone</label>
          <input
            type="tel"
            value={orgForm.contactPhone}
            onChange={(e) => setOrgForm({ ...orgForm, contactPhone: e.target.value })}
            placeholder="+91 98765 43210"
            className={`w-full px-4 py-3 bg-[#1a1a24] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.contactPhone ? 'border-red-500' : 'border-white/10'
            }`}
          />
          {formErrors.contactPhone && <p className="text-red-400 text-xs mt-1">{formErrors.contactPhone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
          <textarea
            value={orgForm.address}
            onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
            placeholder="Full address (optional)"
            rows={2}
            className="w-full px-4 py-3 bg-[#1a1a24] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => dispatch(setFlowStep('select'))}
          className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleOrgFormSubmit}
          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
        >
          Continue to Payment
          <HiArrowRight />
        </motion.button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl mb-4">
          <HiCreditCard className="text-green-400 text-3xl" />
        </div>
        <h3 className="text-xl font-bold text-white">
          {selectedPlan.isFreeTrial ? 'Start Your Trial' : 'Complete Payment'}
        </h3>
        <p className="text-gray-400 text-sm mt-1">
          {selectedPlan.isFreeTrial
            ? 'No credit card required for trial'
            : 'Secure payment via Razorpay'}
        </p>
      </div>

      {/* Order Summary */}
      <div className="bg-[#1a1a24] rounded-xl border border-white/10 p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Plan</span>
          <span className="text-white font-medium">{selectedPlan.plan.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Billing</span>
          <span className="text-white">{selectedPlan.billingCycle}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Organization</span>
          <span className="text-white">{organizationDetails?.name}</span>
        </div>
        <div className="border-t border-white/10 pt-3 flex justify-between">
          <span className="text-gray-400 font-medium">Total</span>
          <span className="text-xl font-bold text-white">
            {selectedPlan.isFreeTrial ? 'Free' : formatPrice(selectedPlan.amount)}
          </span>
        </div>
      </div>

      {selectedPlan.isFreeTrial && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <HiSparkles className="text-green-400 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-400 font-medium">Free Trial</p>
              <p className="text-gray-400 text-sm">
                Enjoy {selectedPlan.plan.trialDays || 14} days of full access. You can upgrade anytime.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          onClick={() => dispatch(setFlowStep('organization'))}
          disabled={isProcessing}
          className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <motion.button
          whileHover={{ scale: isProcessing ? 1 : 1.01 }}
          whileTap={{ scale: isProcessing ? 1 : 0.99 }}
          onClick={handlePayment}
          disabled={isProcessing}
          className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : selectedPlan.isFreeTrial ? (
            <>
              <HiLightningBolt />
              Activate Trial
            </>
          ) : (
            <>
              <HiCreditCard />
              Pay {formatPrice(selectedPlan.amount)}
            </>
          )}
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
        <HiShieldCheck className="text-green-400" />
        <span>256-bit SSL encrypted</span>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full mb-6"
      >
        <HiCheckCircle className="text-green-400 text-5xl" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-white mb-2"
      >
        {selectedPlan.isFreeTrial ? 'Trial Started!' : 'Payment Successful!'}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-gray-400 mb-8"
      >
        {selectedPlan.isFreeTrial
          ? `Your ${selectedPlan.plan.trialDays || 14}-day trial has begun. Our team will set up your Guild instance shortly.`
          : 'Thank you for your purchase! Our team will set up your Guild instance and contact you shortly.'}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#1a1a24] rounded-xl border border-white/10 p-6 text-left mb-8"
      >
        <h4 className="text-white font-semibold mb-4">What happens next?</h4>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 text-xs font-bold">1</span>
            </div>
            <span className="text-gray-300">
              Our team will review your organization details and set up your Guild tenant
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 text-xs font-bold">2</span>
            </div>
            <span className="text-gray-300">
              You'll receive an email with your Guild admin credentials within 24 hours
            </span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 text-xs font-bold">3</span>
            </div>
            <span className="text-gray-300">
              Start inviting members and building your alumni community!
            </span>
          </li>
        </ul>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleGoToDashboard}
        className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2"
      >
        Go to Dashboard
        <HiArrowRight />
      </motion.button>
    </div>
  );

  const getStepContent = () => {
    switch (flowStep) {
      case 'select':
        return renderPlanConfirmation();
      case 'organization':
        return renderOrganizationForm();
      case 'payment':
        return renderPaymentStep();
      case 'success':
        return renderSuccessStep();
      default:
        return renderPlanConfirmation();
    }
  };

  const getStepTitle = () => {
    switch (flowStep) {
      case 'select':
        return 'Confirm Your Plan';
      case 'organization':
        return 'Organization Details';
      case 'payment':
        return selectedPlan.isFreeTrial ? 'Start Trial' : 'Payment';
      case 'success':
        return 'Success';
      default:
        return 'Subscribe';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="bg-[#0d0d12] rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{getStepTitle()}</h2>
            {flowStep !== 'success' && (
              <button
                onClick={() => dispatch(closeSubscriptionModal())}
                disabled={isProcessing}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all disabled:opacity-50"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Steps */}
          {flowStep !== 'success' && (
            <div className="px-6 py-3 border-b border-white/5">
              <div className="flex items-center justify-between">
                {['select', 'organization', 'payment'].map((step, idx) => {
                  const stepIndex = ['select', 'organization', 'payment'].indexOf(flowStep);
                  const isActive = idx === stepIndex;
                  const isCompleted = idx < stepIndex;

                  return (
                    <div key={step} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isCompleted
                            ? 'bg-green-500/20 text-green-400'
                            : isActive
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-white/5 text-gray-500'
                        }`}
                      >
                        {isCompleted ? <HiCheck className="w-4 h-4" /> : idx + 1}
                      </div>
                      {idx < 2 && (
                        <div
                          className={`w-16 h-0.5 mx-2 ${
                            idx < stepIndex ? 'bg-green-500/50' : 'bg-white/10'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">{getStepContent()}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanSelectionModal;
