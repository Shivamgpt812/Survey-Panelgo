import React from 'react';
import { cn } from '@/lib/utils';

interface DecorativeBlobProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pink' | 'yellow' | 'green' | 'mint' | 'lavender' | 'orange' | 'violet';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const DecorativeBlob = React.forwardRef<HTMLDivElement, DecorativeBlobProps>(
  ({ 
    className, 
    variant = 'pink',
    size = 'md',
    animate = true,
    ...props 
  }, ref) => {
    const variants = {
      pink: 'bg-pink',
      yellow: 'bg-yellow',
      green: 'bg-green',
      mint: 'bg-mint',
      lavender: 'bg-lavender',
      orange: 'bg-orange',
      violet: 'bg-violet/30',
    };
    
    const sizes = {
      sm: 'w-24 h-24',
      md: 'w-40 h-40',
      lg: 'w-64 h-64',
      xl: 'w-96 h-96',
    };

    // Generate a random blob shape using border-radius
    const blobShapes = [
      'rounded-[60%_40%_30%_70%/60%_30%_70%_40%]',
      'rounded-[30%_70%_70%_30%/30%_30%_70%_70%]',
      'rounded-[50%_50%_30%_70%/50%_70%_30%_50%]',
      'rounded-[40%_60%_70%_30%/40%_50%_60%_50%]',
    ];
    
    const randomShape = blobShapes[Math.floor(Math.random() * blobShapes.length)];

    return (
      <div
        ref={ref}
        className={cn(
          'absolute pointer-events-none opacity-80',
          variants[variant],
          sizes[size],
          randomShape,
          animate && 'animate-float-slow',
          className
        )}
        {...props}
      />
    );
  }
);

DecorativeBlob.displayName = 'DecorativeBlob';

export default DecorativeBlob;
