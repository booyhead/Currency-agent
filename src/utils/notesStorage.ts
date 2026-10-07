import { ConversionNote } from '../types/note';

const NOTES_STORAGE_KEY = 'dirhamconvert_personal_notes_v1';

// Sample initial notes to give users immediate context of how notes work in Morocco
const SAMPLE_NOTES: ConversionNote[] = [
  {
    id: 'sample-1',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    currencyCode: 'EUR',
    currencyFlag: '🇪🇺',
    direction: 'FOREIGN_TO_MAD',
    sourceAmount: 35,
    targetAmount: 379.4,
    rate: 10.84,
    rateMode: 'official',
    memo: 'Traditional dinner at Medina riad (tagine & mint tea)',
    category: 'food',
  },
  {
    id: 'sample-2',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    currencyCode: 'EUR',
    currencyFlag: '🇪🇺',
    direction: 'FOREIGN_TO_MAD',
    sourceAmount: 150,
    targetAmount: 1626,
    rate: 10.84,
    rateMode: 'official',
    memo: 'Berber rug & leather babouches in Souk Semmarine',
    category: 'shopping',
  },
];

export const getStoredNotes = (): ConversionNote[] => {
  try {
    const raw = localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(SAMPLE_NOTES));
      return SAMPLE_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load notes from localStorage', err);
    return SAMPLE_NOTES;
  }
};

export const saveNotesToStorage = (notes: ConversionNote[]): void => {
  try {
    localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to localStorage', err);
  }
};

export const addStoredNote = (note: ConversionNote): ConversionNote[] => {
  const existing = getStoredNotes();
  const updated = [note, ...existing];
  saveNotesToStorage(updated);
  return updated;
};

export const updateStoredNote = (id: string, newMemo: string, newCategory?: ConversionNote['category']): ConversionNote[] => {
  const existing = getStoredNotes();
  const updated = existing.map((n) =>
    n.id === id
      ? {
          ...n,
          memo: newMemo,
          category: newCategory || n.category,
        }
      : n
  );
  saveNotesToStorage(updated);
  return updated;
};

export const deleteStoredNote = (id: string): ConversionNote[] => {
  const existing = getStoredNotes();
  const updated = existing.filter((n) => n.id !== id);
  saveNotesToStorage(updated);
  return updated;
};

export const clearAllStoredNotes = (): void => {
  try {
    localStorage.removeItem(NOTES_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear notes', err);
  }
};
