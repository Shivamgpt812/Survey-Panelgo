import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

interface PlayfulInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

const PlayfulInput = React.forwardRef<HTMLInputElement, PlayfulInputProps>(
  ({ 
    className, 
    label,
    error,
    helperText,
    leftIcon,
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="block font-outfit font-semibold text-sm text-navy">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/60">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              'w-full px-4 py-3 bg-white border-2 border-navy rounded-2xl',
              'font-jakarta text-base text-navy',
              'placeholder:text-navy/50',
              'transition-all duration-150 ease-out',
              'focus:outline-none focus:ring-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-12',
              isPassword && 'pr-12',
              error && 'border-red-500 focus:shadow-red-500/30',
              !error && 'focus:shadow-[4px_4px_0_#7B61FF]',
              className
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-navy/60 hover:text-navy transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-red-500 text-sm font-medium">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-navy-light text-sm">{helperText}</p>
        )}
      </div>
    );
  }
);

PlayfulInput.displayName = 'PlayfulInput';

export default PlayfulInput;
