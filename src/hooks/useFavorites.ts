import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

export interface Favorite {
  id: string;
  userId: string;
  schoolId: string;
  notes?: string;
  createdAt: string;
  school: {
    id: string;
    name: string;
    type: string;
    address: any;
    images?: Array<{ imageUrl: string; altText?: string }>;
  };
}

export function useFavorites() {
  const { user, isAuthenticated } = useUser();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's favorites
  const fetchFavorites = async () => {
    if (!isAuthenticated || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) {
        throw new Error('Failed to fetch favorites');
      }
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  // Add school to favorites
  const addFavorite = async (schoolId: string, notes?: string) => {
    if (!isAuthenticated || !user?.id) {
      setError('You must be logged in to add favorites');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolId, notes }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add favorite');
      }

      const newFavorite = await response.json();
      setFavorites(prev => [newFavorite, ...prev]);
      return true;
    } catch (error) {
      console.error('Error adding favorite:', error);
      setError(error instanceof Error ? error.message : 'Failed to add favorite');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove school from favorites
  const removeFavorite = async (schoolId: string) => {
    if (!isAuthenticated || !user?.id) {
      setError('You must be logged in to remove favorites');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/favorites?schoolId=${schoolId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove favorite');
      }

      setFavorites(prev => prev.filter(fav => fav.schoolId !== schoolId));
      return true;
    } catch (error) {
      console.error('Error removing favorite:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove favorite');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if school is favorited
  const isFavorited = (schoolId: string) => {
    return favorites.some(fav => fav.schoolId === schoolId);
  };

  // Toggle favorite status
  const toggleFavorite = async (schoolId: string, notes?: string) => {
    if (isFavorited(schoolId)) {
      return await removeFavorite(schoolId);
    } else {
      return await addFavorite(schoolId, notes);
    }
  };

  // Load favorites on session change
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, user?.id]);

  return {
    favorites,
    loading,
    error,
    addFavorite,
    removeFavorite,
    isFavorited,
    toggleFavorite,
    refreshFavorites: fetchFavorites,
  };
}
