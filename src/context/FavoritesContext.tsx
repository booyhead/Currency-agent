import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { playKeypadClick, triggerVibration } from '../utils/sound';

const FAVORITES_STORAGE_KEY = 'dirhampay_favorite_currencies_v1';

// Default starter favorites for convenience (top Moroccan remittance & travel pairs)
const DEFAULT_FAVORITES: string[] = ['EUR', 'USD'];

interface FavoritesContextType {
  favoriteCodes: string[];
  isFavorite: (code: string) => boolean;
  toggleFavorite: (code: string) => void;
  addFavorite: (code: string) => void;
  removeFavorite: (code: string) => void;
  clearFavorites: () => void;
  favoritesCount: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteCodes, setFavoriteCodes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // Fallback if parsing fails
    }
    return DEFAULT_FAVORITES;
  });

  // Persist whenever favoriteCodes changes
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteCodes));
    } catch {
      // LocalStorage might fail in restricted iframe / quota
    }
  }, [favoriteCodes]);

  const isFavorite = useCallback(
    (code: string) => {
      return favoriteCodes.includes(code.toUpperCase());
    },
    [favoriteCodes]
  );

  const addFavorite = useCallback((code: string) => {
    const upper = code.toUpperCase();
    setFavoriteCodes((prev) => {
      if (prev.includes(upper)) return prev;
      return [upper, ...prev];
    });
    playKeypadClick(true);
    triggerVibration();
  }, []);

  const removeFavorite = useCallback((code: string) => {
    const upper = code.toUpperCase();
    setFavoriteCodes((prev) => prev.filter((c) => c !== upper));
    playKeypadClick(true);
    triggerVibration();
  }, []);

  const toggleFavorite = useCallback((code: string) => {
    const upper = code.toUpperCase();
    setFavoriteCodes((prev) => {
      if (prev.includes(upper)) {
        return prev.filter((c) => c !== upper);
      } else {
        return [upper, ...prev];
      }
    });
    playKeypadClick(true);
    triggerVibration();
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteCodes([]);
    playKeypadClick(true);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteCodes,
        isFavorite,
        toggleFavorite,
        addFavorite,
        removeFavorite,
        clearFavorites,
        favoritesCount: favoriteCodes.length,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
