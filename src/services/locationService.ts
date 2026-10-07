// Mapping between ISO country codes and supported currency codes
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // European Union & Eurozone
  FR: 'EUR',
  DE: 'EUR',
  ES: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  PT: 'EUR',
  IE: 'EUR',
  AT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  CY: 'EUR',
  MT: 'EUR',
  SK: 'EUR',
  SI: 'EUR',
  EE: 'EUR',
  LV: 'EUR',
  LT: 'EUR',
  HR: 'EUR',

  // United States & Americas
  US: 'USD',
  CA: 'CAD',

  // United Kingdom
  GB: 'GBP',
  UK: 'GBP',

  // Gulf & Middle East
  SA: 'SAR',
  AE: 'AED',
  QA: 'QAR',
  KW: 'KWD',
  BH: 'BHD',
  OM: 'OMR',
  TR: 'TRY',

  // Europe non-euro
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',

  // Asia / Pacific
  CN: 'CNY',
  JP: 'JPY',
  AU: 'AUD',

  // North Africa & Africa
  TN: 'TND',
  DZ: 'DZD',
  EG: 'EGP',
  ZA: 'ZAR',
  MA: 'MAD', // Morocco
};

export interface DetectedLocationResult {
  countryCode: string;
  countryName: string;
  city?: string;
  suggestedCurrencyCode: string;
  isInsideMorocco: boolean;
  source: 'gps' | 'timezone' | 'locale';
}

/**
 * Fallback detection using browser Intl timezone
 */
