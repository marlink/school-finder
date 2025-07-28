'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SectionSwitcherProps {
  children: React.ReactNode[];
  className?: string;
}

export function SectionSwitcher({ children, className }: SectionSwitcherProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Ensure we have at most 3 children
  const validChildren = React.Children.toArray(children).slice(0, 3);
  
  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        {validChildren.map((_, index) => (
          <Button
            key={index}
            variant={activeIndex === index ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-8 h-8 p-0 rounded-full",
              activeIndex === index ? "bg-purple-600 hover:bg-purple-700" : "bg-white hover:bg-gray-100"
            )}
            onClick={() => setActiveIndex(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
      
      {validChildren.map((child, index) => (
        <div 
          key={index} 
          className={cn(
            "transition-opacity duration-300",
            activeIndex === index ? "opacity-100" : "opacity-0 hidden"
          )}
        >
          {child}
        </div>
      ))}
    </div>
  );
}