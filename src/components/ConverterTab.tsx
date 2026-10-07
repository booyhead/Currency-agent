import React, { useState, useMemo } from 'react';
import { ArrowUpDown, ChevronDown, Sparkles, Copy, Check, RotateCcw, Info, Keyboard, Bell, MapPin, Pin, Navigation, Loader2, Calculator, Equal } from 'lucide-react';
import { Currency, RateMode, ExchangeDirection } from '../types/currency';
import { getEffectiveRate, toMoroccanTraditional } from '../services/ratesService';
import { useTheme } from '../context/ThemeContext';
import { useAlerts } from '../context/AlertContext';
import { useLocation } from '../context/LocationContext';
import { LocationSuggestionBanner } from './LocationSuggestionBanner';
import { QuickConvertWidget } from './QuickConvertWidget';
import { RateTrendChart } from './RateTrendChart';
import { PriceAlertModal } from './PriceAlertModal';
import { PersonalNotesSection } from './PersonalNotesSection';
import { evaluateExpression, hasArithmeticOperators } from '../utils/calculator';

interface Props {
  selectedCurrency: Currency;
  onOpenSelector: () => void;
  soundEnabled: boolean;
  onPlayKeyClick: () => void;
  currencies?: Currency[];
  onSelectCurrency?: (curr: Currency) => void;
}

