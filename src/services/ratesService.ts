import { Currency, RateMode } from '../types/currency';
import { INITIAL_CURRENCIES } from '../data/currencies';

const STORAGE_KEY = 'dirhampay_rates_cache_v1';
const TIMESTAMP_KEY = 'dirhampay_last_updated_v1';

export interface RateCacheData {
  currencies: Currency[];
  lastUpdated: string;
  isOnlineSource: boolean;
}

export async function fetchLiveRates(): Promise<RateCacheData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch('https://open.er-api.com/v6/latest/MAD', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Rates API returned status ${res.status}`);
    }

    const data = await res.json();
    if (data && data.rates) {
      // data.rates is 1 MAD = X Foreign Currency
      // Therefore 1 Foreign Currency = 1 / data.rates[CODE] MAD
      const updatedCurrencies = INITIAL_CURRENCIES.map((curr) => {
        const rateInForeign = data.rates[curr.code];
        if (rateInForeign && rateInForeign > 0) {
          const newRateToMad = curr.code === 'JPY' ? (100 / rateInForeign) : (1 / rateInForeign);
          const oldRate = curr.rateToMad;
          const pctChange = Number((((newRateToMad - oldRate) / oldRate) * 100).toFixed(2));
          
          const newSparkline = [...curr.sparkline.slice(1), Number(newRateToMad.toFixed(3))];

          return {
            ...curr,
            rateToMad: Number(newRateToMad.toFixed(curr.rateToMad < 1 ? 4 : 3)),
            change24h: pctChange !== 0 ? pctChange : curr.change24h,
            sparkline: newSparkline,
          };
        }
        return curr;
      });

      const now = new Date().toISOString();
      saveToCache(updatedCurrencies, now);
      return {
        currencies: updatedCurrencies,
        lastUpdated: now,
        isOnlineSource: true,
      };
    }
  } catch {
    // Graceful offline fallback
  }

  // Fallback to cache or initial
  return loadFromCache();
}

export function saveToCache(currencies: Currency[], timestamp: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies));
    localStorage.setItem(TIMESTAMP_KEY, timestamp);
  } catch {
    // LocalStorage quota or restricted mode
  }
}

export function loadFromCache(): RateCacheData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ts = localStorage.getItem(TIMESTAMP_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          currencies: parsed,
          lastUpdated: ts || new Date().toISOString(),
          isOnlineSource: false,
        };
      }
    }
  } catch {
    // ignore
  }

  return {
    currencies: INITIAL_CURRENCIES,
    lastUpdated: new Date().toISOString(),
    isOnlineSource: false,
  };
}

/**
 * Computes adjusted conversion rate based on selected Mode:
 * - 'official': Bank Al-Maghrib mid-market reference rate
 * - 'cash_exchange': Bureau de change with realistic buy/sell spread (~1.8% to 2.5%)
 * - 'card_atm': Visa/Mastercard exchange with typical cross-border fee (~1.2%)
 */
export function getEffectiveRate(
  currency: Currency,
  mode: RateMode,
  direction: 'FOREIGN_TO_MAD' | 'MAD_TO_FOREIGN'
): { rate: number; spreadLabel: string } {
  const baseRate = currency.rateToMad;

  if (mode === 'official') {
    return {
      rate: baseRate,
      spreadLabel: 'Bank Al-Maghrib (BAM) Official Benchmark',
    };
  }

  if (mode === 'cash_exchange') {
    if (direction === 'FOREIGN_TO_MAD') {
      // Selling Foreign currency to get MAD -> Bureau pays slightly less
      const effective = baseRate * (1 + currency.cashBuySpread);
      return {
        rate: Number(effective.toFixed(4)),
        spreadLabel: `Cash Desk Buy Rate (${(currency.cashBuySpread * 100).toFixed(1)}%)`,
      };
    } else {
      // Buying Foreign currency with MAD -> Bureau charges slightly more MAD
      const effective = baseRate * (1 + currency.cashSellSpread);
      return {
        rate: Number(effective.toFixed(4)),
        spreadLabel: `Cash Desk Sell Rate (+${(currency.cashSellSpread * 100).toFixed(1)}%)`,
      };
    }
  }

  // Card & ATM mode
  const atmSpread = direction === 'FOREIGN_TO_MAD' ? -0.012 : 0.012;
  const effective = baseRate * (1 + atmSpread);
  return {
    rate: Number(effective.toFixed(4)),
    spreadLabel: 'Visa / Mastercard ATM Spread (±1.2%)',
  };
}

/**
 * Moroccan Ryal & Santimat calculation
 * In Morocco:
 * 1 Dirham (DH) = 20 Ryals (ريال)
 * 1 Dirham (DH) = 100 Santims (سنتيم)
 * 1 Ryal = 5 Santims
 */
export interface MoroccanTraditionalBreakdown {
  dirhams: number;
  ryals: number;
  santimat: number;
  verbalDarija: string;
}

export function toMoroccanTraditional(madAmount: number): MoroccanTraditionalBreakdown {
  const roundedMad = Number(madAmount.toFixed(2));
  const ryals = Math.round(roundedMad * 20);
  const santimat = Math.round(roundedMad * 100);

  // Generate colloquial verbal hint
  let verbalDarija = '';
  if (roundedMad === 5) {
    verbalDarija = '100 Ryal (Mya Ryal / مية ريال)';
  } else if (roundedMad === 10) {
    verbalDarija = '200 Ryal (Myatayn Ryal / ميتين ريال)';
  } else if (roundedMad === 20) {
    verbalDarija = '400 Ryal (Arbaamya Ryal / ربعمية ريال)';
  } else if (roundedMad === 50) {
    verbalDarija = '1,000 Ryal (Alf Ryal / ألف ريال)';
  } else if (roundedMad === 100) {
    verbalDarija = '2,000 Ryal (Alfayn Ryal / ألفين ريال)';
  } else if (roundedMad === 200) {
    verbalDarija = '4,000 Ryal (Arbaat Alaf Ryal / 4 آلاف ريال)';
  } else if (roundedMad === 500) {
    verbalDarija = '10,000 Ryal (Achrat Alaf Ryal)';
  } else if (roundedMad >= 10000) {
    const millionsSantim = (roundedMad / 10000).toFixed(1);
    verbalDarija = `${millionsSantim} Million Santim (مليون سنتيم)`;
  } else {
    verbalDarija = `${ryals.toLocaleString()} Ryal (${santimat.toLocaleString()} Santim)`;
  }

  return {
    dirhams: roundedMad,
    ryals,
    santimat,
    verbalDarija,
  };
}

export function fromRyalsToDirhams(ryals: number): number {
  return Number((ryals / 20).toFixed(2));
}

export function fromSantimsToDirhams(santims: number): number {
  return Number((santims / 100).toFixed(2));
}
