import React from 'react';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  /** `nav` = top bar (large, readable). `sm` compact. `md`/`lg` for inline sections. */
  size?: 'sm' | 'nav' | 'md' | 'lg';
};

const sizeClass = {
  sm: 'h-9 w-auto max-w-[160px] sm:max-w-[200px]',
  nav: 'h-12 w-auto max-w-[200px] sm:h-14 sm:max-w-[260px] md:h-16 md:max-w-[300px] lg:max-w-[340px]',
  md: 'h-11 w-auto max-w-[200px] sm:max-w-[240px]',
  lg: 'h-14 w-auto max-w-[260px] sm:max-w-[320px]',
};

/** Brand mark: `public/logo.png`. For centered layout (e.g. sidebars), pass `className` with `object-center mx-auto`. */
export const BrandLogo: React.FC<BrandLogoProps> = ({ className, size = 'md' }) => {
  return (
    <img
      src="/logo.png"
      alt="Survey Panel Go"
      className={cn('object-contain object-left select-none', sizeClass[size], className)}
      width={280}
      height={80}
      decoding="async"
    />
  );
};
