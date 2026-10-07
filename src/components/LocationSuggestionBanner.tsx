import React from 'react';
import { MapPin, Check, X, Pin, Sparkles, Navigation } from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { Currency } from '../types/currency';

interface Props {
  selectedCurrency: Currency;
  currencies: Currency[];
  onSelectCurrency: (curr: Currency) => void;
  onPlayClick: () => void;
}

export const LocationSuggestionBanner: React.FC<Props> = ({
  selectedCurrency,
  currencies,
  onSelectCurrency,
  onPlayClick,
}) => {
  const { theme } = useTheme();
  const {
    detectedLocation,
    isSuggestionDismissed,
    dismissSuggestion,
    pinCurrency,
    pinnedCurrencyCode,
  } = useLocation();

  if (!detectedLocation || isSuggestionDismissed) return null;

  // Don't show suggestion if the user already has this currency selected
  if (selectedCurrency.code === detectedLocation.currencyCode) return null;

  // Check if detected currency exists in supported list
  const matchedCurrency = currencies.find((c) => c.code === detectedLocation.currencyCode);

  const handleApplyAndPin = () => {
    onPlayClick();
    if (matchedCurrency) {
      pinCurrency(matchedCurrency.code);
      onSelectCurrency(matchedCurrency);
      dismissSuggestion();
    }
  };

  const handleApplyOnly = () => {
    onPlayClick();
    if (matchedCurrency) {
      onSelectCurrency(matchedCurrency);
      dismissSuggestion();
    }
  };

  const handleDismiss = () => {
    onPlayClick();
    dismissSuggestion();
  };

  // If in Morocco
  if (detectedLocation.isBaseCurrency) {
    return (
      <div className="mx-4 mt-2 p-3 rounded-2xl bg-slate-900/90 border border-emerald-500/30 shadow-md relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white">
                Detected Region: Morocco 🇲🇦
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                {detectedLocation.city ? `${detectedLocation.city}` : 'Local Base MAD'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              You are in Morocco! Use Moroccan Dirham (MAD) as base and convert foreign exchange.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Dismiss location banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // If supported foreign currency is detected
  if (matchedCurrency) {
    const isAlreadyPinned = pinnedCurrencyCode === matchedCurrency.code;

    return (
      <div className={`mx-4 mt-2 p-3 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border ${theme.accentBorder} shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300`}>
        {/* Glow ambient accent */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start gap-2.5">
          <div className={`p-2 rounded-xl ${theme.accentBgLight} ${theme.accentText} border ${theme.accentBorder} shrink-0`}>
            <Navigation className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0 pr-5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white">
                Detected: {detectedLocation.countryName}
              </span>
              <span className="text-xs">{detectedLocation.currencyFlag}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${theme.badgeBg} font-semibold`}>
                {detectedLocation.currencyCode}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Switch currency to <strong className="text-white">{matchedCurrency.name}</strong> ({matchedCurrency.symbol}) for Moroccan Dirham conversions?
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button
                onClick={handleApplyAndPin}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${theme.accentBg} ${theme.accentBgHover} text-white text-[11px] font-bold shadow-sm transition active:scale-95`}
              >
                <Pin className="w-3 h-3 fill-current" />
                <span>Pin & Select {matchedCurrency.code}</span>
              </button>

              <button
                onClick={handleApplyOnly}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700 transition active:scale-95"
              >
                <Check className="w-3 h-3" />
                <span>Switch Once</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Dismiss location suggestion"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // If detected currency is not in supported list
  return (
    <div className="mx-4 mt-2 p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden animate-in fade-in duration-300">
      <div className="flex items-start gap-2.5">
        <div className="p-2 rounded-xl bg-slate-800 text-amber-400 shrink-0">
          <MapPin className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">
              Location: {detectedLocation.countryName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Detected {detectedLocation.countryName} ({detectedLocation.currencyCode}). You can convert via EUR or USD to Moroccan Dirham.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
