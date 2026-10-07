import React, { useState } from 'react';
import { ShoppingBag, Calculator, MessageSquareQuote, Check, Copy, ArrowRightLeft, Sparkles } from 'lucide-react';
import { Currency } from '../types/currency';
import { fromRyalsToDirhams, toMoroccanTraditional } from '../services/ratesService';
import { useTheme } from '../context/ThemeContext';

interface Props {
  selectedCurrency: Currency;
  onPlayClick: () => void;
}

export const SoukRyalTab: React.FC<Props> = ({ selectedCurrency, onPlayClick }) => {
  const { theme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'bargaining' | 'ryal_calc' | 'phrases'>('bargaining');

  // Bargaining state
  const [vendorAskedMad, setVendorAskedMad] = useState<number>(350);
  const [bargainDiscountPct, setBargainDiscountPct] = useState<number>(50);

  // Ryal calculator state
  const [inputRyals, setInputRyals] = useState<string>('2000');
  const [copiedPhrase, setCopiedPhrase] = useState<string | null>(null);

  // Bargain calculations
  const recommendedOfferMad = Math.round(vendorAskedMad * (bargainDiscountPct / 100));
  const recommendedOfferForeign = (recommendedOfferMad / (selectedCurrency.rateToMad || 1)).toFixed(2);
  const vendorAskedForeign = (vendorAskedMad / (selectedCurrency.rateToMad || 1)).toFixed(2);

  // Ryal calculations
  const parsedRyals = parseFloat(inputRyals) || 0;
  const ryalsInMad = fromRyalsToDirhams(parsedRyals);
  const ryalsInForeign = (ryalsInMad / (selectedCurrency.rateToMad || 1)).toFixed(2);
  const ryalsTraditional = toMoroccanTraditional(ryalsInMad);

  const copyPhrase = (text: string) => {
    onPlayClick();
    navigator.clipboard?.writeText(text);
    setCopiedPhrase(text);
    setTimeout(() => setCopiedPhrase(null), 2000);
  };

  const darijaPhrases = [
    {
      darija: 'بزاف عليا!',
      phonetic: 'Bzaf aaliya!',
      english: 'That is way too expensive for me!',
      context: 'First reaction when vendor quotes high initial price.',
    },
    {
      darija: 'نقص ليا شوية عافاك',
      phonetic: 'Nqs liya chwiya afak',
      english: 'Lower it a little bit, please',
      context: 'Polite counter-offer invitation.',
    },
    {
      darija: 'آخر ثمن شحال؟',
      phonetic: 'Akher taman chhal?',
      english: 'What is your absolute final price?',
      context: 'When closing in on a reasonable settlement.',
    },
    {
      darija: 'عطيني هادي بـ...',
      phonetic: 'Aatini hadi b...',
      english: 'Give me this one for [Price]',
      context: 'Making your specific firm offer.',
    },
    {
      darija: 'لا، شكراً، الله يعاونك',
      phonetic: 'La, shukran, Allah y-aawnek',
      english: 'No, thank you, may God help you (Polite walk away)',
      context: 'Walking away gently often prompts the merchant to agree to your price.',
    },
  ];

  return (
    <div className="flex flex-col flex-1 pb-4 overflow-y-auto">
      {/* Top Visual Banner */}
      <div className="relative h-28 w-full overflow-hidden shrink-0 border-b border-slate-800">
        <img
          src="/src/assets/images/moroccan_medina_market_1791396692546.jpg"
          alt="Moroccan Medina Market"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-4">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
            <ShoppingBag className="w-4 h-4" />
            <span>Medina & Souk Companion</span>
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            Souk Bargaining & Ryal Translator
          </h2>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="px-4 py-2">
        <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              onPlayClick();
              setActiveSubTab('bargaining');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'bargaining'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bargaining Helper
          </button>
          <button
            onClick={() => {
              onPlayClick();
              setActiveSubTab('ryal_calc');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'ryal_calc'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ryal / Santim Calc
          </button>
          <button
            onClick={() => {
              onPlayClick();
              setActiveSubTab('phrases');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubTab === 'phrases'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Darija Phrases
          </button>
        </div>
      </div>

      {/* TAB 1: Bargaining Helper */}
      {activeSubTab === 'bargaining' && (
        <div className="px-4 space-y-3 mt-1">
          {/* Asked Price Input */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Vendor’s First Quoted Price (MAD):
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="1"
                  value={vendorAskedMad || ''}
                  onChange={(e) => setVendorAskedMad(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-3 pr-12 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xl font-bold text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                  DH
                </span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400">Equal to approx:</div>
                <div className="text-sm font-bold text-slate-200 tabular-nums">
                  ~{vendorAskedForeign} {selectedCurrency.symbol}
                </div>
              </div>
            </div>

            {/* Quick asked price presets */}
            <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-slate-500">Presets:</span>
              {[100, 200, 350, 500, 800, 1200].map((val) => (
                <button
                  key={val}
                  onClick={() => {
                    onPlayClick();
                    setVendorAskedMad(val);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition"
                >
                  {val} DH
                </button>
              ))}
            </div>
          </div>

          {/* Bargaining Strategy Slider */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Counter-Offer Strategy:</span>
              <span className="text-xs font-bold text-emerald-400 tabular-nums">
                {bargainDiscountPct}% of initial price
              </span>
            </div>

            <input
              type="range"
              min="30"
              max="80"
              step="5"
              value={bargainDiscountPct}
              onChange={(e) => setBargainDiscountPct(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 mt-1">
              <span>30% (Aggressive Medina start)</span>
              <span>50% (Standard Rule)</span>
              <span>70% (Fair settlement)</span>
            </div>

            {/* Strategy Preset Buttons */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <button
                onClick={() => {
                  onPlayClick();
                  setBargainDiscountPct(40);
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                  bargainDiscountPct === 40
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                }`}
              >
                Opening Offer (40%)
              </button>
              <button
                onClick={() => {
                  onPlayClick();
                  setBargainDiscountPct(50);
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                  bargainDiscountPct === 50
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                }`}
              >
                50% Rule
              </button>
              <button
                onClick={() => {
                  onPlayClick();
                  setBargainDiscountPct(65);
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition ${
                  bargainDiscountPct === 65
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                }`}
              >
                Win-Win Target (65%)
              </button>
            </div>
          </div>

          {/* Recommended Counter-Offer Result Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-700/50 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">Target Counter-Offer:</span>
              <span className="text-[11px] text-slate-400">
                Saves {(vendorAskedMad - recommendedOfferMad).toLocaleString()} DH
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {recommendedOfferMad}
              </span>
              <span className="text-lg font-bold text-emerald-400">MAD (DH)</span>
              <span className="text-sm font-semibold text-slate-400 ml-auto tabular-nums">
                ≈ {recommendedOfferForeign} {selectedCurrency.code}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 mt-2 bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
              💡 <strong>Moroccan Souk Tip:</strong> Smile, stay friendly, and never show urgency. If the seller won&rsquo;t meet your target, politely say <em>&ldquo;La, shukran&rdquo;</em> and begin walking away. 70% of merchants will call you back with a final compromise!
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Ryal / Santim Calculator */}
      {activeSubTab === 'ryal_calc' && (
        <div className="px-4 space-y-3 mt-1">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-white">Enter Amount in Ryals (ريال):</label>
              <span className="text-[10px] text-emerald-400 font-mono">1 DH = 20 Ryals</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Common in butcheries, vegetable markets, and traditional souks.
            </p>

            <div className="relative">
              <input
                type="number"
                min="0"
                value={inputRyals}
                onChange={(e) => setInputRyals(e.target.value)}
                placeholder="e.g. 1000 Ryals"
                className="w-full pl-3 pr-20 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xl font-bold text-white tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                Ryal (ريال)
              </span>
            </div>

            {/* Quick Ryal Presets */}
            <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-xs">
              {[
                { label: '100 (5 DH)', val: '100' },
                { label: '400 (20 DH)', val: '400' },
                { label: '1000 (50 DH)', val: '1000' },
                { label: '2000 (100 DH)', val: '2000' },
                { label: '4000 (200 DH)', val: '4000' },
                { label: '10000 (500 DH)', val: '10000' },
                { label: '20000 (1k DH)', val: '20000' },
                { label: '40000 (2k DH)', val: '40000' },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => {
                    onPlayClick();
                    setInputRyals(p.val);
                  }}
                  className="py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-[11px] transition text-center"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversion Result */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/40 border border-emerald-800/50 shadow-sm">
            <span className="text-xs font-semibold text-emerald-400">Equivalent In Modern Dirhams:</span>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-white tabular-nums">
                {ryalsInMad.toLocaleString()}
              </span>
              <span className="text-lg font-bold text-emerald-400">MAD (Dirhams)</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-300 mt-2 pt-2 border-t border-slate-800">
              <span>Home Currency ({selectedCurrency.code}):</span>
              <span className="font-bold text-white tabular-nums">
                ≈ {ryalsInForeign} {selectedCurrency.symbol}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
              <span>Santims (سنتيم):</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {ryalsTraditional.santimat.toLocaleString()} santimat
              </span>
            </div>

            <div className="mt-2 text-xs text-amber-200/90 font-arabic bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
              نطق بالدارجة: {ryalsTraditional.verbalDarija}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Darija Phrases */}
      {activeSubTab === 'phrases' && (
        <div className="px-4 space-y-2 mt-1">
          {darijaPhrases.map((phrase, i) => (
            <div
              key={i}
              onClick={() => copyPhrase(phrase.darija)}
              className="p-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-600/60 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-bold text-emerald-400 font-arabic">{phrase.darija}</div>
                  <div className="text-xs font-semibold text-white mt-0.5 tracking-tight">
                    {phrase.phonetic}
                  </div>
                </div>
                <button
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 group-hover:text-emerald-400 transition"
                  title="Copy phrase"
                >
                  {copiedPhrase === phrase.darija ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">{phrase.english}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 italic">{phrase.context}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
