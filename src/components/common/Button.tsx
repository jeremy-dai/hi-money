import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ShimmerButton } from '@/components/ui/shimmer-button';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';
import React from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-semibold rounded-lg transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black-primary disabled:opacity-50 disabled:cursor-not-allowed transform';

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg',
  };

  const ghostSizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  if (variant === 'primary') {
    return (
      <ShimmerButton
        className={cn(sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </ShimmerButton>
    );
  }

  if (variant === 'secondary') {
    return (
      <MovingBorderButton
        borderRadius="0.5rem"
        containerClassName={cn("w-full md:w-auto md:mx-auto h-auto", className)}
        className={cn("bg-black text-white border-neutral-200 dark:border-slate-800", sizes[size])}
        disabled={disabled}
        {...props}
      >
        {children}
      </MovingBorderButton>
    );
  }

  return (
    <button
      className={cn(
        baseStyles,
        'bg-black-soft text-white border-none hover:bg-gold-primary/10 hover:text-gold-primary focus-visible:ring-gold-primary',
        ghostSizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
