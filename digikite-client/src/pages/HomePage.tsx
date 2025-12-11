import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { hideSuccess, openAuthModal } from '../slices/authSlice';
import AuthModal from '../components/auth/AuthModal';
import PlanSelectionModal from '../components/landing/PlanSelectionModal';
import SuccessAnimation from '../components/common/SuccessAnimation';
import LandingPage from './LandingPage';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { showSuccessAnimation, successMessage } = useAppSelector((state) => state.auth);

  // Auto-open auth modal when navigating to /login
  useEffect(() => {
    if (location.pathname === '/login') {
      dispatch(openAuthModal('login'));
    }
  }, [location.pathname, dispatch]);

  // NOTE: We no longer auto-redirect logged in users from landing page
  // Users can freely browse the landing page even when logged in
  // They can manually go to their dashboard via the header link

  return (
    <>
      {/* Landing Page */}
      <LandingPage />

      {/* Auth Modal */}
      <AuthModal />

      {/* Plan Selection Modal (Subscription Flow) */}
      <PlanSelectionModal />

      {/* Success Animation */}
      {showSuccessAnimation && (
        <SuccessAnimation
          isVisible={showSuccessAnimation}
          message={successMessage}
          onComplete={() => dispatch(hideSuccess())}
        />
      )}
    </>
  );
};

export default HomePage;