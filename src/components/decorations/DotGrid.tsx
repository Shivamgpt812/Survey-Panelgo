import React from 'react';
import { cn } from '@/lib/utils';

interface DotGridProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: number;
  dotSize?: number;
  spacing?: number;
}

const DotGrid = React.forwardRef<HTMLDivElement, DotGridProps>(
  ({ 
    className, 
    opacity = 0.08,
    dotSize = 1.5,
    spacing = 24,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'absolute inset-0 pointer-events-none',
          className
        )}
        style={{
          backgroundImage: `radial-gradient(#11133E ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${spacing}px ${spacing}px`,
          opacity,
        }}
        {...props}
      />
    );
  }
);

DotGrid.displayName = 'DotGrid';

export default DotGrid;
