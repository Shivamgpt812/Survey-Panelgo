import React from 'react';
import { cn } from '@/lib/utils';

interface PlayfulBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange';
  size?: 'sm' | 'md';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const PlayfulBadge = React.forwardRef<HTMLSpanElement, PlayfulBadgeProps>(
  ({ 
    className, 
    variant = 'violet',
    size = 'md',
    leftIcon,
    rightIcon,
    children,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center gap-1.5 font-mono font-bold uppercase tracking-wider border-2 border-navy rounded-pill';
    
    const variants = {
      violet: 'bg-violet text-white',
      pink: 'bg-pink text-navy',
      yellow: 'bg-yellow text-navy',
      green: 'bg-green text-navy',
      mint: 'bg-mint text-navy',
      lavender: 'bg-lavender text-navy',
      orange: 'bg-orange text-navy',
    };
    
    const sizes = {
      sm: 'px-2.5 py-1 text-[10px]',
      md: 'px-3 py-1.5 text-xs',
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {leftIcon}
        {children}
        {rightIcon}
      </span>
    );
  }
);

PlayfulBadge.displayName = 'PlayfulBadge';

export default PlayfulBadge;
