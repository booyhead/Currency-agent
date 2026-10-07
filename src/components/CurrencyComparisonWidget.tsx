import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  Columns3, 
  Plus, 
  Trash2, 
  Star, 
  Share2, 
  Copy, 
  Check, 
  ChevronDown, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle, 
  Search, 
  X,
  SlidersHorizontal
} from 'lucide-react';
import { Currency } from '../types/currency';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';

const COMPARISON_STORAGE_KEY = 'dirhampay_comparison_currencies_v1';
const BENCHMARK_AMOUNTS = [100, 500, 1000, 2500, 5000];

interface Props {
  currencies: Currency[];
  onSelectForConvert: (curr: Currency) => void;
  onPlayClick: () => void;
}

export const CurrencyComparisonWidget: React.FC<Props> = ({
  currencies,
  onSelectForConvert,
  onPlayClick,
}) => {
  const { theme } = useTheme();
  const { favoriteCodes, isFavorite, toggleFavorite } = useFavorites();

  // Load saved comparison codes or initialize with favorites / defaults
  const [selectedCodes, setSelectedCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(COMPARISON_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 3 && parsed.length <= 4) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // Default: prioritize user's starred favorites if at least 3, else EUR, USD, GBP, SAR
    if (favoriteCodes && favoriteCodes.length >= 3) {
      return favoriteCodes.slice(0, 4);
    }
    return ['EUR', 'USD', 'GBP', 'SAR'];
  });

  const [testMadAmount, setTestMadAmount] = useState<number>(1000);
  const [customAmountInput, setCustomAmountInput] = useState<string>('1000');
  const [calculationMode, setCalculationMode] = useState<'MAD_TO_FOREIGN' | 'FOREIGN_TO_MAD'>('MAD_TO_FOREIGN');
  const [foreignTestAmount, setForeignTestAmount] = useState<number>(100);

  // Slot selector modal state
  const [slotToEdit, setSlotToEdit] = useState<number | null>(null);
  const [selectorSearch, setSelectorSearch] = useState<string>('');
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  // Persist selectedCodes
  useEffect(() => {
    try {
      localStorage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(selectedCodes));
    } catch {
      // ignore
    }
  }, [selectedCodes]);

  // Resolve currency objects
  const comparisonCurrencies = useMemo(() => {
    return selectedCodes
      .map((code) => currencies.find((c) => c.code === code))
      .filter((c): c is Currency => Boolean(c));
  }, [selectedCodes, currencies]);

  // Change a slot's currency
  const handleSwapCurrency = (slotIndex: number, newCode: string) => {
    onPlayClick();
    setSelectedCodes((prev) => {
      const updated = [...prev];
      updated[slotIndex] = newCode;
      return updated;
    });
    setSlotToEdit(null);
  };

  // Add 4th currency slot
  const handleAddSlot = (newCode?: string) => {
    if (selectedCodes.length >= 4) return;
    onPlayClick();
    // Pick an unselected favorite or popular currency
    const fallback =
      newCode ||
      currencies.find((c) => !selectedCodes.includes(c.code) && isFavorite(c.code))?.code ||
      currencies.find((c) => !selectedCodes.includes(c.code) && ['CAD', 'AED', 'CHF', 'QAR'].includes(c.code))?.code ||
      currencies.find((c) => !selectedCodes.includes(c.code))?.code ||
      'CAD';

    setSelectedCodes((prev) => [...prev, fallback]);
  };

  // Remove a slot (keep min 3)
  const handleRemoveSlot = (indexToRemove: number) => {
    if (selectedCodes.length <= 3) return;
    onPlayClick();
    setSelectedCodes((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Preset loaders
  const handleLoadFavorites = () => {
    onPlayClick();
    if (favoriteCodes.length === 0) return;
    const available = favoriteCodes.filter((code) => currencies.some((c) => c.code === code));
    if (available.length >= 3) {
      setSelectedCodes(available.slice(0, 4));
    } else {
      // Pad with popular ones
      const fallbackList = ['EUR', 'USD', 'GBP', 'SAR', 'AED', 'CAD'];
      const combined = [...available];
      for (const fb of fallbackList) {
        if (!combined.includes(fb) && combined.length < 4) {
          combined.push(fb);
        }
      }
      setSelectedCodes(combined.slice(0, Math.max(3, combined.length)));
    }
  };

  const handleApplyPreset = (codes: string[]) => {
    onPlayClick();
    setSelectedCodes(codes);
  };

  // Copy or share comparison summary
  const handleShareComparison = async () => {
    onPlayClick();
    const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    let tableText = `🇲🇦 Moroccan Dirham (MAD) Currency Comparison\n`;
    tableText += `📅 ${dateStr} • BAM Benchmark Rates\n\n`;

    comparisonCurrencies.forEach((c) => {
      const toMad = c.rateToMad.toFixed(c.rateToMad < 1 ? 4 : 3);
      const fromMad = (testMadAmount / (c.rateToMad || 1)).toFixed(2);
      const buyRate = (c.rateToMad * (1 + c.bankBuySpread)).toFixed(3);
      const sellRate = (c.rateToMad * (1 + c.bankSellSpread)).toFixed(3);
      const trend = c.change24h >= 0 ? `+${c.change24h}%` : `${c.change24h}%`;

      tableText += `${c.flag} ${c.code} (${c.name}):\n`;
      tableText += `  • 1 ${c.code} = ${toMad} MAD\n`;
      tableText += `  • ${testMadAmount} MAD = ${fromMad} ${c.code}\n`;
      tableText += `  • Bank Buy: ${buyRate} | Sell: ${sellRate}\n`;
      tableText += `  • 24h Trend: ${trend}\n\n`;
    });

    tableText += `Checked on DirhamPay`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'MAD Currency Comparison',
          text: tableText,
        });
        return;
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(tableText);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2200);
      }
    } catch {
      // fallback
    }
  };

  // Sparkline renderer
  const renderMiniSparkline = (points: number[], isPositive: boolean) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 48;
    const height = 18;

    const pathD = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible inline-block">
        <path
          d={pathD}
          fill="none"
          stroke={isPositive ? '#10b981' : '#f43f5e'}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div className="space-y-4">
      {/* Widget Header & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${theme.accentBgLight} ${theme.accentText}`}>
              <Columns3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Multi-Currency Comparison</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${theme.badgeBg} font-mono font-medium`}>
                  {selectedCodes.length} Currencies
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Compare 3-4 favorite currencies side-by-side against Moroccan Dirham (MAD)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 3 or 4 slot toggle */}
            {selectedCodes.length === 3 ? (
              <button
                onClick={() => handleAddSlot()}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold transition active:scale-95`}
                title="Add 4th currency for comparison"
              >
                <Plus className="w-3 h-3 text-emerald-400" />
                <span>+ 4th Currency</span>
              </button>
            ) : (
              <button
                onClick={() => handleRemoveSlot(3)}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-slate-700/80 text-[11px] font-medium transition active:scale-95"
                title="Switch back to 3 currencies"
              >
                <span>3 Columns</span>
              </button>
            )}

            {/* Share / Copy comparison */}
            <button
              onClick={handleShareComparison}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl ${theme.accentBgLight} ${theme.accentText} border ${theme.accentBorder} text-xs font-semibold transition active:scale-95 shadow-xs`}
              title="Copy comparison summary to clipboard"
            >
              {copyFeedback ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copyFeedback ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs pt-1 border-t border-slate-800/80">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 pr-1">
            Presets:
          </span>

          {favoriteCodes.length > 0 && (
            <button
              onClick={handleLoadFavorites}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition whitespace-nowrap active:scale-95`}
            >
              <Star className="w-3 h-3 fill-amber-400" />
              <span>My Starred Favorites ({favoriteCodes.length})</span>
            </button>
          )}

          <button
            onClick={() => handleApplyPreset(['EUR', 'USD', 'GBP', 'CAD'])}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition whitespace-nowrap active:scale-95"
          >
            🌍 Major 4 (EUR · USD · GBP · CAD)
          </button>

          <button
            onClick={() => handleApplyPreset(['SAR', 'AED', 'QAR', 'KWD'])}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition whitespace-nowrap active:scale-95"
          >
            🌴 Gulf & Arab (SAR · AED · QAR · KWD)
          </button>

          <button
            onClick={() => handleApplyPreset(['EUR', 'GBP', 'CHF', 'SEK'])}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition whitespace-nowrap active:scale-95"
          >
            🏰 European (EUR · GBP · CHF · SEK)
          </button>
        </div>

        {/* Rapid Price Checker Amount Calculator */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
              <span>Rapid Price Checking Matrix</span>
            </span>

            {/* Toggle calculation mode */}
            <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-[11px]">
              <button
                onClick={() => {
                  onPlayClick();
                  setCalculationMode('MAD_TO_FOREIGN');
                }}
                className={`px-2 py-0.5 rounded transition ${
                  calculationMode === 'MAD_TO_FOREIGN'
                    ? `${theme.accentBg} text-white font-bold`
                    : 'text-slate-400'
                }`}
              >
                MAD → Foreign
              </button>
              <button
                onClick={() => {
                  onPlayClick();
                  setCalculationMode('FOREIGN_TO_MAD');
                }}
                className={`px-2 py-0.5 rounded transition ${
                  calculationMode === 'FOREIGN_TO_MAD'
                    ? `${theme.accentBg} text-white font-bold`
                    : 'text-slate-400'
                }`}
              >
                100 Units → MAD
              </button>
            </div>
          </div>

          {calculationMode === 'MAD_TO_FOREIGN' ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-400 font-medium">Test Dirham Amount:</span>
              {BENCHMARK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    onPlayClick();
                    setTestMadAmount(amt);
                    setCustomAmountInput(String(amt));
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                    testMadAmount === amt
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  {amt.toLocaleString()} MAD
                </button>
              ))}

              <div className="flex items-center gap-1 ml-auto">
                <input
                  type="number"
                  value={customAmountInput}
                  onChange={(e) => {
                    setCustomAmountInput(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      setTestMadAmount(val);
                    }
                  }}
                  className="w-20 px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white text-right focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Custom"
                />
                <span className="text-[10px] text-slate-400 font-mono">MAD</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Test Foreign Amount:</span>
              {[50, 100, 200, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    onPlayClick();
                    setForeignTestAmount(amt);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                    foreignTestAmount === amt
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                  }`}
                >
                  {amt} Units
                </button>
              ))}
              <span className="text-[10px] text-slate-400 italic">
                (Evaluates {foreignTestAmount} of each currency in MAD)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Side-by-Side Comparative Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header: Currency Slots */}
        <div
          className={`grid bg-slate-950/90 border-b border-slate-800 divide-x divide-slate-800 ${
            comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
          }`}
        >
          {comparisonCurrencies.map((curr, idx) => (
            <div key={curr.code} className="p-3 relative flex flex-col items-center text-center group">
              {/* Starred indicator */}
              {isFavorite(curr.code) && (
                <div
                  className="absolute top-1.5 left-1.5 text-amber-400"
                  title={`${curr.code} is in your favorites`}
                >
                  <Star className="w-3 h-3 fill-amber-400" />
                </div>
              )}

              {/* Slot Swap Button */}
              <button
                onClick={() => {
                  onPlayClick();
                  setSlotToEdit(idx);
                  setSelectorSearch('');
                }}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title={`Swap ${curr.code} with another currency`}
                aria-label={`Change slot ${idx + 1}`}
              >
                <ChevronDown className="w-3 h-3" />
              </button>

              <span className="text-2xl mb-1 select-none" role="img" aria-label={curr.country}>
                {curr.flag}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-white tracking-tight">{curr.code}</span>
                <span className="text-xs text-slate-400 font-mono">({curr.symbol})</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-arabic truncate max-w-full">
                {curr.nameAr}
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-full mt-0.5">
                {curr.name}
              </div>

              {/* Quick swap button */}
              <button
                onClick={() => {
                  onPlayClick();
                  setSlotToEdit(idx);
                  setSelectorSearch('');
                }}
                className="mt-1 text-[10px] text-slate-400 hover:text-emerald-400 underline decoration-slate-600 transition"
              >
                Change
              </button>
            </div>
          ))}
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-slate-800/60 text-xs">
          {/* Row 1: Live Mid-Market Exchange Rate */}
          <div className="p-2.5 bg-slate-900/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
              <span>Live Mid-Rate (1 Unit)</span>
              <span className="text-slate-500 font-normal">Official BAM benchmark</span>
            </div>
            <div
              className={`grid divide-x divide-slate-800/60 text-center ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => (
                <div key={c.code} className="px-1 py-1">
                  <div className="font-bold text-white text-xs sm:text-sm tabular-nums">
                    {c.rateToMad.toFixed(c.rateToMad < 1 ? 4 : 3)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">MAD</div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Rapid Calculation Result Highlight */}
          <div className="p-3 bg-emerald-950/30 border-y border-emerald-500/20">
            <div className="text-[11px] font-bold text-emerald-300 mb-2 px-1 flex items-center justify-between">
              <span>
                {calculationMode === 'MAD_TO_FOREIGN'
                  ? `⚡ Value of ${testMadAmount.toLocaleString()} MAD in Each Currency`
                  : `⚡ Cost of ${foreignTestAmount} Units in Moroccan Dirhams`}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Rapid Check
              </span>
            </div>
            <div
              className={`grid divide-x divide-emerald-500/20 text-center ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => {
                const result =
                  calculationMode === 'MAD_TO_FOREIGN'
                    ? (testMadAmount / (c.rateToMad || 1)).toFixed(2)
                    : (foreignTestAmount * c.rateToMad).toFixed(2);

                return (
                  <div key={c.code} className="px-1 py-1">
                    <div className="font-extrabold text-white text-sm sm:text-base tabular-nums">
                      {result}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-400 font-mono">
                      {calculationMode === 'MAD_TO_FOREIGN' ? `${c.symbol} ${c.code}` : 'MAD'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 3: 100 MAD Micro-Conversion */}
          <div className="p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
              <span>Reverse Value (100 MAD)</span>
              <span className="text-slate-500 font-normal">What 100 dirhams buys</span>
            </div>
            <div
              className={`grid divide-x divide-slate-800/60 text-center ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => (
                <div key={c.code} className="px-1 py-0.5">
                  <div className="font-semibold text-slate-200 tabular-nums">
                    {(100 / (c.rateToMad || 1)).toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {c.symbol} {c.code}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4: Bank Buy Rate (Bank Al-Maghrib mid - spread) */}
          <div className="p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
              <span>Bank Buy Rate (Buying from you)</span>
              <span className="text-slate-500 font-normal">Cash into MAD</span>
            </div>
            <div
              className={`grid divide-x divide-slate-800/60 text-center ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => {
                const buyRate = (c.rateToMad * (1 + c.bankBuySpread)).toFixed(3);
                return (
                  <div key={c.code} className="px-1 py-0.5">
                    <div className="font-semibold text-emerald-400 tabular-nums">{buyRate}</div>
                    <div className="text-[10px] text-slate-500 font-mono">MAD</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 5: Bank Sell Rate (Bank selling foreign currency to you) */}
          <div className="p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
              <span>Bank Sell Rate (Selling to you)</span>
              <span className="text-slate-500 font-normal">MAD into foreign</span>
            </div>
            <div
              className={`grid divide-x divide-slate-800/60 text-center ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => {
                const sellRate = (c.rateToMad * (1 + c.bankSellSpread)).toFixed(3);
                return (
                  <div key={c.code} className="px-1 py-0.5">
                    <div className="font-semibold text-rose-300 tabular-nums">{sellRate}</div>
                    <div className="text-[10px] text-slate-500 font-mono">MAD</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 6: Bank Bid/Ask Margin % */}
          <div className="p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
              <span>Bureau / Bank Spread Margin</span>
              <span className="text-slate-500 font-normal">Bid-Ask Fee %</span>
            </div>
            <div
              className={`grid divide-x divide-slate-800/60 text-center ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => {
                const spreadPercent = ((c.bankSellSpread - c.bankBuySpread) * 100).toFixed(1);
                return (
                  <div key={c.code} className="px-1 py-0.5">
                    <div className="font-medium text-slate-300 tabular-nums">{spreadPercent}%</div>
                    <div className="text-[10px] text-slate-500">Margin</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 7: 24-Hour Fluctuations */}
          <div className="p-2.5">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1 flex items-center justify-between">
              <span>24h Change & Trend</span>
              <span className="text-slate-500 font-normal">Daily fluctuation</span>
            </div>
            <div
              className={`grid divide-x divide-slate-800/60 text-center ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => {
                const isPos = c.change24h >= 0;
                return (
                  <div key={c.code} className="px-1 py-0.5">
                    <div
                      className={`inline-flex items-center gap-0.5 font-bold text-xs tabular-nums px-1.5 py-0.5 rounded-full ${
                        isPos
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>
                        {isPos ? '+' : ''}
                        {c.change24h}%
                      </span>
                    </div>
                    <div className="mt-1">{renderMiniSparkline(c.sparkline, isPos)}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 8: Action / Quick Convert */}
          <div className="p-3 bg-slate-950/80">
            <div
              className={`grid gap-2 ${
                comparisonCurrencies.length === 4 ? 'grid-cols-4' : 'grid-cols-3'
              }`}
            >
              {comparisonCurrencies.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    onPlayClick();
                    onSelectForConvert(c);
                  }}
                  className={`py-1.5 px-1 rounded-xl ${theme.accentBg} ${theme.accentBgHover} text-white text-[11px] font-bold transition shadow-sm active:scale-95 flex items-center justify-center gap-1`}
                  title={`Open converter with ${c.code}`}
                >
                  <span>Convert</span>
                  <ArrowLeftRight className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Currency Slot Picker Modal */}
      {slotToEdit !== null && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="flex-1" onClick={() => setSlotToEdit(null)} />
          <div className="w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

            {/* Modal Header */}
            <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div>
                <h4 className="text-base font-bold text-white tracking-tight">
                  Choose Currency for Column {slotToEdit + 1}
                </h4>
                <p className="text-xs text-slate-400">
                  Select which foreign currency to place in this comparison slot
                </p>
              </div>
              <button
                onClick={() => setSlotToEdit(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-2.5 border-b border-slate-800/80 bg-slate-900 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search currency code, country, or name..."
                  value={selectorSearch}
                  onChange={(e) => setSelectorSearch(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 ${theme.accentRing}`}
                />
              </div>
            </div>

            {/* Currencies list */}
            <div className="overflow-y-auto px-5 py-2 flex-1 divide-y divide-slate-800/60">
              {currencies
                .filter((c) => {
                  if (!selectorSearch.trim()) return true;
                  const q = selectorSearch.toLowerCase();
                  return (
                    c.code.toLowerCase().includes(q) ||
                    c.name.toLowerCase().includes(q) ||
                    c.country.toLowerCase().includes(q) ||
                    c.nameAr.includes(q)
                  );
                })
                .map((curr) => {
                  const isCurrentSlot = selectedCodes[slotToEdit] === curr.code;
                  const isAlreadySelected = selectedCodes.includes(curr.code);
                  const isCurrFav = isFavorite(curr.code);

                  return (
                    <div
                      key={curr.code}
                      onClick={() => handleSwapCurrency(slotToEdit, curr.code)}
                      className={`py-2.5 px-2 flex items-center justify-between rounded-xl cursor-pointer hover:bg-slate-800/60 transition ${
                        isCurrentSlot ? 'bg-emerald-950/40 border border-emerald-500/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-2xl select-none" role="img" aria-label={curr.country}>
                          {curr.flag}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-white">{curr.code}</span>
                            <span className="text-xs text-slate-400 font-mono">({curr.symbol})</span>
                            <span className="text-xs text-emerald-400 font-arabic">{curr.nameAr}</span>

                            {isCurrFav && (
                              <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                <span>Favorite</span>
                              </span>
                            )}

                            {isAlreadySelected && !isCurrentSlot && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                In Column {selectedCodes.indexOf(curr.code) + 1}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 truncate">
                            {curr.name} · {curr.country}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-200 tabular-nums">
                            {curr.rateToMad.toFixed(curr.rateToMad < 1 ? 4 : 3)} MAD
                          </div>
                          <div
                            className={`text-[10px] tabular-nums font-medium ${
                              curr.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {curr.change24h >= 0 ? '+' : ''}
                            {curr.change24h}%
                          </div>
                        </div>

                        {/* Star toggle button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(curr.code);
                          }}
                          className={`p-1.5 rounded-lg border transition ${
                            isCurrFav
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-amber-400'
                          }`}
                          title={isCurrFav ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Star className={`w-3 h-3 ${isCurrFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
