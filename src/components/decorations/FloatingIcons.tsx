import React from 'react';
import { Star, Zap, Gift, Smile, Heart, Sparkles, Trophy, Coins } from 'lucide-react';
import IconCircle from './IconCircle';

const iconConfigs = [
  { icon: Star, variant: 'yellow' as const, position: 'left-[8%] top-[34%]', delay: '0s' },
  { icon: Zap, variant: 'violet' as const, position: 'right-[10%] top-[40%]', delay: '0.5s' },
  { icon: Gift, variant: 'pink' as const, position: 'left-[12%] bottom-[26%]', delay: '1s' },
  { icon: Smile, variant: 'green' as const, position: 'right-[14%] bottom-[22%]', delay: '1.5s' },
  { icon: Heart, variant: 'pink' as const, position: 'left-[6%] top-[60%]', delay: '0.3s' },
  { icon: Sparkles, variant: 'yellow' as const, position: 'right-[8%] top-[25%]', delay: '0.8s' },
  { icon: Trophy, variant: 'orange' as const, position: 'left-[18%] bottom-[15%]', delay: '1.2s' },
  { icon: Coins, variant: 'green' as const, position: 'right-[18%] top-[55%]', delay: '0.6s' },
];

interface FloatingIconsProps {
  className?: string;
  count?: number;
}

const FloatingIcons: React.FC<FloatingIconsProps> = ({ className, count = 8 }) => {
  const visibleIcons = iconConfigs.slice(0, count);

  return (
    <div className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}>
      {visibleIcons.map((config, index) => (
        <div
          key={index}
          className={`absolute ${config.position}`}
          style={{ animationDelay: config.delay }}
        >
          <IconCircle
            variant={config.variant}
            size="md"
            className="animate-float"
            style={{ animationDelay: config.delay }}
          >
            <config.icon className="w-5 h-5" />
          </IconCircle>
        </div>
      ))}
    </div>
  );
};

import { cn } from '@/lib/utils';

export default FloatingIcons;
