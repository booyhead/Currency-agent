import React, { useState } from 'react';
import { Banknote, Coins, ShieldCheck, HeartHandshake, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { MOROCCAN_BANKNOTES, MOROCCAN_TIPPING_GUIDE } from '../data/banknotes';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onPlayClick: () => void;
}

export const BanknotesTab: React.FC<Props> = ({ onPlayClick }) => {
  const { theme } = useTheme();
  const [expandedDenom, setExpandedDenom] = useState<number | null>(200);
  const [activeSubView, setActiveSubView] = useState<'banknotes' | 'tipping'>('banknotes');

  const toggleExpand = (denom: number) => {
    onPlayClick();
    setExpandedDenom((prev) => (prev === denom ? null : denom));
  };

  return (
    <div className="flex flex-col flex-1 pb-4 overflow-y-auto">
      {/* Visual Header */}
      <div className="relative h-28 w-full overflow-hidden shrink-0 border-b border-slate-800">
        <img
          src="/src/assets/images/moroccan_currency_hero_1791396679772.jpg"
          alt="Moroccan Banknotes & Coins"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex flex-col justify-end p-4">
          <div className={`flex items-center gap-1.5 ${theme.accentText} text-xs font-semibold`}>
            <ShieldCheck className="w-4 h-4" />
            <span>Bank Al-Maghrib Official Series</span>
          </div>
          <h2 className="text-lg font-extrabold text-white tracking-tight">
            Moroccan Banknotes & Cash Guide
          </h2>
        </div>
      </div>

      {/* Switcher: Banknotes vs Tipping */}
      <div className="px-4 py-2">
        <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              onPlayClick();
              setActiveSubView('banknotes');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubView === 'banknotes'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Banknotes & Coins
          </button>
          <button
            onClick={() => {
              onPlayClick();
              setActiveSubView('tipping');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeSubView === 'tipping'
                ? `${theme.accentBg} text-white shadow-sm`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tipping Etiquette (Pourboire)
          </button>
        </div>
      </div>

      {/* Banknotes List */}
      {activeSubView === 'banknotes' && (
        <div className="px-4 space-y-2.5 mt-1">
          {MOROCCAN_BANKNOTES.map((item) => {
            const isExpanded = expandedDenom === item.denomination;

            return (
              <div
                key={item.denomination}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-sm transition"
              >
                {/* Banknote visual header card */}
                <div
                  onClick={() => toggleExpand(item.denomination)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer bg-gradient-to-r ${item.primaryColor} bg-opacity-20 hover:brightness-110 transition`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-950/50 backdrop-blur-md flex flex-col items-center justify-center border border-white/20 shrink-0">
                      <span className="text-base font-black text-white tabular-nums tracking-tight">
                        {item.denomination}
                      </span>
                      <span className="text-[9px] font-bold text-amber-300">DH</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white tracking-tight">
                          {item.denomination} Dirhams ({item.type === 'note' ? 'Banknote' : 'Coin'})
                        </span>
                      </div>
                      <div className="text-xs text-slate-200/90 font-medium">{item.theme}</div>
                      <div className="text-[10px] text-slate-300/80">{item.colorName}</div>
                    </div>
                  </div>

                  <div className="text-white/80 p-1">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-slate-900/95 border-t border-slate-800 text-xs">
                    <p className="text-slate-300 leading-relaxed">{item.description}</p>

                    <div>
                      <span className="font-bold text-emerald-400 block mb-1">
                        Cultural Elements & Landmarks:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {item.culturalIcons.map((icon, idx) => (
                          <li key={idx}>{icon}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px]">
                      <span className="font-bold text-amber-300 flex items-center gap-1 mb-0.5">
                        <Info className="w-3.5 h-3.5" />
                        Practical Advice in Morocco:
                      </span>
                      <p className="text-slate-300 leading-normal">{item.travelerTips}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tipping Guide */}
      {activeSubView === 'tipping' && (
        <div className="px-4 space-y-3 mt-1">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 mb-1">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Moroccan Tipping Culture (التبس / Pourboire)</span>
            </h3>
            <p className="leading-relaxed text-slate-300 text-[11px]">
              Tipping is widely appreciated and woven into daily Moroccan hospitality. Always keep 2 DH, 5 DH, 10 DH coins and 20 DH bills handy in an accessible pocket!
            </p>
          </div>

          <div className="space-y-2">
            {MOROCCAN_TIPPING_GUIDE.map((tip, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-white">{tip.service}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{tip.note}</div>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-bold text-xs tabular-nums whitespace-nowrap">
                  {tip.amountMad}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-[11px] text-amber-200">
            ⚠️ <strong>ATM DCC Alert:</strong> When withdrawing cash at Moroccan ATMs (Attijariwafa, Al Barid Bank, BMCE), the machine may ask: &ldquo;Charge your card in EUR/USD or in Moroccan Dirham?&rdquo; <strong>ALWAYS choose to be charged in Moroccan Dirham (MAD)</strong>. If you choose EUR/USD, the ATM will apply an inflated 6%–10% conversion surcharge!
          </div>
        </div>
      )}
    </div>
  );
};
