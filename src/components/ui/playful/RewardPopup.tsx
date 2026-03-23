import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, Sparkles, Coins, Gift } from 'lucide-react';
import PlayfulButton from './PlayfulButton';
import IconCircle from '@/components/decorations/IconCircle';
import confetti from 'canvas-confetti';

interface RewardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  points: number;
  message?: string;
  subMessage?: string;
}

const RewardPopup: React.FC<RewardPopupProps> = ({
  isOpen,
  onClose,
  points,
  message = "You earned points!",
  subMessage = "Keep completing surveys to earn more rewards",
}) => {
  const hasTriggeredConfetti = useRef(false);

  useEffect(() => {
    if (isOpen && !hasTriggeredConfetti.current) {
      hasTriggeredConfetti.current = true;
      
      // Trigger confetti explosion
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Left cannon
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#7B61FF', '#FFD6E8', '#FFF2B2', '#D6F5E3', '#FFE5D6']
        });
        
        // Right cannon
        confetti({
          ...defaults, 
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#7B61FF', '#FFD6E8', '#FFF2B2', '#D6F5E3', '#FFE5D6']
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      hasTriggeredConfetti.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Popup Card */}
      <div className={cn(
        'relative w-full max-w-md bg-white border-2 border-navy rounded-3xl shadow-hard-lg p-6 md:p-8',
        'animate-bounce-in'
      )}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-periwinkle transition-colors"
        >
          <X className="w-5 h-5 text-navy" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <IconCircle variant="yellow" size="xl" className="animate-pulse-soft">
              <Sparkles className="w-8 h-8" />
            </IconCircle>
            <div className="absolute -top-2 -right-2">
              <IconCircle variant="violet" size="sm">
                <Coins className="w-4 h-4" />
              </IconCircle>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <h2 className="font-outfit font-bold text-2xl md:text-3xl text-navy">
            🎉 {message}
          </h2>
          
          <div className="flex items-center justify-center gap-2 py-4">
            <IconCircle variant="violet" size="lg">
              <Coins className="w-6 h-6" />
            </IconCircle>
            <span className="font-outfit font-bold text-4xl md:text-5xl text-violet">
              +{points}
            </span>
          </div>
          
          <p className="text-navy-light text-base">
            {subMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <PlayfulButton
            variant="primary"
            className="flex-1"
            onClick={onClose}
            leftIcon={<Gift className="w-4 h-4" />}
          >
            View Rewards
          </PlayfulButton>
          <PlayfulButton
            variant="secondary"
            className="flex-1"
            onClick={onClose}
          >
            Continue
          </PlayfulButton>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink border-2 border-navy rounded-full animate-float" />
        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-green border-2 border-navy rounded-full animate-float animation-delay-300" />
      </div>
    </div>,
    document.body
  );
};

export default RewardPopup;