export const ConverterTab: React.FC<Props> = ({
  selectedCurrency,
  onOpenSelector,
  soundEnabled,
  onPlayKeyClick,
  currencies,
  onSelectCurrency,
}) => {
  const { theme } = useTheme();
  const { alerts } = useAlerts();
  const {
    detectedLocation,
    pinnedCurrencyCode,
    detectLocation,
    pinCurrency,
    unpinCurrency,
    isPinned,
  } = useLocation();

  const [direction, setDirection] = useState<ExchangeDirection>('FOREIGN_TO_MAD');
  const [rawAmount, setRawAmount] = useState<string>('100');
  const [rateMode, setRateMode] = useState<RateMode>('official');
  const [copied, setCopied] = useState(false);
  const [showKeypad, setShowKeypad] = useState(true);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isCalcMode, setIsCalcMode] = useState(true); // Advanced Calculator mode enabled by default

  const activeAlertsForCurrency = alerts.filter(
    (a) => a.currencyCode === selectedCurrency.code && a.isActive
  );

  // Parse input amount & evaluate arithmetic expressions
  const hasOperators = useMemo(() => hasArithmeticOperators(rawAmount), [rawAmount]);
  const evalResult = useMemo(() => evaluateExpression(rawAmount), [rawAmount]);
  const numericInput = evalResult.isValid ? evalResult.value : (parseFloat(rawAmount) || 0);

  // Fast reverse conversion handler for Quick Convert widget
  const handleSelectReverseAmount = (madAmount: number) => {
    setDirection('MAD_TO_FOREIGN');
    setRawAmount(String(madAmount));
  };

  // Restore past saved conversion from Personal Notes
  const handleRestoreConversion = (
    srcAmount: number,
    dir: ExchangeDirection,
    currCode: string
  ) => {
    onPlayKeyClick();
    setDirection(dir);
    setRawAmount(String(srcAmount));
    if (currencies && onSelectCurrency) {
      const match = currencies.find((c) => c.code === currCode);
      if (match) {
        onSelectCurrency(match);
      }
    }
  };

  // Rate calculation
  const { rate: effectiveRate, spreadLabel } = getEffectiveRate(
    selectedCurrency,
    rateMode,
    direction
  );

  // Conversion logic
  let convertedAmount = 0;
  let madEquivalent = 0;

  if (direction === 'FOREIGN_TO_MAD') {
    // Foreign -> MAD
    convertedAmount = numericInput * effectiveRate;
    madEquivalent = convertedAmount;
  } else {
    // MAD -> Foreign
    convertedAmount = effectiveRate > 0 ? numericInput / effectiveRate : 0;
    madEquivalent = numericInput;
  }

  // Traditional Moroccan Ryals & Santimat breakdown
  const traditional = toMoroccanTraditional(madEquivalent);

  const handleSwapDirection = () => {
    onPlayKeyClick();
    setDirection((prev) => (prev === 'FOREIGN_TO_MAD' ? 'MAD_TO_FOREIGN' : 'FOREIGN_TO_MAD'));
  };

  const handleKeyPress = (val: string) => {
    onPlayKeyClick();
    if (val === 'C') {
      setRawAmount('0');
      return;
    }
    if (val === 'BACK') {
      setRawAmount((prev) => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
      return;
    }

    // Evaluate equals '=': replace expression with the evaluated numeric result
    if (val === '=') {
      if (evalResult.isValid) {
        // Format to clean number without unnecessary zeroes
        const formatted = String(Number(evalResult.value.toFixed(4)));
        setRawAmount(formatted);
      }
      return;
    }

    // Arithmetic operators: +, -, *, /
    if (['+', '-', '*', '/'].includes(val)) {
      setRawAmount((prev) => {
        const trimmed = prev.trim();
        // If empty or "0", minus can start negative, other operators append to 0
        if (trimmed === '0' || trimmed === '') {
          if (val === '-') return '-';
          return '0 ' + val + ' ';
        }
        // If last characters are an operator with spaces, replace the operator
        if (/ [+\-*/] $/.test(trimmed)) {
          return trimmed.slice(0, -3) + ' ' + val + ' ';
        }
        // If trailing operator without space
        if (/[+\-*/]$/.test(trimmed)) {
          return trimmed.slice(0, -1) + ' ' + val + ' ';
        }
        return trimmed + ' ' + val + ' ';
      });
      return;
    }

    if (val === '.') {
      setRawAmount((prev) => {
        // Check if the current trailing number segment already has a dot
        const segments = prev.split(/[\s+\-*/]+/);
        const lastSegment = segments[segments.length - 1] || '';
        if (lastSegment.includes('.')) {
          return prev;
        }
        return prev + '.';
      });
      return;
    }

    setRawAmount((prev) => {
      if (prev === '0') return val;
      if (prev.length > 25) return prev; // allow extended expressions
      return prev + val;
    });
  };

  const handleAddAmount = (addVal: number) => {
    onPlayKeyClick();
    if (hasOperators) {
      // Append addition to current formula e.g. "100 * 2 + 50"
      setRawAmount((prev) => `${prev.trim()} + ${addVal}`);
    } else {
      const current = parseFloat(rawAmount) || 0;
      setRawAmount(String(Math.round(current + addVal)));
    }
  };

  const handleCopyResult = () => {
    const formattedInput = hasOperators && evalResult.isValid ? `${rawAmount} (= ${evalResult.value})` : `${numericInput}`;
    const textToCopy = `${formattedInput} ${direction === 'FOREIGN_TO_MAD' ? selectedCurrency.code : 'MAD'} = ${convertedAmount.toFixed(2)} ${direction === 'FOREIGN_TO_MAD' ? 'MAD' : selectedCurrency.code}`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col flex-1 pb-4 overflow-y-auto">
      {/* Rate Mode Selector (Segmented Material Bar) */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              onPlayKeyClick();
              setRateMode('official');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              rateMode === 'official'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bank Al-Maghrib
          </button>
          <button
            onClick={() => {
              onPlayKeyClick();
              setRateMode('cash_exchange');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              rateMode === 'cash_exchange'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Cash Bureau
          </button>
          <button
            onClick={() => {
              onPlayKeyClick();
              setRateMode('card_atm');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              rateMode === 'card_atm'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Card / ATM
          </button>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1.5">
          <span className="truncate">{spreadLabel}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`${theme.accentText} font-mono text-[10px]`}>
              1 {selectedCurrency.code} ≈ {effectiveRate.toFixed(3)} MAD
            </span>

            {/* Price Alert button trigger */}
            <button
              onClick={() => {
                onPlayKeyClick();
                setIsAlertModalOpen(true);
              }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-semibold text-amber-300 border border-amber-500/30 transition active:scale-95"
              title="Set target rate alert"
              aria-label="Set target rate alert"
            >
              <Bell className="w-3 h-3 text-amber-400" />
              <span>Alert</span>
              {activeAlertsForCurrency.length > 0 && (
                <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[9px]">
                  {activeAlertsForCurrency.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Location Suggestion Banner */}
      {currencies && onSelectCurrency && (
        <LocationSuggestionBanner
          selectedCurrency={selectedCurrency}
          currencies={currencies}
          onSelectCurrency={onSelectCurrency}
          onPlayClick={onPlayKeyClick}
        />
      )}

      {/* Geolocation & Pinned Currency Quick Switch Bar */}
      <div className="px-4 mt-2 mb-1 flex items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {detectedLocation && !detectedLocation.isBaseCurrency && (
            <button
              onClick={() => {
                onPlayKeyClick();
                const matched = currencies?.find((c) => c.code === detectedLocation.currencyCode);
                if (matched && onSelectCurrency) {
                  onSelectCurrency(matched);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition active:scale-95 shrink-0 shadow-xs ${
                selectedCurrency.code === detectedLocation.currencyCode
                  ? `${theme.accentBgLight} ${theme.accentText} ${theme.accentBorder}`
                  : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800'
              }`}
              title={`Detected location: ${detectedLocation.countryName} (${detectedLocation.currencyCode})`}
            >
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{detectedLocation.countryCode}: {detectedLocation.currencyCode}</span>
            </button>
          )}

          {pinnedCurrencyCode && (
            <button
              onClick={() => {
                onPlayKeyClick();
                const matched = currencies?.find((c) => c.code === pinnedCurrencyCode);
                if (matched && onSelectCurrency) {
                  onSelectCurrency(matched);
                }
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-semibold transition active:scale-95 shrink-0 shadow-xs ${
                selectedCurrency.code === pinnedCurrencyCode
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900 hover:bg-slate-850 text-amber-300/80 border-slate-800'
              }`}
              title={`Pinned currency: ${pinnedCurrencyCode}`}
            >
              <Pin className="w-3 h-3 fill-current text-amber-400" />
              <span>Pinned: {pinnedCurrencyCode}</span>
            </button>
          )}
        </div>

        <button
          onClick={async () => {
            onPlayKeyClick();
            if (currencies) {
              setIsDetectingLocation(true);
              try {
                await detectLocation(currencies, true);
              } finally {
                setIsDetectingLocation(false);
              }
            }
          }}
          disabled={isDetectingLocation}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-850 text-[11px] font-semibold text-slate-300 hover:text-white border border-slate-800 transition active:scale-95 shrink-0 shadow-xs"
          title="Detect current region using Browser Geolocation API"
        >
          {isDetectingLocation ? (
            <Loader2 className="w-3 h-3 text-emerald-400 animate-spin" />
          ) : (
            <Navigation className="w-3 h-3 text-emerald-400" />
          )}
          <span>{isDetectingLocation ? 'Locating...' : 'Detect GPS'}</span>
        </button>
      </div>

      {/* Main Currency Exchange Cards */}
      <div className="px-4 space-y-2 mt-1">
        {/* Source Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-slate-400">
              {direction === 'FOREIGN_TO_MAD' ? 'You Send / Exchange' : 'You Spend (Moroccan Dirham)'}
            </span>
            <div className="flex items-center gap-2">
              {/* Advanced Calculator Mode Badge & Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayKeyClick();
                  setIsCalcMode((prev) => !prev);
                }}
                className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border transition ${
                  isCalcMode
                    ? `${theme.accentBgLight} ${theme.accentText} ${theme.accentBorder}`
                    : 'text-slate-500 hover:text-slate-300 border-slate-800'
                }`}
                title={isCalcMode ? 'Advanced Calculator Active: supports +, -, *, / directly' : 'Enable Advanced Calculator mode'}
              >
                <Calculator className="w-2.5 h-2.5" />
                <span>Calc Mode</span>
              </button>

              {direction === 'FOREIGN_TO_MAD' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayKeyClick();
                    if (isPinned(selectedCurrency.code)) {
                      unpinCurrency();
                    } else {
                      pinCurrency(selectedCurrency.code);
                    }
                  }}
                  className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border transition ${
                    isPinned(selectedCurrency.code)
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'text-slate-500 hover:text-slate-300 border-transparent hover:border-slate-700'
                  }`}
                  title={isPinned(selectedCurrency.code) ? 'Unpin currency' : 'Pin currency'}
                >
                  <Pin className={`w-2.5 h-2.5 ${isPinned(selectedCurrency.code) ? 'fill-current' : ''}`} />
                  <span>{isPinned(selectedCurrency.code) ? 'Pinned' : 'Pin'}</span>
                </button>
              )}
              <span className="text-[10px] text-slate-500">Source Currency</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Currency Button */}
            {direction === 'FOREIGN_TO_MAD' ? (
              <button
                onClick={onOpenSelector}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/70 transition-colors shrink-0"
              >
                <span className="text-xl" role="img" aria-label={selectedCurrency.country}>
                  {selectedCurrency.flag}
                </span>
                <span className="text-base font-bold text-white">{selectedCurrency.code}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-750 shrink-0">
                <span className="text-xl" role="img" aria-label="Morocco">
                  🇲🇦
                </span>
                <span className={`text-base font-bold ${theme.accentText}`}>MAD</span>
                <span className="text-xs text-slate-400 font-arabic">درهم</span>
              </div>
            )}

            {/* Input Value Display & Live Formula Calculation */}
            <div className="text-right overflow-hidden flex-1 pl-2">
              <input
                type="text"
                value={rawAmount}
                onChange={(e) => {
                  const val = e.target.value;
                  // Allow digits, decimals, basic operators, and spaces
                  if (/^[0-9.+\-*/×÷\s()]*$/.test(val)) {
                    setRawAmount(val);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === '=') {
                    e.preventDefault();
                    onPlayKeyClick();
                    if (evalResult.isValid) {
                      const formatted = String(Number(evalResult.value.toFixed(4)));
                      setRawAmount(formatted);
                    }
                  } else if (e.key === 'Escape') {
                    onPlayKeyClick();
                    setRawAmount('0');
                  }
                }}
                placeholder="0"
                className={`w-full text-right font-extrabold text-white bg-transparent tracking-tight tabular-nums focus:outline-none transition-all cursor-text selection:bg-emerald-500/30 ${
                  rawAmount.length > 15 ? 'text-xl' : rawAmount.length > 10 ? 'text-2xl' : 'text-3xl'
                }`}
              />

              {/* Advanced Calculator Live Evaluation Preview */}
              {hasOperators && (
                <div className="flex items-center justify-end gap-1.5 mt-0.5 animate-fadeIn">
                  <span className="text-[10px] text-slate-400">Formula Result:</span>
                  {evalResult.isValid ? (
                    <button
                      onClick={() => {
                        onPlayKeyClick();
                        setRawAmount(String(Number(evalResult.value.toFixed(4))));
                      }}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-750 border ${theme.accentBorder} text-xs font-mono font-bold ${theme.accentText} transition active:scale-95`}
                      title="Click to apply evaluated result as input"
                    >
                      <span>= {evalResult.value.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                      <Equal className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ) : (
                    <span className="text-[10px] text-amber-400 font-mono">
                      {evalResult.error || 'Calculating...'}
                    </span>
                  )}
                </div>
              )}

              <div className="text-xs text-slate-400 truncate mt-0.5">
                {direction === 'FOREIGN_TO_MAD'
                  ? selectedCurrency.name
                  : 'Moroccan Dirham (درهم مغربي)'}
              </div>
            </div>
          </div>
        </div>

        {/* Swap Button Divider */}
        <div className="relative flex justify-center -my-2.5 z-10">
          <button
            onClick={handleSwapDirection}
            className={`p-2.5 rounded-full ${theme.accentBg} ${theme.accentBgHover} text-white shadow-lg transition-transform active:scale-90 ring-4 ring-slate-950`}
            aria-label="Swap exchange direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Card (Target Result) */}
        <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border ${theme.cardGlowBorder} relative shadow-sm`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-medium ${theme.accentText}`}>
              {direction === 'FOREIGN_TO_MAD' ? 'You Receive in Morocco' : 'Foreign Equivalent'}
            </span>
            <button
              onClick={handleCopyResult}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
              title="Copy converted result"
            >
              {copied ? (
                <>
                  <Check className={`w-3 h-3 ${theme.accentText}`} />
                  <span className={theme.accentText}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Target Currency Display */}
            {direction === 'FOREIGN_TO_MAD' ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-750 shrink-0">
                <span className="text-xl" role="img" aria-label="Morocco">
                  🇲🇦
                </span>
                <span className={`text-base font-bold ${theme.accentText}`}>MAD</span>
                <span className="text-xs text-slate-400 font-arabic">درهم</span>
              </div>
            ) : (
              <button
                onClick={onOpenSelector}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700/70 transition-colors shrink-0"
              >
                <span className="text-xl" role="img" aria-label={selectedCurrency.country}>
                  {selectedCurrency.flag}
                </span>
                <span className="text-base font-bold text-white">{selectedCurrency.code}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            )}

            {/* Converted Amount Display */}
            <div className="text-right overflow-hidden">
              <div className={`text-3xl font-extrabold ${theme.accentText} tracking-tight tabular-nums truncate`}>
                {convertedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {direction === 'FOREIGN_TO_MAD'
                  ? 'Moroccan Dirham (درهم مغربي)'
                  : selectedCurrency.name}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Moroccan Traditional Market Breakdown (Ryal & Santim) */}
      <div className="px-4 mt-2.5">
        <div className={`p-3 rounded-xl ${theme.accentBgLight} border ${theme.accentBorder} flex items-start gap-3`}>
          <div className={`p-1.5 rounded-lg bg-slate-900/60 ${theme.accentText} shrink-0 mt-0.5`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Moroccan Market (Ryal & Santimat)</span>
              <span className={`text-[10px] ${theme.accentText} font-mono`}>1 DH = 20 Ryals</span>
            </div>
            <div className="mt-1 text-xs text-slate-300">
              <span className={`font-semibold ${theme.accentText} tabular-nums`}>
                {traditional.ryals.toLocaleString()} Ryals (ريال)
              </span>{' '}
              ·{' '}
              <span className="font-normal text-slate-400 tabular-nums">
                {traditional.santimat.toLocaleString()} Santims
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-amber-200/90 italic">
              Darija: &ldquo;{traditional.verbalDarija}&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* Quick Convert Widget (Reverse MAD -> Foreign matrix) */}
      <QuickConvertWidget
        selectedCurrency={selectedCurrency}
        rateMode={rateMode}
        onSelectReverseAmount={handleSelectReverseAmount}
        onPlayClick={onPlayKeyClick}
      />

      {/* Historical Exchange Rate Trend Chart (7D / 30D / 90D Recharts) */}
      <RateTrendChart
        currency={selectedCurrency}
        onPlayClick={onPlayKeyClick}
      />

      {/* Personal Notes & Transaction Memos Section */}
      <PersonalNotesSection
        selectedCurrency={selectedCurrency}
        direction={direction}
        sourceAmount={numericInput}
        convertedAmount={convertedAmount}
        effectiveRate={effectiveRate}
        rateMode={rateMode}
        onRestoreConversion={handleRestoreConversion}
        onPlayClick={onPlayKeyClick}
      />

      {/* Quick Denomination Increment Chips, Arithmetic Bar & Keypad Controls */}
      <div className="px-4 mt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar text-xs justify-between">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-slate-500 font-medium shrink-0">Add:</span>
            {[10, 50, 100, 200, 500].map((step) => (
              <button
                key={step}
                onClick={() => handleAddAmount(step)}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold tabular-nums border border-slate-700/60 transition active:scale-95"
              >
                +{step}
              </button>
            ))}
            <button
              onClick={() => {
                onPlayKeyClick();
                setRawAmount('0');
              }}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
              title="Reset to 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Calculator mode */}
            <button
              onClick={() => {
                onPlayKeyClick();
                setIsCalcMode((prev) => !prev);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition shrink-0 ${
                isCalcMode
                  ? `${theme.accentBgLight} ${theme.accentText} ${theme.accentBorder}`
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Toggle Advanced Calculator mode"
            >
              <Calculator className="w-3 h-3" />
              <span>{isCalcMode ? 'Calc Active' : 'Calc'}</span>
            </button>

            <button
              onClick={() => {
                onPlayKeyClick();
                setShowKeypad((prev) => !prev);
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border transition shrink-0 ${
                showKeypad
                  ? `${theme.accentBgLight} ${theme.accentText} ${theme.accentBorder}`
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Keyboard className="w-3 h-3" />
              <span>{showKeypad ? 'Keypad' : 'Show Keypad'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tactile Android Numeric & Advanced Calculator Keypad */}
      {showKeypad && (
        <div className="px-4 mt-2">
          {/* Operator Action Bar for Quick Math */}
          {isCalcMode && (
            <div className="grid grid-cols-4 gap-1.5 p-1.5 mb-1.5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-xs">
              <button
                onClick={() => handleKeyPress('+')}
                className="h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-emerald-900 text-emerald-400 font-extrabold text-lg transition border border-emerald-500/30 active:scale-95 flex items-center justify-center shadow-xs"
                title="Add (+)"
                aria-label="Add"
              >
                +
              </button>
              <button
                onClick={() => handleKeyPress('-')}
                className="h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-emerald-900 text-emerald-400 font-extrabold text-lg transition border border-emerald-500/30 active:scale-95 flex items-center justify-center shadow-xs"
                title="Subtract (-)"
                aria-label="Subtract"
              >
                −
              </button>
              <button
                onClick={() => handleKeyPress('*')}
                className="h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-emerald-900 text-emerald-400 font-extrabold text-base transition border border-emerald-500/30 active:scale-95 flex items-center justify-center shadow-xs"
                title="Multiply (×)"
                aria-label="Multiply"
              >
                ×
              </button>
              <button
                onClick={() => handleKeyPress('/')}
                className="h-10 rounded-lg bg-slate-800/90 hover:bg-slate-700 active:bg-emerald-900 text-emerald-400 font-extrabold text-base transition border border-emerald-500/30 active:scale-95 flex items-center justify-center shadow-xs"
                title="Divide (÷)"
                aria-label="Divide"
              >
                ÷
              </button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            {/* Number Row 1 */}
            {['1', '2', '3'].map((n) => (
              <button
                key={n}
                onClick={() => handleKeyPress(n)}
                className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-emerald-950 text-white font-bold text-lg tabular-nums transition border border-slate-800 active:scale-95 flex items-center justify-center"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('BACK')}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-slate-700 text-rose-400 font-semibold text-sm transition border border-slate-700/60 active:scale-95 flex items-center justify-center"
              aria-label="Backspace"
            >
              ⌫
            </button>

            {/* Number Row 2 */}
            {['4', '5', '6'].map((n) => (
              <button
                key={n}
                onClick={() => handleKeyPress(n)}
                className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-emerald-950 text-white font-bold text-lg tabular-nums transition border border-slate-800 active:scale-95 flex items-center justify-center"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleKeyPress('C')}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 active:bg-slate-700 text-amber-400 font-bold text-sm transition border border-slate-700/60 active:scale-95 flex items-center justify-center"
              aria-label="Clear"
            >
              C
            </button>

            {/* Number Row 3 */}
            {['7', '8', '9'].map((n) => (
              <button
                key={n}
                onClick={() => handleKeyPress(n)}
                className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-emerald-950 text-white font-bold text-lg tabular-nums transition border border-slate-800 active:scale-95 flex items-center justify-center"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => handleSwapDirection()}
              className={`h-12 rounded-xl ${theme.accentBgLight} ${theme.accentText} font-bold text-xs transition border ${theme.accentBorder} active:scale-95 flex items-center justify-center`}
              aria-label="Swap"
            >
              ⇄ Swap
            </button>

            {/* Bottom Row */}
            <button
              onClick={() => handleKeyPress('.')}
              className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xl transition border border-slate-800 active:scale-95 flex items-center justify-center"
            >
              .
            </button>
            <button
              onClick={() => handleKeyPress('0')}
              className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg tabular-nums transition border border-slate-800 active:scale-95 flex items-center justify-center"
            >
              0
            </button>

            {/* Equals (=) when in calculator mode, else '00' */}
            {isCalcMode ? (
              <button
                onClick={() => handleKeyPress('=')}
                className="h-12 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 active:bg-emerald-600 text-emerald-300 font-black text-xl transition border border-emerald-500/50 active:scale-95 flex items-center justify-center shadow-xs"
                title="Calculate expression (=)"
                aria-label="Equals"
              >
                =
              </button>
            ) : (
              <button
                onClick={() => handleKeyPress('00')}
                className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tabular-nums transition border border-slate-800 active:scale-95 flex items-center justify-center"
              >
                00
              </button>
            )}

            <button
              onClick={() => handleCopyResult()}
              className={`h-12 rounded-xl ${theme.accentBg} ${theme.accentBgHover} text-white font-bold text-xs transition active:scale-95 flex items-center justify-center shadow-md`}
            >
              {copied ? '✓ Done' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Price Alert Configuration Modal */}
      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        currency={selectedCurrency}
        onPlayClick={onPlayKeyClick}
      />
    </div>
  );
};
