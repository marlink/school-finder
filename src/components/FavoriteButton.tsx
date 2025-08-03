'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  schoolId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'outline' | 'default';
  className?: string;
}

export function FavoriteButton({ 
  schoolId, 
  size = 'md', 
  variant = 'ghost',
  className 
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const { isFavorited, toggleFavorite, loading } = useFavorites();
  const [isProcessing, setIsProcessing] = useState(false);

  const favorited = isFavorited(schoolId);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!session?.user?.id) {
      // Could add toast notification here
      return;
    }

    setIsProcessing(true);
    await toggleFavorite(schoolId);
    setIsProcessing(false);
  };

  const sizeClasses = {
    sm: 'h-7 w-7',
    md: 'h-9 w-9',
    lg: 'h-11 w-11'
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  };

  return (
    <Button
      onClick={handleToggle}
      variant={variant}
      size="icon"
      disabled={loading || isProcessing}
      className={cn(
        'transition-all duration-200 hover:scale-110',
        sizeClasses[size],
        className
      )}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        size={iconSizes[size]}
        className={cn(
          'transition-all duration-200',
          favorited 
            ? 'fill-red-500 text-red-500' 
            : 'text-gray-400 hover:text-red-400'
        )}
      />
    </Button>
  );
}
