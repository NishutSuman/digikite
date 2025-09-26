import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { closeAuthModal, switchModalType, hideSuccess } from '../../slices/authSlice';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import SuccessAnimation from '../common/SuccessAnimation';

const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isModalOpen, modalType, showSuccessAnimation, successMessage, user } = useAppSelector((state) => state.auth);

  // Handle authentication success flows
  useEffect(() => {
    if (showSuccessAnimation && successMessage.includes('Please sign in')) {
      // For email registration, show login modal after animation
      setTimeout(() => {
        dispatch(hideSuccess());
        dispatch(switchModalType('login'));
        toast.success('Account created! Please sign in with your credentials.');
      }, 2500);
    } else if (showSuccessAnimation && successMessage.includes('Google')) {
      // For Google auth, show toast and close modal after animation
      setTimeout(() => {
        dispatch(hideSuccess());
        dispatch(closeAuthModal());
        toast.success('Welcome! Successfully signed in with Google.');
      }, 2500);
    } else if (showSuccessAnimation && successMessage.includes('Welcome back')) {
      // For email login, show toast and close modal after animation
      setTimeout(() => {
        dispatch(hideSuccess());
        dispatch(closeAuthModal());
        toast.success('Welcome back! Successfully signed in.');
      }, 2500);
    }
  }, [showSuccessAnimation, successMessage, dispatch]);

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
      if (successMessage.includes('Google')) {
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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Left side - Green background with illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-400 to-green-500 p-8 items-center justify-center relative">
          <button
            onClick={() => dispatch(closeAuthModal())}
            className="absolute top-6 right-6 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Illustration placeholder */}
          <div className="text-center">
            <div className="bg-white rounded-3xl p-8 mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="w-48 h-64 bg-gradient-to-br from-orange-200 to-orange-300 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    🌟
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">Explore Digital</h3>
                  <h4 className="text-lg font-bold text-gray-800">Marketing</h4>
                  <p className="text-sm text-gray-600 mt-2">Grow your business online</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full lg:w-1/2 p-8 relative">
          <button
            onClick={() => dispatch(closeAuthModal())}
            className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-sm mx-auto">
            {modalType === 'login' ? <LoginModal /> : <RegisterModal />}
          </div>
        </div>
      </div>

      {/* Success Animation */}
      <SuccessAnimation
        isVisible={showSuccessAnimation}
        message={successMessage}
        onComplete={handleSuccessComplete}
      />
    </div>
  );
};

export default AuthModal;