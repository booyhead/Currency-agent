export type NoteCategory = 
  | 'food' 
  | 'shopping' 
  | 'transport' 
  | 'hotel' 
  | 'activity' 
  | 'atm' 
  | 'general';

export interface NoteCategoryInfo {
  id: NoteCategory;
  label: string;
  labelFr: string;
  icon: string; // emoji
  colorClass: string;
}

export const NOTE_CATEGORIES: NoteCategoryInfo[] = [
  { id: 'general', label: 'General', labelFr: 'Général', icon: '📝', colorClass: 'text-slate-300 bg-slate-800' },
  { id: 'food', label: 'Food & Café', labelFr: 'Repas & Café', icon: '🍲', colorClass: 'text-amber-400 bg-amber-500/10' },
  { id: 'shopping', label: 'Souk & Crafts', labelFr: 'Souk & Achats', icon: '🛍️', colorClass: 'text-emerald-400 bg-emerald-500/10' },
  { id: 'transport', label: 'Taxi & Travel', labelFr: 'Taxi & Transport', icon: '🚕', colorClass: 'text-sky-400 bg-sky-500/10' },
  { id: 'hotel', label: 'Hotel & Riad', labelFr: 'Hôtel & Riad', icon: '🏨', colorClass: 'text-indigo-400 bg-indigo-500/10' },
  { id: 'activity', label: 'Tours & Guide', labelFr: 'Visites & Guide', icon: '🗺️', colorClass: 'text-purple-400 bg-purple-500/10' },
  { id: 'atm', label: 'ATM / Cash', labelFr: 'DAB & Change', icon: '🏦', colorClass: 'text-rose-400 bg-rose-500/10' },
];

export interface ConversionNote {
  id: string;
  timestamp: string; // ISO string
  currencyCode: string; // e.g. 'EUR'
  currencyFlag: string;
  direction: 'FOREIGN_TO_MAD' | 'MAD_TO_FOREIGN';
  sourceAmount: number;
  targetAmount: number;
  rate: number;
  rateMode: 'official' | 'cash_exchange' | 'card_atm';
  memo: string;
  category: NoteCategory;
}
