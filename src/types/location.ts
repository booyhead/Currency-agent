export type GeolocationStatus = 'idle' | 'detecting' | 'detected' | 'denied' | 'unsupported';

export interface DetectedLocation {
  countryCode: string; // ISO 2-letter code e.g. 'US', 'GB', 'FR', 'MA'
  countryName: string;
  city?: string;
  currencyCode: string; // e.g. 'USD', 'GBP', 'EUR', 'MAD'
  currencyName: string;
  currencyFlag: string;
  currencySymbol: string;
  isSupported: boolean;
  isBaseCurrency: boolean; // true if MAD
  detectionMethod: 'gps' | 'network' | 'timezone';
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
  timestamp: number;
}
