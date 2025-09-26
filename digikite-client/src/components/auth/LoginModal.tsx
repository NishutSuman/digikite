import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { loginUser, switchModalType } from '../../slices/authSlice';
import GoogleAuthButton from './GoogleAuthButton';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, user } = useAppSelector((state) => state.auth);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await dispatch(loginUser(data));
  };

  // Redirect to previous page after successful login
  useEffect(() => {
    if (user && !isLoading && !error) {
      // Navigate to previous page or home
      navigate(-1);
    }
  }, [user, isLoading, error, navigate]);


  if (showEmailForm) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sign In to DigiKite
        </h1>
        <p className="text-gray-600 mb-8">
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
          <div>
            <input
              {...register('email')}
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 text-left">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 text-left">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => setShowEmailForm(false)}
          className="text-blue-500 hover:text-blue-600 text-sm mb-6"
        >
          ← Back to other options
        </button>

        <div className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => dispatch(switchModalType('register'))}
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Unlock 12.3 Million+
      </h1>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        Design Assets
      </h1>
      <p className="text-gray-600 mb-8">
        Highly customizable 3Ds, Illustrations, Lottie animations, Icons, and their source files.
      </p>

      {/* Social login buttons */}
      <div className="space-y-3 mb-6">
        <GoogleAuthButton text="signin" />


        <button
          onClick={() => setShowEmailForm(true)}
          className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
          </svg>
          Sign in with Email
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="text-sm text-gray-600 mb-6">
        By signing in, you agree to DigiKite{' '}
        <a href="#" className="text-blue-500 hover:text-blue-600">Terms of Use</a>,{' '}
        <a href="#" className="text-blue-500 hover:text-blue-600">Privacy Policy</a>
      </div>

      <div className="text-sm text-gray-600">
        Don't have an account?{' '}
        <button
          onClick={() => dispatch(switchModalType('register'))}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default LoginModal;