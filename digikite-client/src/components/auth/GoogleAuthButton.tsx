import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { googleAuth, closeAuthModal } from '../../slices/authSlice';
import { FcGoogle } from 'react-icons/fc';
import { HiExclamationCircle } from 'react-icons/hi';

interface GoogleAuthButtonProps {
  text: 'signin' | 'signup';
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ text }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, user, error } = useAppSelector((state) => state.auth);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(true);

  useEffect(() => {
    console.log('GoogleAuthButton: Component mounted, starting initialization');

    const initializeGoogle = async () => {
      try {
        // Step 1: Ensure Google SDK is loaded
        if (!window.google?.accounts?.id) {
          console.log('GoogleAuthButton: Loading Google SDK...');

          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.async = true;
          script.defer = true;

          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });

          // Wait for SDK to initialize
          let attempts = 0;
          while (!window.google?.accounts?.id && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }

          if (!window.google?.accounts?.id) {
            throw new Error('Google SDK failed to initialize');
          }
        }

        console.log('GoogleAuthButton: Google SDK ready');

        // Step 2: Wait for DOM element to be available
        let domAttempts = 0;
        while (!googleButtonRef.current && domAttempts < 50) {
          await new Promise(resolve => setTimeout(resolve, 100));
          domAttempts++;
        }

        if (!googleButtonRef.current) {
          throw new Error('DOM element not available');
        }

        console.log('GoogleAuthButton: DOM element ready, initializing Google Auth');

        // Step 3: Initialize Google Auth
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            console.log('GoogleAuthButton: Authentication callback received');
            dispatch(googleAuth(response));
          },
          use_fedcm_for_prompt: false,
        });

        // Step 4: Render the button
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          {
            theme: 'outline',
            size: 'large',
            width: 400,
            text: text === 'signin' ? 'signin_with' : 'signup_with',
            shape: 'rectangular',
          }
        );

        console.log('GoogleAuthButton: Button rendered successfully');
        setIsGoogleLoading(false);
        setGoogleError(null);

      } catch (error) {
        console.error('GoogleAuthButton: Initialization failed:', error);
        setGoogleError('Google Sign-In is unavailable');
        setIsGoogleLoading(false);
      }
    };

    // Start initialization after a short delay to ensure component is fully mounted
    const timer = setTimeout(initializeGoogle, 100);

    return () => clearTimeout(timer);
  }, [dispatch, text]);

  // Role-based redirect after successful Google authentication
  useEffect(() => {
    if (user && !isLoading && !error) {
      dispatch(closeAuthModal());
      // Navigate based on user role
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        navigate('/admin');
      } else {
        // All other users go to client portal
        navigate('/portal');
      }
    }
  }, [user, isLoading, error, navigate, dispatch]);

  // If Google client ID is not configured, show custom button with dark theme
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center px-4 py-3 bg-white/5 text-gray-500 rounded-xl cursor-not-allowed border border-white/10"
      >
        <FcGoogle className="w-5 h-5 mr-3 opacity-50" />
        <span className="text-gray-500">Google OAuth Not Configured</span>
      </button>
    );
  }

  // Show loading state while Google Auth is initializing
  if (isGoogleLoading) {
    return (
      <div className="w-full">
        <div ref={googleButtonRef} className="w-full flex justify-center" style={{ display: 'none' }} />
        <button
          disabled
          className="w-full flex items-center justify-center px-4 py-3 bg-white/5 text-gray-400 rounded-xl cursor-not-allowed border border-white/10"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400 mr-3"></div>
          Loading Google Sign-In...
        </button>
      </div>
    );
  }

  // Show error state if Google Auth failed to initialize
  if (googleError) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full flex items-center justify-center px-4 py-3 bg-red-500/10 text-red-400 rounded-xl cursor-not-allowed border border-red-500/20"
        >
          <HiExclamationCircle className="w-5 h-5 mr-3" />
          {googleError}
        </button>
        {googleError.includes('Origin not authorized') && (
          <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-xs text-yellow-400">
              <strong>Fix:</strong> Add <code className="bg-yellow-500/20 px-1 rounded">{window.location.origin}</code> to
              authorized origins in your Google OAuth Client ID settings at
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                Google Cloud Console
              </a>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div ref={googleButtonRef} className="w-full flex justify-center [&_iframe]:!rounded-xl" />
      {isLoading && (
        <div className="mt-2 text-center text-sm text-gray-400">
          Signing in with Google...
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;