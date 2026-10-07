import { Currency } from '../types/currency';
import { DetectedLocation } from '../types/location';

// Eurozone countries mapping to EUR
const EUROZONE_COUNTRIES = [
  'FR', 'DE', 'ES', 'IT', 'PT', 'NL', 'BE', 'AT', 'IE', 'FI',
  'GR', 'LU', 'CY', 'MT', 'SK', 'SI', 'EE', 'LV', 'LT', 'HR',
  'AD', 'MC', 'SM', 'VA', 'ME', 'XK'
];

// Country Code (ISO 2-letter) to Currency Code mapping
export const COUNTRY_TO_CURRENCY_MAP: Record<string, { currency: string; name: string; flag: string; symbol: string }> = {
  // Morocco (Base Currency)
  MA: { currency: 'MAD', name: 'Moroccan Dirham', flag: '🇲🇦', symbol: 'DH' },

  // Supported App Currencies
  US: { currency: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  GB: { currency: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  SA: { currency: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', symbol: '﷼' },
  AE: { currency: 'AED', name: 'UAE Dirham', flag: '🇦🇪', symbol: 'د.إ' },
  CA: { currency: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'CA$' },
  CH: { currency: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'CHF' },
  QA: { currency: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', symbol: 'ر.ق' },
  KW: { currency: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', symbol: 'د.ك' },
  TR: { currency: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', symbol: '₺' },
  SE: { currency: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', symbol: 'kr' },
  NO: { currency: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', symbol: 'kr' },
  DK: { currency: 'DKK', name: 'Danish Krone', flag: '🇩🇰', symbol: 'kr' },
  CN: { currency: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' },
  JP: { currency: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
  AU: { currency: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  BH: { currency: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', symbol: '.د.ب' },
  OM: { currency: 'OMR', name: 'Omani Rial', flag: '🇴🇲', symbol: 'ر.ع.' },
  TN: { currency: 'TND', name: 'Tunisian Dinar', flag: '🇹🇳', symbol: 'د.ت' },
  DZ: { currency: 'DZD', name: 'Algerian Dinar', flag: '🇩🇿', symbol: 'د.ج' },
  EG: { currency: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬', symbol: 'E£' },
  ZA: { currency: 'ZAR', name: 'South African Rand', flag: '🇿🇦', symbol: 'R' },

  // Other major countries mapped to supported currencies or standard codes
  EC: { currency: 'USD', name: 'US Dollar', flag: '🇪🇨', symbol: '$' },
  PR: { currency: 'USD', name: 'US Dollar', flag: '🇵🇷', symbol: '$' },
  PA: { currency: 'USD', name: 'US Dollar', flag: '🇵🇦', symbol: '$' },
  NZ: { currency: 'AUD', name: 'Australian Dollar (Nearest)', flag: '🇳🇿', symbol: '$' },
};

// Add Eurozone countries
EUROZONE_COUNTRIES.forEach((code) => {
  if (!COUNTRY_TO_CURRENCY_MAP[code]) {
    COUNTRY_TO_CURRENCY_MAP[code] = {
      currency: 'EUR',
      name: 'Euro',
      flag: '🇪🇺',
      symbol: '€',
    };
  }
});

// Country names lookup for display
export const COUNTRY_NAMES: Record<string, string> = {
  MA: 'Morocco',
  FR: 'France',
  DE: 'Germany',
  ES: 'Spain',
  IT: 'Italy',
  GB: 'United Kingdom',
  US: 'United States',
  CA: 'Canada',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  CH: 'Switzerland',
  QA: 'Qatar',
  KW: 'Kuwait',
  TR: 'Turkey',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  CN: 'China',
  JP: 'Japan',
  AU: 'Australia',
  BH: 'Bahrain',
  OM: 'Oman',
  TN: 'Tunisia',
  DZ: 'Algeria',
  EG: 'Egypt',
  ZA: 'South Africa',
  BE: 'Belgium',
  NL: 'Netherlands',
  PT: 'Portugal',
  IE: 'Ireland',
  AT: 'Austria',
  GR: 'Greece',
};

// Offline coordinate bounding boxes and centroids for instant regional matching
interface CoordinateRegion {
  countryCode: string;
  countryName: string;
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  centerLat: number;
  centerLon: number;
}

const REGION_BOUNDS: CoordinateRegion[] = [
  { countryCode: 'MA', countryName: 'Morocco', minLat: 27.0, maxLat: 36.2, minLon: -13.5, maxLon: -1.0, centerLat: 31.79, centerLon: -7.09 },
  { countryCode: 'GB', countryName: 'United Kingdom', minLat: 49.8, maxLat: 60.9, minLon: -8.6, maxLon: 1.8, centerLat: 55.37, centerLon: -3.43 },
  { countryCode: 'FR', countryName: 'France', minLat: 42.3, maxLat: 51.1, minLon: -4.8, maxLon: 8.2, centerLat: 46.22, centerLon: 2.21 },
  { countryCode: 'DE', countryName: 'Germany', minLat: 47.2, maxLat: 55.1, minLon: 5.8, maxLon: 15.0, centerLat: 51.16, centerLon: 10.45 },
  { countryCode: 'ES', countryName: 'Spain', minLat: 35.9, maxLat: 43.8, minLon: -9.3, maxLon: 3.3, centerLat: 40.46, centerLon: -3.74 },
  { countryCode: 'IT', countryName: 'Italy', minLat: 36.6, maxLat: 47.1, minLon: 6.6, maxLon: 18.5, centerLat: 41.87, centerLon: 12.56 },
  { countryCode: 'CH', countryName: 'Switzerland', minLat: 45.8, maxLat: 47.8, minLon: 5.9, maxLon: 10.5, centerLat: 46.81, centerLon: 8.22 },
  { countryCode: 'US', countryName: 'United States', minLat: 24.5, maxLat: 49.4, minLon: -125.0, maxLon: -66.9, centerLat: 37.09, centerLon: -95.71 },
  { countryCode: 'CA', countryName: 'Canada', minLat: 41.6, maxLat: 70.0, minLon: -141.0, maxLon: -52.6, centerLat: 56.13, centerLon: -106.34 },
  { countryCode: 'SA', countryName: 'Saudi Arabia', minLat: 16.3, maxLat: 32.2, minLon: 34.5, maxLon: 55.7, centerLat: 23.88, centerLon: 45.07 },
  { countryCode: 'AE', countryName: 'United Arab Emirates', minLat: 22.6, maxLat: 26.1, minLon: 51.5, maxLon: 56.4, centerLat: 23.42, centerLon: 53.84 },
  { countryCode: 'QA', countryName: 'Qatar', minLat: 24.5, maxLat: 26.2, minLon: 50.7, maxLon: 51.7, centerLat: 25.35, centerLon: 51.18 },
  { countryCode: 'KW', countryName: 'Kuwait', minLat: 28.5, maxLat: 30.1, minLon: 46.5, maxLon: 48.5, centerLat: 29.31, centerLon: 47.48 },
  { countryCode: 'BH', countryName: 'Bahrain', minLat: 25.8, maxLat: 26.3, minLon: 50.4, maxLon: 50.7, centerLat: 26.06, centerLon: 50.55 },
  { countryCode: 'OM', countryName: 'Oman', minLat: 16.5, maxLat: 26.5, minLon: 52.0, maxLon: 60.0, centerLat: 21.47, centerLon: 55.97 },
  { countryCode: 'TR', countryName: 'Turkey', minLat: 35.8, maxLat: 42.1, minLon: 25.6, maxLon: 44.8, centerLat: 38.96, centerLon: 35.24 },
  { countryCode: 'SE', countryName: 'Sweden', minLat: 55.3, maxLat: 69.1, minLon: 11.0, maxLon: 24.2, centerLat: 60.12, centerLon: 18.64 },
  { countryCode: 'NO', countryName: 'Norway', minLat: 57.9, maxLat: 71.2, minLon: 4.5, maxLon: 31.1, centerLat: 60.47, centerLon: 8.46 },
  { countryCode: 'DK', countryName: 'Denmark', minLat: 54.5, maxLat: 57.8, minLon: 8.0, maxLon: 12.7, centerLat: 56.26, centerLon: 9.50 },
  { countryCode: 'EG', countryName: 'Egypt', minLat: 21.9, maxLat: 31.7, minLon: 24.7, maxLon: 36.9, centerLat: 26.82, centerLon: 30.80 },
  { countryCode: 'TN', countryName: 'Tunisia', minLat: 30.2, maxLat: 37.6, minLon: 7.5, maxLon: 11.6, centerLat: 33.88, centerLon: 9.53 },
  { countryCode: 'DZ', countryName: 'Algeria', minLat: 18.9, maxLat: 37.1, minLon: -8.7, maxLon: 12.0, centerLat: 28.03, centerLon: 1.65 },
  { countryCode: 'ZA', countryName: 'South Africa', minLat: -34.9, maxLat: -22.1, minLon: 16.4, maxLon: 32.9, centerLat: -30.55, centerLon: 22.93 },
  { countryCode: 'CN', countryName: 'China', minLat: 18.0, maxLat: 53.6, minLon: 73.5, maxLon: 135.0, centerLat: 35.86, centerLon: 104.19 },
  { countryCode: 'JP', countryName: 'Japan', minLat: 24.0, maxLat: 45.6, minLon: 122.9, maxLon: 153.9, centerLat: 36.20, centerLon: 138.25 },
  { countryCode: 'AU', countryName: 'Australia', minLat: -43.7, maxLat: -10.0, minLon: 113.0, maxLon: 153.7, centerLat: -25.27, centerLon: 133.77 },
];

/**
 * Match coordinates to a region using bounding boxes and euclidean distance
 */
export function matchCoordinatesToRegion(lat: number, lon: number): { countryCode: string; countryName: string } {
  // First check if inside exact bounding box
  for (const region of REGION_BOUNDS) {
    if (lat >= region.minLat && lat <= region.maxLat && lon >= region.minLon && lon <= region.maxLon) {
      return { countryCode: region.countryCode, countryName: region.countryName };
    }
  }

  // If outside all bounds (e.g. at borders or oceans), find nearest centroid
  let closest = REGION_BOUNDS[0];
  let minDistance = Infinity;

  for (const region of REGION_BOUNDS) {
    const dLat = lat - region.centerLat;
    const dLon = lon - region.centerLon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDistance) {
      minDistance = distSq;
      closest = region;
    }
  }

  return { countryCode: closest.countryCode, countryName: closest.countryName };
}

/**
 * Determine country from browser Timezone and Locale as a solid fallback
 */
export function detectLocationFromTimezone(): { countryCode: string; countryName: string; city?: string } {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const parts = tz.split('/');
    const city = parts[parts.length - 1]?.replace(/_/g, ' ');

    if (tz.includes('Casablanca')) return { countryCode: 'MA', countryName: 'Morocco', city };
    if (tz.includes('London')) return { countryCode: 'GB', countryName: 'United Kingdom', city };
    if (tz.includes('Paris')) return { countryCode: 'FR', countryName: 'France', city };
    if (tz.includes('Berlin')) return { countryCode: 'DE', countryName: 'Germany', city };
    if (tz.includes('Madrid')) return { countryCode: 'ES', countryName: 'Spain', city };
    if (tz.includes('Rome')) return { countryCode: 'IT', countryName: 'Italy', city };
    if (tz.includes('Zurich')) return { countryCode: 'CH', countryName: 'Switzerland', city };
    if (tz.includes('New_York') || tz.includes('Chicago') || tz.includes('Los_Angeles') || tz.includes('Denver')) {
      return { countryCode: 'US', countryName: 'United States', city };
    }
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) {
      return { countryCode: 'CA', countryName: 'Canada', city };
    }
    if (tz.includes('Riyadh')) return { countryCode: 'SA', countryName: 'Saudi Arabia', city };
    if (tz.includes('Dubai')) return { countryCode: 'AE', countryName: 'United Arab Emirates', city };
    if (tz.includes('Qatar')) return { countryCode: 'QA', countryName: 'Qatar', city };
    if (tz.includes('Kuwait')) return { countryCode: 'KW', countryName: 'Kuwait', city };
    if (tz.includes('Bahrain')) return { countryCode: 'BH', countryName: 'Bahrain', city };
    if (tz.includes('Muscat')) return { countryCode: 'OM', countryName: 'Oman', city };
    if (tz.includes('Istanbul')) return { countryCode: 'TR', countryName: 'Turkey', city };
    if (tz.includes('Stockholm')) return { countryCode: 'SE', countryName: 'Sweden', city };
    if (tz.includes('Oslo')) return { countryCode: 'NO', countryName: 'Norway', city };
    if (tz.includes('Copenhagen')) return { countryCode: 'DK', countryName: 'Denmark', city };
    if (tz.includes('Shanghai') || tz.includes('Beijing')) return { countryCode: 'CN', countryName: 'China', city };
    if (tz.includes('Tokyo')) return { countryCode: 'JP', countryName: 'Japan', city };
    if (tz.includes('Sydney') || tz.includes('Melbourne')) return { countryCode: 'AU', countryName: 'Australia', city };
    if (tz.includes('Cairo')) return { countryCode: 'EG', countryName: 'Egypt', city };
    if (tz.includes('Tunis')) return { countryCode: 'TN', countryName: 'Tunisia', city };
    if (tz.includes('Algiers')) return { countryCode: 'DZ', countryName: 'Algeria', city };
    if (tz.includes('Johannesburg')) return { countryCode: 'ZA', countryName: 'South Africa', city };

    // Regional heuristics
    if (tz.startsWith('Europe/')) return { countryCode: 'FR', countryName: 'Europe', city };
    if (tz.startsWith('America/')) return { countryCode: 'US', countryName: 'North America', city };
  } catch {
    // ignore
  }

  // Locale fallback
  const lang = navigator.language || 'en-US';
  if (lang.includes('US')) return { countryCode: 'US', countryName: 'United States' };
  if (lang.includes('GB')) return { countryCode: 'GB', countryName: 'United Kingdom' };
  if (lang.includes('FR')) return { countryCode: 'FR', countryName: 'France' };
  if (lang.includes('MA') || lang.startsWith('ar-MA')) return { countryCode: 'MA', countryName: 'Morocco' };
  if (lang.includes('SA')) return { countryCode: 'SA', countryName: 'Saudi Arabia' };
  if (lang.includes('AE')) return { countryCode: 'AE', countryName: 'United Arab Emirates' };
  if (lang.includes('CA')) return { countryCode: 'CA', countryName: 'Canada' };

  return { countryCode: 'FR', countryName: 'Europe' };
}

/**
 * Reverse geocode coordinates using public client API with graceful timeout
 */
async function reverseGeocodeNetwork(lat: number, lon: number): Promise<{ countryCode: string; countryName: string; city?: string } | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.countryCode) {
        return {
          countryCode: data.countryCode.toUpperCase(),
          countryName: data.countryName || COUNTRY_NAMES[data.countryCode.toUpperCase()] || 'Detected Region',
          city: data.city || data.locality || data.principalSubdivision,
        };
      }
    }
  } catch {
    // network failure or abort, fallback to coordinate bounds
  } finally {
    clearTimeout(timeoutId);
  }

  return null;
}

/**
 * Main detection function using Browser Geolocation API
 */
export async function detectUserRegion(supportedCurrencies: Currency[]): Promise<DetectedLocation> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      // Browser does not support geolocation, fallback to timezone/locale
      const tzFallback = detectLocationFromTimezone();
      resolve(buildDetectedLocation(tzFallback.countryCode, tzFallback.countryName, tzFallback.city, 'timezone', supportedCurrencies));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Try network reverse geocode first
        let location = await reverseGeocodeNetwork(latitude, longitude);

        let method: 'gps' | 'network' = 'network';
        // If network geocode didn't work, use coordinate bounds matcher
        if (!location) {
          location = matchCoordinatesToRegion(latitude, longitude);
          method = 'gps';
        }

        resolve(
          buildDetectedLocation(
            location.countryCode,
            location.countryName,
            location.city,
            method,
            supportedCurrencies,
            latitude,
            longitude,
            accuracy
          )
        );
      },
      (error) => {
        // Geolocation denied, unavailable, or timed out - gracefully fallback to timezone
        console.warn('Geolocation failed or denied, using timezone fallback:', error?.message);
        const tzFallback = detectLocationFromTimezone();
        resolve(
          buildDetectedLocation(
            tzFallback.countryCode,
            tzFallback.countryName,
            tzFallback.city,
            'timezone',
            supportedCurrencies
          )
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 6000,
        maximumAge: 300000, // cache up to 5 min
      }
    );
  });
}

function buildDetectedLocation(
  countryCode: string,
  countryName: string,
  city: string | undefined,
  method: 'gps' | 'network' | 'timezone',
  supportedCurrencies: Currency[],
  lat?: number,
  lon?: number,
  accuracy?: number
): DetectedLocation {
  const mapped = COUNTRY_TO_CURRENCY_MAP[countryCode] || {
    currency: 'USD',
    name: 'US Dollar',
    flag: '🌐',
    symbol: '$',
  };

  const isBaseCurrency = mapped.currency === 'MAD';
  const isSupported = isBaseCurrency || supportedCurrencies.some((c) => c.code === mapped.currency);

  return {
    countryCode,
    countryName: countryName || COUNTRY_NAMES[countryCode] || countryCode,
    city,
    currencyCode: mapped.currency,
    currencyName: mapped.name,
    currencyFlag: mapped.flag,
    currencySymbol: mapped.symbol,
    isSupported,
    isBaseCurrency,
    detectionMethod: method,
    latitude: lat,
    longitude: lon,
    accuracyMeters: accuracy,
    timestamp: Date.now(),
  };
}
