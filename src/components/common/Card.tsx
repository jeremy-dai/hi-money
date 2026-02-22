import { CardSpotlight } from '@/components/ui/card-spotlight';
import { cn } from '@/lib/utils';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <CardSpotlight
      onClick={onClick}
      className={cn(
        'bg-black-elevated border-gray-800 shadow-xl backdrop-blur-sm p-6',
        onClick && 'cursor-pointer hover:border-gold-primary/30 transition-all duration-300',
        className
      )}
    >
      {children}
    </CardSpotlight>
  );
}
