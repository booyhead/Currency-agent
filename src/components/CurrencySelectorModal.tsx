import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Check, ArrowRight, MapPin, Pin, Navigation, Loader2, Star, Sparkles } from 'lucide-react';
import { Currency } from '../types/currency';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import { useFavorites } from '../context/FavoritesContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
  selectedCode: string;
  onSelect: (currency: Currency) => void;
}

export const CurrencySelectorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currencies,
  selectedCode,
  onSelect,
}) => {
  const { theme } = useTheme();
  const {
    detectedLocation,
    pinnedCurrencyCode,
    detectLocation,
    pinCurrency,
    unpinCurrency,
    isPinned,
  } = useLocation();

  const {
    favoriteCodes,
    isFavorite,
    toggleFavorite,
    favoritesCount,
  } = useFavorites();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleToggleFavorite = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const willBeFav = !isFavorite(code);
    toggleFavorite(code);
    showToast(willBeFav ? `⭐ ${code} moved to top of favorites` : `Removed ${code} from favorites`);
  };

  // Focus input and reset query when modal opens, handle Escape key
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setQuery('');
      setActiveCategory('all');
      setToastMessage(null);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Currencies' },
    { id: 'favorites', label: `⭐ Favorites (${favoritesCount})` },
    { id: 'major', label: 'Popular' },
    { id: 'europe', label: 'Europe' },
    { id: 'gulf', label: 'Gulf & Arab' },
    { id: 'americas', label: 'Americas' },
    { id: 'africa', label: 'Africa & Asia' },
  ];

  const trimmedQuery = query.trim().toLowerCase();

  const handleTriggerDetect = async () => {
    setIsDetecting(true);
    try {
      await detectLocation(currencies, true);
    } finally {
      setIsDetecting(false);
    }
  };

  // Find detected currency in supported list
  const detectedCurrencyObj = detectedLocation
    ? currencies.find((c) => c.code === detectedLocation.currencyCode)
    : null;

  const pinnedCurrencyObj = pinnedCurrencyCode
    ? currencies.find((c) => c.code === pinnedCurrencyCode)
    : null;

  // Filter list
  const filteredCurrencies = currencies
    .filter((c) => {
      const matchesSearch =
        !trimmedQuery ||
        c.code.toLowerCase().includes(trimmedQuery) ||
        c.name.toLowerCase().includes(trimmedQuery) ||
        (c.nameFr && c.nameFr.toLowerCase().includes(trimmedQuery)) ||
        c.nameAr.includes(trimmedQuery) ||
        c.country.toLowerCase().includes(trimmedQuery);

      const matchesCategory =
        trimmedQuery.length > 0 ||
        activeCategory === 'all' ||
        (activeCategory === 'favorites' && isFavorite(c.code)) ||
        c.category === activeCategory ||
        (activeCategory === 'major' && ['EUR', 'USD', 'GBP', 'SAR', 'AED', 'CAD'].includes(c.code)) ||
        (activeCategory === 'africa' && (c.category === 'africa' || c.category === 'asia_pacific'));

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // 1. Prioritize pinned currency first
      const aPinned = a.code === pinnedCurrencyCode;
      const bPinned = b.code === pinnedCurrencyCode;
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      // 2. Starred / Favorite currencies move to top of list!
      const aFav = isFavorite(a.code);
      const bFav = isFavorite(b.code);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;

      // 3. Among favorites, maintain their order in favoriteCodes
      if (aFav && bFav) {
        return favoriteCodes.indexOf(a.code) - favoriteCodes.indexOf(b.code);
      }

      return 0;
    });

  // Partition into favorites and other currencies when in "All Currencies" and not searching
  const isDefaultAllView = activeCategory === 'all' && !trimmedQuery && favoritesCount > 0;
  const favoriteCurrenciesInView = filteredCurrencies.filter((c) => isFavorite(c.code));
  const otherCurrenciesInView = filteredCurrencies.filter((c) => !isFavorite(c.code));

  // Render individual currency item row
  const renderCurrencyRow = (curr: Currency) => {
    const isSelected = curr.code === selectedCode;
    const isCurrencyPinned = isPinned(curr.code);
    const isCurrFavorite = isFavorite(curr.code);
    const isDetectedLocal = detectedLocation?.currencyCode === curr.code;

    return (
      <div
        key={curr.code}
        className={`w-full py-3 px-2 flex items-center justify-between text-left transition-colors rounded-xl hover:bg-slate-800/50 group ${
          isSelected ? 'bg-emerald-950/40 border border-emerald-500/30' : ''
        }`}
      >
        <button
          onClick={() => {
            onSelect(curr);
            onClose();
          }}
          className="flex-1 flex items-center gap-3 min-w-0 pr-2 text-left"
        >
          <span className="text-2xl select-none shrink-0" role="img" aria-label={curr.country}>
            {curr.flag}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {curr.code}
              </span>
              <span className="text-xs text-slate-400 font-mono">({curr.symbol})</span>
              <span className="text-xs text-emerald-400/90 font-medium font-arabic">{curr.nameAr}</span>

              {/* Badges */}
              {isCurrFavorite && (
                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-xs">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span>Favorite</span>
                </span>
              )}

              {isCurrencyPinned && (
                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                  <Pin className="w-2.5 h-2.5 fill-current" />
                  <span>Pinned</span>
                </span>
              )}

              {isDetectedLocal && (
                <span className="flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  <MapPin className="w-2.5 h-2.5" />
                  <span>Local</span>
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 truncate">
              {curr.name} · {curr.country}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          {/* Star Favorite Button */}
          <button
            onClick={(e) => handleToggleFavorite(curr.code, e)}
            className={`p-1.5 rounded-lg border transition active:scale-90 ${
              isCurrFavorite
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-xs'
                : 'bg-slate-800 text-slate-500 border-slate-700/60 hover:text-amber-400 hover:border-amber-500/40 opacity-60 group-hover:opacity-100'
            }`}
            title={isCurrFavorite ? `Remove ${curr.code} from favorites` : `Star ${curr.code} to move to top of list`}
            aria-label={isCurrFavorite ? `Remove ${curr.code} from favorites` : `Add ${curr.code} to favorites`}
          >
            <Star className={`w-3.5 h-3.5 ${isCurrFavorite ? 'fill-amber-400 text-amber-300' : ''}`} />
          </button>

          {/* Pin Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isCurrencyPinned) {
                unpinCurrency();
              } else {
                pinCurrency(curr.code);
              }
            }}
            className={`p-1.5 rounded-lg border transition active:scale-90 ${
              isCurrencyPinned
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                : 'bg-slate-800 text-slate-500 border-slate-700/60 hover:text-slate-300 opacity-60 group-hover:opacity-100'
            }`}
            title={isCurrencyPinned ? 'Unpin currency' : 'Pin currency'}
          >
            <Pin className={`w-3.5 h-3.5 ${isCurrencyPinned ? 'fill-current' : ''}`} />
          </button>

          {/* Rate and Select Button */}
          <button
            onClick={() => {
              onSelect(curr);
              onClose();
            }}
            className="text-right flex items-center gap-2 pl-1"
          >
            <div>
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

            {isSelected ? (
              <Check className={`w-4 h-4 ${theme.accentText} shrink-0`} />
            ) : (
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to dismiss */}
      <div className="flex-1" onClick={onClose} />

      {/* Android Material 3 Bottom Sheet */}
      <div className="relative w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Select Foreign Currency</span>
              {favoritesCount > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  {favoritesCount} Starred
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">Choose currency to convert with Moroccan Dirham (MAD)</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close currency selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Geolocation & Detection Bar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 shrink-0 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded-lg ${theme.accentBgLight} ${theme.accentText} shrink-0`}>
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                {detectedLocation ? (
                  <>
                    <span>{detectedLocation.countryName}</span>
                    <span className="text-[11px] text-slate-400 truncate">
                      ({detectedLocation.currencyCode})
                    </span>
                  </>
                ) : (
                  <span className="text-slate-300">Region Detection</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {detectedLocation
                  ? detectedLocation.isBaseCurrency
                    ? 'In Morocco (MAD base)'
                    : detectedLocation.isSupported
                    ? `Local currency: ${detectedLocation.currencyName}`
                    : 'External region detected'
                  : 'Detect via Browser Geolocation API'}
              </div>
            </div>
          </div>

          <button
            onClick={handleTriggerDetect}
            disabled={isDetecting}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition shrink-0 active:scale-95 ${
              isDetecting
                ? 'bg-slate-800 text-slate-400 border-slate-700 cursor-wait'
                : `${theme.accentBgLight} ${theme.accentText} ${theme.accentBorder} hover:brightness-110`
            }`}
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Locating...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3 h-3" />
                <span>{detectedLocation ? 'Update Location' : 'Detect Location'}</span>
              </>
            )}
          </button>
        </div>

        {/* Detected Local Currency & Pinned Banner (Quick Access) */}
        {!trimmedQuery && (detectedCurrencyObj || pinnedCurrencyObj) && (
          <div className="px-5 pt-2.5 pb-1 shrink-0 space-y-2">
            {detectedCurrencyObj && !detectedLocation?.isBaseCurrency && (
              <div className={`p-2.5 rounded-xl bg-slate-850 border ${theme.accentBorder} flex items-center justify-between gap-3 shadow-sm`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0" role="img" aria-label={detectedCurrencyObj.country}>
                    {detectedCurrencyObj.flag}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{detectedCurrencyObj.code}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({detectedCurrencyObj.symbol})</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-medium flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>Local</span>
                      </span>
                      {isFavorite(detectedCurrencyObj.code) && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-medium flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Favorite</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-300 truncate">
                      {detectedCurrencyObj.name} · {detectedCurrencyObj.rateToMad.toFixed(3)} MAD
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Star detected currency */}
                  <button
                    onClick={(e) => handleToggleFavorite(detectedCurrencyObj.code, e)}
                    className={`p-1.5 rounded-lg border text-xs transition active:scale-90 ${
                      isFavorite(detectedCurrencyObj.code)
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-400'
                    }`}
                    title={isFavorite(detectedCurrencyObj.code) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFavorite(detectedCurrencyObj.code) ? 'fill-current' : ''}`} />
                  </button>

                  {/* Pin detected currency */}
                  <button
                    onClick={() => {
                      if (isPinned(detectedCurrencyObj.code)) {
                        unpinCurrency();
                      } else {
                        pinCurrency(detectedCurrencyObj.code);
                      }
                    }}
                    className={`p-1.5 rounded-lg border text-xs transition ${
                      isPinned(detectedCurrencyObj.code)
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                    title={isPinned(detectedCurrencyObj.code) ? 'Unpin currency' : 'Pin local currency'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${isPinned(detectedCurrencyObj.code) ? 'fill-current' : ''}`} />
                  </button>

                  <button
                    onClick={() => {
                      onSelect(detectedCurrencyObj);
                      onClose();
                    }}
                    className={`px-3 py-1.5 rounded-lg ${theme.accentBg} ${theme.accentBgHover} text-white text-xs font-bold shadow-sm transition active:scale-95`}
                  >
                    Select
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Bar Input Container */}
        <div className="px-5 py-2.5 shrink-0 border-b border-slate-800/60 bg-slate-900/90">
          <div className="relative flex items-center">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${theme.accentText} pointer-events-none`} />
            <input
              ref={inputRef}
              type="text"
              role="searchbox"
              aria-label="Search currency by name or code"
              placeholder="Search code or name (e.g., EUR, USD, Euro, Dollar, يورو)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${theme.accentRing} transition`}
            />
            {query.length > 0 && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick query stats or category filter bar */}
          {query.trim().length > 0 ? (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 px-1">
              <span>
                Found <strong className={theme.accentText}>{filteredCurrencies.length}</strong> matching currencies
              </span>
              <button
                onClick={() => setQuery('')}
                className={`${theme.accentText} hover:underline font-medium`}
              >
                Reset search
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                    activeCategory === cat.id
                      ? `${cat.id === 'favorites' ? 'bg-amber-500 text-slate-950 font-bold' : `${theme.accentBg} text-white`} shadow-sm`
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Currency List */}
        <div className="overflow-y-auto px-5 py-2 flex-1 overscroll-contain">
          {/* Empty state for search query */}
          {filteredCurrencies.length === 0 && trimmedQuery.length > 0 && (
            <div className="py-12 text-center text-sm text-slate-400 space-y-2">
              <p>No currencies found matching &ldquo;<span className="text-white font-medium">{query}</span>&rdquo;</p>
              <button
                onClick={() => {
                  setQuery('');
                  setActiveCategory('all');
                }}
                className="px-4 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50 text-xs font-semibold border border-emerald-500/40 transition"
              >
                Show all currencies
              </button>
            </div>
          )}

          {/* Empty state for favorites tab when none starred */}
          {filteredCurrencies.length === 0 && activeCategory === 'favorites' && !trimmedQuery && (
            <div className="py-10 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-sm">
                <Star className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">No Favorite Currencies Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Star currencies by tapping the star icon ⭐ to move them to the top of the currency list for faster access.
                </p>
              </div>

              {/* Quick star recommendations */}
              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-2 font-medium">Quickly add popular favorites:</div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {['EUR', 'USD', 'GBP', 'SAR'].map((code) => {
                    const c = currencies.find((curr) => curr.code === code);
                    if (!c) return null;
                    return (
                      <button
                        key={code}
                        onClick={(e) => handleToggleFavorite(code, e)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 hover:border-amber-500/40 transition active:scale-95 shadow-sm"
                      >
                        <span>{c.flag}</span>
                        <span className="font-bold">{c.code}</span>
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Default view with Favorite currencies at top section, followed by All Other currencies */}
          {isDefaultAllView ? (
            <div className="space-y-4">
              {/* Starred Favorites Section at Top */}
              {favoriteCurrenciesInView.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Starred Favorites ({favoriteCurrenciesInView.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">Moved to top for fast access</span>
                  </div>
                  <div className="divide-y divide-slate-800/60 bg-amber-500/[0.02] rounded-2xl border border-amber-500/20 px-2 py-0.5">
                    {favoriteCurrenciesInView.map((curr) => renderCurrencyRow(curr))}
                  </div>
                </div>
              )}

              {/* Other Currencies Section */}
              {otherCurrenciesInView.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 pb-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span>All Other Currencies ({otherCurrenciesInView.length})</span>
                    <span className="text-[10px] text-slate-500 font-normal">Tap ⭐ to favorite</span>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {otherCurrenciesInView.map((curr) => renderCurrencyRow(curr))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Categorized or Searched View */
            <div className="divide-y divide-slate-800/60">
              {filteredCurrencies.map((curr) => renderCurrencyRow(curr))}
            </div>
          )}
        </div>

        {/* Floating Feedback Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-slate-800 border border-amber-500/40 text-xs text-amber-300 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200 z-30 pointer-events-none whitespace-nowrap">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="font-medium text-white">{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
