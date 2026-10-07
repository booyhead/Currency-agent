export interface Currency {
  code: string;
  name: string;
  nameAr: string;
  nameFr: string;
  symbol: string;
  country: string;
  flag: string;
  category: 'major' | 'europe' | 'americas' | 'gulf' | 'asia_pacific' | 'africa';
  rateToMad: number; // 1 Foreign Unit = X MAD
  change24h: number; // percentage change, e.g. +0.12 or -0.34
  sparkline: number[];
  bamCode?: string; // Bank Al-Maghrib internal code
  bankBuySpread: number; // e.g. -0.015 (1.5% below mid)
  bankSellSpread: number; // e.g. +0.015 (1.5% above mid)
  cashBuySpread: number; // e.g. -0.025
  cashSellSpread: number; // e.g. +0.025
}

export type RateMode = 'official' | 'cash_exchange' | 'card_atm';

export type ExchangeDirection = 'FOREIGN_TO_MAD' | 'MAD_TO_FOREIGN';

export interface BanknoteInfo {
  denomination: number;
  type: 'note' | 'coin';
  colorName: string;
  primaryColor: string;
  accentColor: string;
  theme: string;
  description: string;
  culturalIcons: string[];
  travelerTips: string;
}

export interface RemittanceOption {
  name: string;
  transferFeeUsd: number;
  spreadPercent: number;
  deliverySpeed: string;
  method: string;
  recommendedFor: string;
}
