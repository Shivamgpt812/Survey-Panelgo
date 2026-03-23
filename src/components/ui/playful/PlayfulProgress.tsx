import React from 'react';
import { cn } from '@/lib/utils';

interface PlayfulProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'violet' | 'green' | 'yellow' | 'pink';
  size?: 'sm' | 'md' | 'lg';
}

const PlayfulProgress = React.forwardRef<HTMLDivElement, PlayfulProgressProps>(
  ({ 
    className, 
    value,
    max = 100,
    showLabel = false,
    variant = 'violet',
    size = 'md',
    ...props 
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    
    const variants = {
      violet: 'bg-violet',
      green: 'bg-green',
      yellow: 'bg-yellow',
      pink: 'bg-pink',
    };
    
    const sizes = {
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-6',
    };

    return (
      <div className="w-full space-y-2">
        <div
          ref={ref}
          className={cn(
            'w-full bg-periwinkle-dark border-2 border-navy rounded-pill overflow-hidden',
            sizes[size],
            className
          )}
          {...props}
        >
          <div
            className={cn(
              'h-full rounded-pill transition-all duration-500 ease-out',
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="flex justify-between items-center">
            <span className="font-mono text-xs text-navy-light">
              {Math.round(percentage)}% complete
            </span>
            <span className="font-mono text-xs text-navy-light">
              {value}/{max}
            </span>
          </div>
        )}
      </div>
    );
  }
);

PlayfulProgress.displayName = 'PlayfulProgress';

export default PlayfulProgress;
