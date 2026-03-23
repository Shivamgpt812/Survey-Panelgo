import React from 'react';
import { cn } from '@/lib/utils';

interface PlayfulCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'static';
  rotation?: 'none' | 'left' | 'right';
  shadow?: 'sm' | 'md' | 'lg';
}

const PlayfulCard = React.forwardRef<HTMLDivElement, PlayfulCardProps>(
  ({ 
    className, 
    variant = 'default',
    rotation = 'none',
    shadow = 'md',
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'relative bg-white border-2 border-navy rounded-3xl overflow-hidden';
    
    const variants = {
      default: 'transition-all duration-200 ease-out hover:shadow-hard-hover hover:-translate-x-0.5 hover:-translate-y-0.5 hover:-rotate-1 active:shadow-hard-active active:translate-x-1 active:translate-y-1',
      hover: 'transition-all duration-200 ease-out hover:shadow-hard-hover hover:-translate-x-0.5 hover:-translate-y-0.5 hover:-rotate-1',
      static: '',
    };
    
    const rotations = {
      none: '',
      left: '-rotate-1',
      right: 'rotate-1',
    };
    
    const shadows = {
      sm: 'shadow-hard-sm',
      md: 'shadow-hard',
      lg: 'shadow-hard-lg',
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          rotations[rotation],
          shadows[shadow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PlayfulCard.displayName = 'PlayfulCard';

export default PlayfulCard;
