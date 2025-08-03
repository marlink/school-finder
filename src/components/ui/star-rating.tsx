'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
  className
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleStarClick = (starValue: number) => {
    if (!readonly && onChange) {
      onChange(starValue);
    }
  };

  const handleStarHover = (starValue: number) => {
    if (!readonly) {
      setHoverValue(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div 
        className="flex items-center gap-1"
        onMouseLeave={handleMouseLeave}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeClasses[size],
              'transition-colors duration-150',
              {
                'cursor-pointer hover:scale-110': !readonly,
                'cursor-default': readonly,
                'text-yellow-400 fill-yellow-400': star <= displayValue,
                'text-gray-300 hover:text-yellow-400': star > displayValue && !readonly,
                'text-gray-300': star > displayValue && readonly
              }
            )}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {displayValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}

interface StarRatingDisplayProps {
  rating: number;
  totalRatings?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StarRatingDisplay({
  rating,
  totalRatings,
  size = 'md',
  className
}: StarRatingDisplayProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StarRating
        value={rating}
        readonly
        size={size}
        showValue
      />
      {totalRatings !== undefined && (
        <span className="text-sm text-gray-500">
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
}
