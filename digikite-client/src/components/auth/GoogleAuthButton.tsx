import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { googleAuth } from '../../slices/authSlice';

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

  // Redirect to previous page after successful Google authentication
  useEffect(() => {
    if (user && !isLoading && !error) {
      // Navigate to previous page or home
      navigate(-1);
    }
  }, [user, isLoading, error, navigate]);

  // If Google client ID is not configured, show custom button
  if (!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center px-4 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
      >
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google OAuth Not Configured
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
          className="w-full flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-600 rounded-lg cursor-not-allowed border border-blue-200"
        >
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
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
          className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-lg cursor-not-allowed border border-red-200"
        >
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {googleError}
        </button>
        {googleError.includes('Origin not authorized') && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Fix:</strong> Add <code className="bg-yellow-100 px-1 rounded">{window.location.origin}</code> to
              authorized origins in your Google OAuth Client ID settings at
              <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
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
      <div ref={googleButtonRef} className="w-full flex justify-center" />
      {isLoading && (
        <div className="mt-2 text-center text-sm text-gray-500">
          Signing in with Google...
        </div>
      )}
    </div>
  );
};

export default GoogleAuthButton;