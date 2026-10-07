import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DetectedLocation, GeolocationStatus } from '../types/location';
import { Currency } from '../types/currency';
import { detectUserRegion } from '../services/geolocationService';

const PINNED_STORAGE_KEY = 'dirhampay_pinned_currency_v1';
const LOCATION_CACHE_KEY = 'dirhampay_cached_location_v1';
const DISMISSED_SUGGESTION_KEY = 'dirhampay_dismissed_suggestion_v1';

interface LocationContextType {
  status: GeolocationStatus;
  detectedLocation: DetectedLocation | null;
  pinnedCurrencyCode: string | null;
  detectLocation: (currencies: Currency[], force?: boolean) => Promise<DetectedLocation | null>;
  pinCurrency: (code: string) => void;
  unpinCurrency: () => void;
  isPinned: (code: string) => boolean;
  dismissSuggestion: () => void;
  isSuggestionDismissed: boolean;
  permissionError: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [detectedLocation, setDetectedLocation] = useState<DetectedLocation | null>(() => {
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [pinnedCurrencyCode, setPinnedCurrencyCode] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PINNED_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  const [isSuggestionDismissed, setIsSuggestionDismissed] = useState<boolean>(() => {
    try {
      const dismissed = sessionStorage.getItem(DISMISSED_SUGGESTION_KEY);
      return dismissed === 'true';
    } catch {
      return false;
    }
  });

  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Pin currency action
  const pinCurrency = useCallback((code: string) => {
    setPinnedCurrencyCode(code);
    try {
      localStorage.setItem(PINNED_STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  // Unpin currency action
  const unpinCurrency = useCallback(() => {
    setPinnedCurrencyCode(null);
    try {
      localStorage.removeItem(PINNED_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const isPinned = useCallback(
    (code: string) => {
      return pinnedCurrencyCode === code;
    },
    [pinnedCurrencyCode]
  );

  const dismissSuggestion = useCallback(() => {
    setIsSuggestionDismissed(true);
    try {
      sessionStorage.setItem(DISMISSED_SUGGESTION_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  // Detect location using browser Geolocation API
  const detectLocation = useCallback(
    async (currencies: Currency[], force = false): Promise<DetectedLocation | null> => {
      // If we already detected recently and not forcing, return existing
      if (!force && detectedLocation && Date.now() - detectedLocation.timestamp < 1000 * 60 * 30) {
        return detectedLocation;
      }

      setStatus('detecting');
      setPermissionError(null);

      try {
        const result = await detectUserRegion(currencies);
        setDetectedLocation(result);
        setStatus('detected');
        try {
          localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(result));
        } catch {
          // ignore
        }
        return result;
      } catch (err: any) {
        console.error('Error detecting location:', err);
        setStatus('denied');
        setPermissionError(err?.message || 'Could not access geolocation');
        return null;
      }
    },
    [detectedLocation]
  );

  return (
    <LocationContext.Provider
      value={{
        status,
        detectedLocation,
        pinnedCurrencyCode,
        detectLocation,
        pinCurrency,
        unpinCurrency,
        isPinned,
        dismissSuggestion,
        isSuggestionDismissed,
        permissionError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
