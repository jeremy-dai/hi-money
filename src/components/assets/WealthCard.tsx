import React from 'react';
import { CardContainer, CardBody, CardItem } from '@/components/ui/3d-card';
import { CardSpotlight } from '@/components/ui/card-spotlight';
import { cn } from '@/lib/utils';

interface WealthCardProps {
  children: React.ReactNode;
  className?: string;
  enable3D?: boolean;
}

export function WealthCard({ children, className, enable3D = true }: WealthCardProps) {
  return (
    <CardContainer 
      className="inter-var w-full" 
      containerClassName="py-1 block" 
      enable3D={enable3D}
    >
      <CardBody className="w-full h-auto">
        <CardItem 
          translateZ={enable3D ? "30" : "0"} 
          className="w-full"
        >
          <CardSpotlight 
            className={cn(
              "bg-black-elevated border-gray-800 shadow-xl backdrop-blur-sm p-0", 
              className
            )}
          >
            {children}
          </CardSpotlight>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}
