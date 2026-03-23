import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface PlayfulButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const PlayfulButton = React.forwardRef<HTMLButtonElement, PlayfulButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center gap-2 font-outfit font-bold transition-all duration-150 ease-out border-2 border-navy disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-violet text-white hover:bg-violet-dark',
      secondary: 'bg-white text-navy hover:bg-periwinkle',
      accent: 'bg-pink text-navy hover:bg-pink/80',
      outline: 'bg-transparent text-navy hover:bg-periwinkle',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-pill shadow-hard-sm',
      md: 'px-6 py-3 text-base rounded-pill shadow-hard',
      lg: 'px-8 py-4 text-lg rounded-pill shadow-hard-lg',
    };
    
    const shadows = {
      sm: 'hover:shadow-hard hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-hard-sm active:translate-x-1 active:translate-y-1',
      md: 'hover:shadow-hard-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-hard-active active:translate-x-1 active:translate-y-1',
      lg: 'hover:shadow-hard-hover hover:-translate-x-1 hover:-translate-y-1 active:shadow-hard-active active:translate-x-2 active:translate-y-2',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          shadows[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

PlayfulButton.displayName = 'PlayfulButton';

export default PlayfulButton;
