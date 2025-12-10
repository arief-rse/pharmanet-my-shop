import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 'md',
  readonly = false,
  showValue = false,
  className,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readonly) {
      setHoveredRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoveredRating(0);
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="flex space-x-0.5" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isSelected = star <= Math.floor(displayRating);
          const isPartial = star === Math.ceil(displayRating) && displayRating % 1 !== 0;
          
          return (
            <button
              key={star}
              type="button"
              disabled={readonly}
              className={cn(
                'border-none bg-transparent p-0 focus:outline-none',
                {
                  'cursor-pointer': !readonly,
                  'cursor-default': readonly,
                }
              )}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => handleStarHover(star)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-all duration-150',
                  {
                    'text-yellow-400 fill-yellow-400': isSelected && !isPartial,
                    'text-yellow-400': isPartial,
                    'text-gray-300 hover:text-yellow-400': !isSelected && !readonly,
                    'text-gray-300': !isSelected && readonly,
                  }
                )}
                style={
                  isPartial
                    ? {
                        background: `linear-gradient(90deg, #fbbf24 ${(displayRating % 1) * 100}%, #d1d5db ${(displayRating % 1) * 100}%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }
                    : undefined
                }
              />
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 ml-2">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 