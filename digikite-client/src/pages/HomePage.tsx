import React from 'react';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { hideSuccess } from '../slices/authSlice';
import AuthModal from '../components/auth/AuthModal';
import SuccessAnimation from '../components/common/SuccessAnimation';
import LandingPage from './LandingPage';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showSuccessAnimation, successMessage } = useAppSelector((state) => state.auth);

  return (
    <>
      {/* Landing Page */}
      <LandingPage />

      {/* Auth Modal */}
      <AuthModal />

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