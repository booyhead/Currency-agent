import React, { useState, useEffect, useMemo } from 'react';
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Tag, 
  FileText, 
  Share2,
  Calendar,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { Currency, ExchangeDirection, RateMode } from '../types/currency';
import { ConversionNote, NoteCategory, NOTE_CATEGORIES } from '../types/note';
import { 
  getStoredNotes, 
  addStoredNote, 
  updateStoredNote, 
  deleteStoredNote, 
  clearAllStoredNotes 
} from '../utils/notesStorage';
import { useTheme } from '../context/ThemeContext';

interface Props {
  selectedCurrency: Currency;
  direction: ExchangeDirection;
  sourceAmount: number;
  convertedAmount: number;
  effectiveRate: number;
  rateMode: RateMode;
  onRestoreConversion: (sourceAmount: number, direction: ExchangeDirection, currencyCode: string) => void;
  onPlayClick: () => void;
}

export const PersonalNotesSection: React.FC<Props> = ({
  selectedCurrency,
  direction,
  sourceAmount,
  convertedAmount,
  effectiveRate,
  rateMode,
  onRestoreConversion,
  onPlayClick,
}) => {
  const { theme } = useTheme();

  const [notes, setNotes] = useState<ConversionNote[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [memoText, setMemoText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory>('general');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingMemoText, setEditingMemoText] = useState<string>('');
  const [filterCurrency, setFilterCurrency] = useState<'current' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Load notes on mount
  useEffect(() => {
    setNotes(getStoredNotes());
  }, []);

  // Quick preset memos for 1-tap note creation
  const presetMemos = [
    { label: 'Souk Shopping', cat: 'shopping' as NoteCategory },
    { label: 'Tagine & Dinner', cat: 'food' as NoteCategory },
    { label: 'Petit Taxi', cat: 'transport' as NoteCategory },
    { label: 'Café & Mint Tea', cat: 'food' as NoteCategory },
    { label: 'Hotel / Riad', cat: 'hotel' as NoteCategory },
    { label: 'ATM Cash Out', cat: 'atm' as NoteCategory },
  ];

  const handleSaveCurrentNote = (customMemo?: string, customCat?: NoteCategory) => {
    onPlayClick();
    const finalMemo = (customMemo ?? memoText).trim();
    if (!finalMemo) return;

    const newNote: ConversionNote = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      currencyCode: selectedCurrency.code,
      currencyFlag: selectedCurrency.flag,
      direction,
      sourceAmount,
      targetAmount: convertedAmount,
      rate: effectiveRate,
      rateMode,
      memo: finalMemo,
      category: customCat ?? selectedCategory,
    };

    const updated = addStoredNote(newNote);
    setNotes(updated);
    setMemoText('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteNote = (id: string) => {
    onPlayClick();
    const updated = deleteStoredNote(id);
    setNotes(updated);
    if (editingNoteId === id) setEditingNoteId(null);
  };

  const handleStartEditing = (note: ConversionNote) => {
    onPlayClick();
    setEditingNoteId(note.id);
    setEditingMemoText(note.memo);
  };

  const handleSaveEdit = (id: string) => {
    onPlayClick();
    if (!editingMemoText.trim()) return;
    const updated = updateStoredNote(id, editingMemoText.trim());
    setNotes(updated);
    setEditingNoteId(null);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all personal conversion notes?')) {
      onPlayClick();
      clearAllStoredNotes();
      setNotes([]);
    }
  };

  // Copy full expense trip summary
  const handleCopyExpenseSummary = async () => {
    onPlayClick();
    if (notes.length === 0) return;

    const lines = [
      `🇲🇦 MOROCCO TRIP EXPENSES - CONVERSION NOTES`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ...notes.map((n, idx) => {
        const dateStr = new Date(n.timestamp).toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        });
        const catInfo = NOTE_CATEGORIES.find((c) => c.id === n.category);
        const icon = catInfo ? catInfo.icon : '📝';
        const sourceLabel = n.direction === 'FOREIGN_TO_MAD'
          ? `${n.sourceAmount} ${n.currencyCode}`
          : `${n.sourceAmount} MAD`;
        const targetLabel = n.direction === 'FOREIGN_TO_MAD'
          ? `${n.targetAmount.toFixed(2)} MAD`
          : `${n.targetAmount.toFixed(2)} ${n.currencyCode}`;
        return `${idx + 1}. [${dateStr}] ${icon} ${n.memo}\n   ${sourceLabel} ➔ ${targetLabel} (Rate: ${n.rate.toFixed(2)})`;
      }),
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Total Notes: ${notes.length}`,
      `Total MAD Equivalent: ${notes
        .reduce((sum, n) => sum + (n.direction === 'FOREIGN_TO_MAD' ? n.targetAmount : n.sourceAmount), 0)
        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`,
      `Tracked via DirhamConvert`,
    ];

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(lines.join('\n'));
        setCopiedSummary(true);
        setTimeout(() => setCopiedSummary(false), 2500);
      }
    } catch {
      // ignore
    }
  };

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchCurr = filterCurrency === 'all' || n.currencyCode === selectedCurrency.code;
      const matchQuery =
        !searchQuery.trim() ||
        n.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.currencyCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCurr && matchQuery;
    });
  }, [notes, filterCurrency, selectedCurrency.code, searchQuery]);

  // Total MAD computed for filtered notes
  const totalMadTracked = useMemo(() => {
    return filteredNotes.reduce((sum, n) => {
      return sum + (n.direction === 'FOREIGN_TO_MAD' ? n.targetAmount : n.sourceAmount);
    }, 0);
  }, [filteredNotes]);

  const currentCategoryInfo = NOTE_CATEGORIES.find((c) => c.id === selectedCategory) || NOTE_CATEGORIES[0];

  return (
    <div className="px-4 mt-2.5">
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-xs">
        {/* Header & Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-slate-800 border border-slate-700/80 ${theme.accentText}`}>
              <StickyNote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold text-white tracking-tight">
                  Personal Notes & Memos
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Save custom memos and record transaction expenses
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {notes.length > 0 && (
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 hidden sm:inline-block">
                {totalMadTracked.toLocaleString(undefined, { maximumFractionDigits: 0 })} MAD
              </span>
            )}
            <button
              onClick={() => {
                onPlayClick();
                setIsExpanded((prev) => !prev);
              }}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white transition"
              title={isExpanded ? 'Collapse notes' : 'Expand notes'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="space-y-3 pt-1">
            {/* Quick Add Note Card for Current Active Conversion */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Attach Memo to Current Conversion:</span>
                </span>
                <span className="font-mono font-bold text-slate-200">
                  {direction === 'FOREIGN_TO_MAD' ? (
                    <>
                      {sourceAmount} {selectedCurrency.code} <span className="text-emerald-400">➔ {convertedAmount.toFixed(2)} MAD</span>
                    </>
                  ) : (
                    <>
                      {sourceAmount} MAD <span className="text-emerald-400">➔ {convertedAmount.toFixed(2)} {selectedCurrency.code}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Memo input & Add button */}
              <div className="flex items-center gap-1.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSaveCurrentNote();
                      }
                    }}
                    placeholder="e.g. Dinner in Medina, Taxi to airport, Souk babouches..."
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400/80 transition"
                  />
                  {memoText && (
                    <button
                      onClick={() => setMemoText('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleSaveCurrentNote()}
                  disabled={!memoText.trim()}
                  className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shrink-0 ${
                    memoText.trim()
                      ? `${theme.accentBg} ${theme.accentBgHover} text-white shadow-sm active:scale-95`
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
                  }`}
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Save Note</span>
                    </>
                  )}
                </button>
              </div>

              {/* Category Selector Chips */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] text-slate-500 shrink-0 mr-1 flex items-center gap-0.5">
                  <Tag className="w-2.5 h-2.5" /> Tag:
                </span>
                {NOTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onPlayClick();
                      setSelectedCategory(cat.id);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-medium flex items-center gap-1 transition shrink-0 ${
                      selectedCategory === cat.id
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Quick Preset Memo Badges */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
                <span className="text-[10px] text-slate-500 shrink-0 mr-1">Quick:</span>
                {presetMemos.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setMemoText(preset.label);
                      setSelectedCategory(preset.cat);
                      handleSaveCurrentNote(preset.label, preset.cat);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white text-[10px] border border-slate-800 transition active:scale-95 shrink-0"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter and Search Bar (When notes exist) */}
            {notes.length > 0 && (
              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search memos..."
                    className="w-full pl-7 pr-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 text-[11px] focus:outline-none focus:border-slate-700"
                  />
                </div>

                {/* Currency Filter Toggle */}
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 shrink-0">
                  <button
                    onClick={() => {
                      onPlayClick();
                      setFilterCurrency('all');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      filterCurrency === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    All ({notes.length})
                  </button>
                  <button
                    onClick={() => {
                      onPlayClick();
                      setFilterCurrency('current');
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      filterCurrency === 'current'
                        ? 'bg-slate-800 text-amber-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {selectedCurrency.code} Only
                  </button>
                </div>
              </div>
            )}

            {/* Notes List */}
            {filteredNotes.length === 0 ? (
              <div className="py-5 text-center text-slate-500 text-xs">
                {searchQuery ? (
                  <p>No notes matching &ldquo;{searchQuery}&rdquo;</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-slate-400">No notes saved for this selection yet.</p>
                    <p className="text-[11px] text-slate-500">
                      Type a memo above to record your purchases or expenses in Morocco!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5 no-scrollbar">
                {filteredNotes.map((note) => {
                  const catInfo = NOTE_CATEGORIES.find((c) => c.id === note.category) || NOTE_CATEGORIES[0];
                  const isEditing = editingNoteId === note.id;
                  const dateStr = new Date(note.timestamp).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                  });
                  const timeStr = new Date(note.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-750 transition space-y-2 group"
                    >
                      {/* Note Header: Category + Date + Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1 ${catInfo.colorClass}`}>
                            <span>{catInfo.icon}</span>
                            <span>{catInfo.label}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5" />
                            {dateStr} • {timeStr}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          {/* Restore/Load into converter */}
                          <button
                            onClick={() => {
                              onPlayClick();
                              onRestoreConversion(note.sourceAmount, note.direction, note.currencyCode);
                            }}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition"
                            title="Load these values into Converter"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>

                          {/* Edit memo */}
                          <button
                            onClick={() => handleStartEditing(note)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
                            title="Edit memo"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Delete note */}
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                            title="Delete note"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Memo Content */}
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <input
                            type="text"
                            value={editingMemoText}
                            onChange={(e) => setEditingMemoText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(note.id);
                              if (e.key === 'Escape') setEditingNoteId(null);
                            }}
                            autoFocus
                            className="flex-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-400 text-xs text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEdit(note.id)}
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs transition"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-slate-200 leading-snug">
                          {note.memo}
                        </p>
                      )}

                      {/* Conversion Amount Badge */}
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="text-slate-300 font-bold">
                            {note.currencyFlag} {note.sourceAmount.toLocaleString()}{' '}
                            {note.direction === 'FOREIGN_TO_MAD' ? note.currencyCode : 'MAD'}
                          </span>
                          <ArrowRight className="w-3 h-3 text-slate-500" />
                          <span className="text-emerald-400 font-extrabold">
                            {note.targetAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            {note.direction === 'FOREIGN_TO_MAD' ? 'MAD' : note.currencyCode}
                          </span>
                        </div>

                        <span className="text-[10px] text-slate-500 font-mono">
                          @ {note.rate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer Summary & Export Options */}
            {notes.length > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <div className="text-slate-400">
                  <span>Total logged: </span>
                  <strong className="text-emerald-400 font-mono font-bold">
                    {totalMadTracked.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                    MAD
                  </strong>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyExpenseSummary}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 border border-slate-700/80 transition"
                    title="Copy trip expense summary to clipboard"
                  >
                    {copiedSummary ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied Report</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Export Summary</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
                    title="Clear all saved notes"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
