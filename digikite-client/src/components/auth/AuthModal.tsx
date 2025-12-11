import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { closeAuthModal, switchModalType, hideSuccess } from '../../slices/authSlice';
import { continueAfterAuth } from '../../slices/subscriptionSlice';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import SuccessAnimation from '../common/SuccessAnimation';
import { HiX, HiSparkles, HiUsers, HiCalendar, HiCash, HiLightningBolt } from 'react-icons/hi';

const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isModalOpen, modalType, showSuccessAnimation, successMessage } = useAppSelector((state) => state.auth);
  const { selectedPlan } = useAppSelector((state) => state.subscription);
  const isInSubscriptionFlow = !!selectedPlan;

  // Handle authentication success flows
  useEffect(() => {
    if (showSuccessAnimation && successMessage.includes('Please sign in')) {
      setTimeout(() => {
        dispatch(hideSuccess());
        dispatch(switchModalType('login'));
        toast.success('Account created! Please sign in with your credentials.');
      }, 2500);
    } else if (showSuccessAnimation && successMessage.includes('Google')) {
      setTimeout(() => {
        dispatch(hideSuccess());
        dispatch(closeAuthModal());
        // If in subscription flow, continue to organization step
        if (isInSubscriptionFlow) {
          dispatch(continueAfterAuth());
          toast.success('Signed in! Continue with your subscription.');
        } else {
          toast.success('Welcome! Successfully signed in with Google.');
        }
      }, 2500);
    } else if (showSuccessAnimation && successMessage.includes('Welcome back')) {
      setTimeout(() => {
        dispatch(hideSuccess());
        dispatch(closeAuthModal());
        // If in subscription flow, continue to organization step
        if (isInSubscriptionFlow) {
          dispatch(continueAfterAuth());
          toast.success('Signed in! Continue with your subscription.');
        } else {
          toast.success('Welcome back! Successfully signed in.');
        }
      }, 2500);
    } else if (showSuccessAnimation && successMessage.includes('Account created')) {
      setTimeout(() => {
        dispatch(hideSuccess());
        dispatch(closeAuthModal());
        // If in subscription flow, continue to organization step
        if (isInSubscriptionFlow) {
          dispatch(continueAfterAuth());
          toast.success('Account created! Continue with your subscription.');
        } else {
          toast.success('Account created successfully! Welcome to DigiKite.');
        }
      }, 2500);
    }
  }, [showSuccessAnimation, successMessage, dispatch, isInSubscriptionFlow]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch(closeAuthModal());
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [dispatch]);

  if (!isModalOpen || !modalType) {
    return null;
  }

  const handleSuccessComplete = () => {
    dispatch(hideSuccess());
    if (successMessage.includes('Please sign in')) {
      dispatch(switchModalType('login'));
      toast.success('Account created! Please sign in with your credentials.');
    } else {
      dispatch(closeAuthModal());
      // If in subscription flow, continue to organization step
      if (isInSubscriptionFlow) {
        dispatch(continueAfterAuth());
        toast.success('Continue with your subscription.');
      } else if (successMessage.includes('Google')) {
        toast.success('Welcome! Successfully signed in with Google.');
      } else if (successMessage.includes('Welcome back')) {
        toast.success('Welcome back! Successfully signed in.');
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      dispatch(closeAuthModal());
    }
  };

  const features = [
    { icon: HiUsers, title: 'Member Management', desc: 'Comprehensive alumni database' },
    { icon: HiCalendar, title: 'Event Coordination', desc: 'Plan reunions and gatherings' },
    { icon: HiCash, title: 'Treasury System', desc: 'Track dues and expenses' },
    { icon: HiLightningBolt, title: 'Real-time Updates', desc: 'Instant notifications' },
  ];

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
          className="bg-[#12121a] rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex border border-white/10"
        >
          {/* Left side - Feature showcase */}
          <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-indigo-600/20 to-purple-600/20" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]" />

            {/* Grid pattern */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-10 flex flex-col justify-between h-full">
              {/* Close button */}
              <button
                onClick={() => dispatch(closeAuthModal())}
                className="absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              >
                <HiX className="w-5 h-5" />
              </button>

              {/* Logo and branding */}
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <img
                    src="/brand/guild-logo-icon-color.png"
                    alt="Guild"
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Guild</h2>
                    <p className="text-sm text-gray-400">by DigiKite</p>
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-4 leading-tight">
                  Transform Your<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    Alumni Network
                  </span>
                </h3>
                <p className="text-gray-400 mb-8">
                  Join thousands of organizations using Guild to build stronger alumni communities.
                </p>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <feature.icon className="w-8 h-8 text-blue-400 mb-2" />
                    <h4 className="text-white font-semibold text-sm">{feature.title}</h4>
                    <p className="text-gray-500 text-xs mt-1">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Bottom badge */}
              <div className="mt-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-full">
                  <HiSparkles className="text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">India's First Alumni Workspace</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Auth form */}
          <div className="w-full lg:w-1/2 p-6 lg:p-10 relative bg-[#0d0d12] overflow-y-auto max-h-[90vh]">
            {/* Mobile close button */}
            <button
              onClick={() => dispatch(closeAuthModal())}
              className="lg:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <HiX className="w-5 h-5" />
            </button>

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-3 mb-6">
              <img
                src="/brand/guild-logo-icon-color.png"
                alt="Guild"
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div>
                <h2 className="text-xl font-bold text-white">Guild</h2>
                <p className="text-xs text-gray-400">by DigiKite</p>
              </div>
            </div>

            <div className="max-w-sm mx-auto">
              {modalType === 'login' ? <LoginModal /> : <RegisterModal />}
            </div>
          </div>
        </motion.div>

        {/* Success Animation */}
        <SuccessAnimation
          isVisible={showSuccessAnimation}
          message={successMessage}
          onComplete={handleSuccessComplete}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default AuthModal;
