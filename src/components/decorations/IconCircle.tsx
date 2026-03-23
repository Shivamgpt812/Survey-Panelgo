import React from 'react';
import { cn } from '@/lib/utils';

interface IconCircleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'violet' | 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange' | 'white';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const IconCircle = React.forwardRef<HTMLDivElement, IconCircleProps>(
  ({ 
    className, 
    variant = 'violet',
    size = 'md',
    animate = false,
    children,
    ...props 
  }, ref) => {
    const variants = {
      violet: 'bg-violet text-white',
      pink: 'bg-pink text-navy',
      yellow: 'bg-yellow text-navy',
      green: 'bg-green text-navy',
      mint: 'bg-mint text-navy',
      lavender: 'bg-lavender text-navy',
      orange: 'bg-orange text-navy',
      white: 'bg-white text-navy',
    };
    
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-16 h-16',
    };
    
    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6',
      xl: 'w-8 h-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center border-2 border-navy rounded-full transition-transform duration-200 hover:scale-110 hover:rotate-6',
          variants[variant],
          sizes[size],
          animate && 'animate-float',
          className
        )}
        {...props}
      >
        {children && React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ className?: string }>, {
              className: cn(iconSizes[size], (child.props as { className?: string }).className),
            });
          }
          return child;
        })}
      </div>
    );
  }
);

IconCircle.displayName = 'IconCircle';

export default IconCircle;