export function detectByTimezone(): DetectedLocationResult {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const tzLower = timeZone.toLowerCase();

    if (tzLower.includes('casablanca')) {
      return {
        countryCode: 'MA',
        countryName: 'Morocco',
        city: 'Casablanca',
        suggestedCurrencyCode: 'EUR', // For travelers in Morocco, EUR is most common
        isInsideMorocco: true,
        source: 'timezone',
      };
    }

    if (tzLower.includes('paris') || tzLower.includes('berlin') || tzLower.includes('madrid') || tzLower.includes('rome') || tzLower.includes('brussels') || tzLower.includes('amsterdam')) {
      return { countryCode: 'FR', countryName: 'Europe (Eurozone)', city: 'Europe', suggestedCurrencyCode: 'EUR', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('london')) {
      return { countryCode: 'GB', countryName: 'United Kingdom', city: 'London', suggestedCurrencyCode: 'GBP', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('new_york') || tzLower.includes('chicago') || tzLower.includes('los_angeles') || tzLower.includes('denver')) {
      return { countryCode: 'US', countryName: 'United States', city: 'USA', suggestedCurrencyCode: 'USD', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('toronto') || tzLower.includes('vancouver') || tzLower.includes('montreal')) {
      return { countryCode: 'CA', countryName: 'Canada', city: 'Canada', suggestedCurrencyCode: 'CAD', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('riyadh')) {
      return { countryCode: 'SA', countryName: 'Saudi Arabia', city: 'Riyadh', suggestedCurrencyCode: 'SAR', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('dubai')) {
      return { countryCode: 'AE', countryName: 'United Arab Emirates', city: 'Dubai', suggestedCurrencyCode: 'AED', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('doha')) {
      return { countryCode: 'QA', countryName: 'Qatar', city: 'Doha', suggestedCurrencyCode: 'QAR', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('kuwait')) {
      return { countryCode: 'KW', countryName: 'Kuwait', city: 'Kuwait', suggestedCurrencyCode: 'KWD', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('zurich') || tzLower.includes('geneva')) {
      return { countryCode: 'CH', countryName: 'Switzerland', city: 'Zurich', suggestedCurrencyCode: 'CHF', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('istanbul')) {
      return { countryCode: 'TR', countryName: 'Turkey', city: 'Istanbul', suggestedCurrencyCode: 'TRY', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('tokyo')) {
      return { countryCode: 'JP', countryName: 'Japan', city: 'Tokyo', suggestedCurrencyCode: 'JPY', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('shanghai') || tzLower.includes('beijing')) {
      return { countryCode: 'CN', countryName: 'China', city: 'Beijing', suggestedCurrencyCode: 'CNY', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('sydney') || tzLower.includes('melbourne')) {
      return { countryCode: 'AU', countryName: 'Australia', city: 'Sydney', suggestedCurrencyCode: 'AUD', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('stockholm')) {
      return { countryCode: 'SE', countryName: 'Sweden', city: 'Stockholm', suggestedCurrencyCode: 'SEK', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('oslo')) {
      return { countryCode: 'NO', countryName: 'Norway', city: 'Oslo', suggestedCurrencyCode: 'NOK', isInsideMorocco: false, source: 'timezone' };
    }
    if (tzLower.includes('copenhagen')) {
      return { countryCode: 'DK', countryName: 'Denmark', city: 'Copenhagen', suggestedCurrencyCode: 'DKK', isInsideMorocco: false, source: 'timezone' };
    }
  } catch {
    // ignore
  }

  // Generic Eurozone / Major default
  return {
    countryCode: 'EU',
    countryName: 'European Union',
    city: 'Europe',
    suggestedCurrencyCode: 'EUR',
    isInsideMorocco: false,
    source: 'locale',
  };
}

/**
 * Reverse geocode latitude and longitude to country code
 */
export async function reverseGeocodeCoords(lat: number, lon: number): Promise<DetectedLocationResult> {
  // Rough geographic bounding box checks first (instant & offline-safe)
  // Morocco: lat ~ 21 to 36, lon ~ -17 to -1
  if (lat >= 21 && lat <= 36 && lon >= -17 && lon <= -1) {
    return {
      countryCode: 'MA',
      countryName: 'Morocco',
      city: 'Morocco',
      suggestedCurrencyCode: 'EUR', // Popular foreign pair
      isInsideMorocco: true,
      source: 'gps',
    };
  }

  // France / Spain / Western Europe
  if (lat >= 36 && lat <= 51 && lon >= -10 && lon <= 10) {
    if (lon < -3 && lat < 44) {
      return { countryCode: 'ES', countryName: 'Spain', city: 'Spain', suggestedCurrencyCode: 'EUR', isInsideMorocco: false, source: 'gps' };
    }
    return { countryCode: 'FR', countryName: 'France', city: 'France', suggestedCurrencyCode: 'EUR', isInsideMorocco: false, source: 'gps' };
  }

  // UK: lat 50 to 59, lon -8 to 2
  if (lat >= 50 && lat <= 59 && lon >= -8 && lon <= 2) {
    return { countryCode: 'GB', countryName: 'United Kingdom', city: 'UK', suggestedCurrencyCode: 'GBP', isInsideMorocco: false, source: 'gps' };
  }

  // USA: lat 24 to 50, lon -125 to -66
  if (lat >= 24 && lat <= 50 && lon >= -125 && lon <= -66) {
    return { countryCode: 'US', countryName: 'United States', city: 'USA', suggestedCurrencyCode: 'USD', isInsideMorocco: false, source: 'gps' };
  }

  // Canada: lat 45 to 70, lon -140 to -52
  if (lat >= 45 && lat <= 70 && lon >= -140 && lon <= -52) {
    return { countryCode: 'CA', countryName: 'Canada', city: 'Canada', suggestedCurrencyCode: 'CAD', isInsideMorocco: false, source: 'gps' };
  }

  // Gulf / Saudi / UAE: lat 16 to 32, lon 34 to 60
  if (lat >= 16 && lat <= 32 && lon >= 34 && lon <= 60) {
    if (lon > 51) {
      return { countryCode: 'AE', countryName: 'United Arab Emirates', city: 'UAE', suggestedCurrencyCode: 'AED', isInsideMorocco: false, source: 'gps' };
    }
    return { countryCode: 'SA', countryName: 'Saudi Arabia', city: 'Saudi Arabia', suggestedCurrencyCode: 'SAR', isInsideMorocco: false, source: 'gps' };
  }

  // Try BigDataCloud free client reverse geocoding API for exact city/country
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const code = (data.countryCode || '').toUpperCase();
      const name = data.countryName || 'Detected Region';
      const city = data.city || data.locality || '';
      const suggestedCurrency = COUNTRY_TO_CURRENCY[code] || 'USD';

      return {
        countryCode: code,
        countryName: name,
        city,
        suggestedCurrencyCode: suggestedCurrency,
        isInsideMorocco: code === 'MA',
        source: 'gps',
      };
    }
  } catch {
    // Network timeout or blocked, proceed to fallback
  }

  return detectByTimezone();
}
