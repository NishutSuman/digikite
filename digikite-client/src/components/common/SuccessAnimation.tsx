import React, { useEffect, useState } from 'react';

interface SuccessAnimationProps {
  isVisible: boolean;
  message: string;
  onComplete: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ isVisible, message, onComplete }) => {
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Show checkmark animation first
      const checkmarkTimer = setTimeout(() => {
        setShowCheckmark(true);
      }, 100);

      // Show message after checkmark
      const messageTimer = setTimeout(() => {
        setShowMessage(true);
      }, 800);

      // Complete animation
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 2500);

      return () => {
        clearTimeout(checkmarkTimer);
        clearTimeout(messageTimer);
        clearTimeout(completeTimer);
      };
    } else {
      setShowCheckmark(false);
      setShowMessage(false);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
        {/* Animated Checkmark */}
        <div className={`mx-auto mb-4 w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center transition-all duration-500 ${
          showCheckmark ? 'scale-1 opacity-100' : 'scale-0 opacity-0'
        }`}>
          <svg
            className={`w-8 h-8 text-green-500 transition-all duration-300 ${
              showCheckmark ? 'scale-1' : 'scale-0'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
              className={showCheckmark ? 'animate-draw-check' : ''}
            />
          </svg>
        </div>

        {/* Success Message */}
        <div className={`transition-all duration-500 ${
          showMessage ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600">{message}</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes draw-check {
          0% {
            stroke-dasharray: 0 50;
          }
          100% {
            stroke-dasharray: 50 0;
          }
        }

        .animate-draw-check {
          animation: draw-check 0.5s ease-in-out 0.2s both;
          stroke-dasharray: 0 50;
        }
      `}</style>
    </div>
  );
};

export default SuccessAnimation;