import React, { useState } from 'react';
import { ArrowLeftRight, Coffee, Car, Utensils, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { Currency, RateMode } from '../types/currency';
import { getEffectiveRate } from '../services/ratesService';
import { useTheme } from '../context/ThemeContext';

interface Props {
  selectedCurrency: Currency;
  rateMode: RateMode;
  onSelectReverseAmount: (madAmount: number) => void;
  onPlayClick: () => void;
}

interface CommonExpense {
  title: string;
  mad: number;
  icon: React.FC<{ className?: string }>;
  sub: string;
}

export const QuickConvertWidget: React.FC<Props> = ({
  selectedCurrency,
  rateMode,
  onSelectReverseAmount,
  onPlayClick,
}) => {
  const { theme } = useTheme();
  const [activeWidgetTab, setActiveWidgetTab] = useState<'banknotes' | 'expenses'>('banknotes');

  // Compute current reverse exchange rate: 1 MAD = X Foreign
  const { rate: effectiveRate } = getEffectiveRate(selectedCurrency, rateMode, 'MAD_TO_FOREIGN');
  const madToForeignFactor = effectiveRate > 0 ? 1 / effectiveRate : 0;

  const madPresets = [
    { mad: 20, ryals: '400 Ryals', note: '20 DH Note' },
    { mad: 50, ryals: '1k Ryals', note: '50 DH Note' },
    { mad: 100, ryals: '2k Ryals', note: '100 DH Note' },
    { mad: 200, ryals: '4k Ryals', note: '200 DH Note' },
    { mad: 500, ryals: '10k Ryals', note: 'Half-Mille' },
    { mad: 1000, ryals: '20k Ryals', note: 'Mille DH' },
  ];

  const commonExpenses: CommonExpense[] = [
    { title: 'Mint Tea / Café', mad: 15, icon: Coffee, sub: 'Local café & terrace' },
    { title: 'City Petit Taxi', mad: 25, icon: Car, sub: 'Average city meter fare' },
    { title: 'Medina Tagine', mad: 60, icon: Utensils, sub: 'Casual traditional dinner' },
    { title: 'Authentic Hammam', mad: 180, icon: Sparkles, sub: 'Scrub & olive soap' },
  ];

  const handlePresetClick = (madAmount: number) => {
    onPlayClick();
    onSelectReverseAmount(madAmount);
  };

  return (
    <div className="mx-4 mt-2.5 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-sm space-y-2.5">
      {/* Widget Header with Tab Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`p-1 rounded-lg ${theme.accentBgLight} ${theme.accentText}`}>
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Quick Convert (MAD → {selectedCurrency.code})</span>
            </h4>
            <p className="text-[10px] text-slate-400">1-tap reverse conversion to your currency</p>
          </div>
        </div>

        {/* Mini Tab Switcher */}
        <div className="flex p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-semibold">
          <button
            onClick={() => {
              onPlayClick();
              setActiveWidgetTab('banknotes');
            }}
            className={`px-2 py-1 rounded-md transition ${
              activeWidgetTab === 'banknotes'
                ? `${theme.accentBg} text-white shadow-xs`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Banknotes
          </button>
          <button
            onClick={() => {
              onPlayClick();
              setActiveWidgetTab('expenses');
            }}
            className={`px-2 py-1 rounded-md transition ${
              activeWidgetTab === 'expenses'
                ? `${theme.accentBg} text-white shadow-xs`
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily Prices
          </button>
        </div>
      </div>

      {/* Content based on Active Sub-Tab */}
      {activeWidgetTab === 'banknotes' ? (
        <div className="grid grid-cols-3 gap-1.5">
          {madPresets.map((item) => {
            const convertedForeign = (item.mad * madToForeignFactor).toFixed(2);

            return (
              <button
                key={item.mad}
                onClick={() => handlePresetClick(item.mad)}
                className="p-2 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition text-left group active:scale-95 flex flex-col justify-between"
                title={`Convert ${item.mad} MAD to ${selectedCurrency.code}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-extrabold text-white tabular-nums tracking-tight">
                    {item.mad} <span className="text-[10px] font-normal text-slate-400">DH</span>
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">{item.ryals}</span>
                </div>

                <div className="mt-1 flex items-baseline justify-between w-full">
                  <span className={`text-xs font-bold ${theme.accentText} tabular-nums group-hover:scale-105 transition-transform`}>
                    ≈ {convertedForeign} {selectedCurrency.symbol}
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {commonExpenses.map((exp) => {
            const convertedForeign = (exp.mad * madToForeignFactor).toFixed(2);
            const Icon = exp.icon;

            return (
              <button
                key={exp.title}
                onClick={() => handlePresetClick(exp.mad)}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 transition text-left group active:scale-95 flex items-center justify-between"
                title={`Convert ${exp.mad} MAD to ${selectedCurrency.code}`}
              >
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-bold text-white truncate">{exp.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {exp.mad} DH · <span className={`font-semibold ${theme.accentText}`}>≈ {convertedForeign} {selectedCurrency.symbol}</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-white transition-colors shrink-0" />
              </button>
            );
          })}
        </div>
      )}

      {/* Hint footer */}
      <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
        <span>Tap any value to load it directly into the calculator</span>
        <span className="text-slate-500 font-mono">100 DH ≈ {(100 * madToForeignFactor).toFixed(2)} {selectedCurrency.code}</span>
      </div>
    </div>
  );
};
