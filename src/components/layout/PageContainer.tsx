import { motion } from 'framer-motion';
import { TopNav } from './TopNav';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { Spotlight } from '@/components/ui/spotlight';
import React from 'react';

interface PageContainerProps {
  children: React.ReactNode;
  gradient?: boolean;
}

export function PageContainer({ children, gradient = true }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-black-primary text-white font-sans selection:bg-gold-primary/30 relative overflow-hidden">
      {!gradient && <BackgroundBeams />}
      {gradient && (
        <Spotlight
          className="-top-40 left-0 md:left-60 md:-top-20"
          fill="white"
        />
      )}

      <TopNav />

      <main className="relative z-10 pt-28 px-4 md:px-8 pb-12">
        {children}
      </main>
    </div>
  );
}
