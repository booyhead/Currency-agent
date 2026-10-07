import React, { useState } from 'react';
import { Bell, X, Check, Trash2, ArrowUpRight, ArrowDownRight, Sparkles, AlertCircle } from 'lucide-react';
import { Currency } from '../types/currency';
import { AlertCondition } from '../types/alert';
import { useAlerts } from '../context/AlertContext';
import { useTheme } from '../context/ThemeContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  onPlayClick: () => void;
}

export const PriceAlertModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currency,
  onPlayClick,
}) => {
  const { alerts, addAlert, removeAlert, toggleAlert, simulateTrigger } = useAlerts();
  const { theme } = useTheme();

  const [condition, setCondition] = useState<AlertCondition>('ABOVE_OR_EQUAL');
  const [targetRate, setTargetRate] = useState<string>(
    (currency.rateToMad * 1.01).toFixed(3) // default +1% target
  );
  const [justSaved, setJustSaved] = useState(false);

  if (!isOpen) return null;

  const currentRate = currency.rateToMad;
  const numericTarget = parseFloat(targetRate) || currentRate;

  // Filter alerts for current currency
  const currencyAlerts = alerts.filter((a) => a.currencyCode === currency.code);

  const handlePercentageBump = (pct: number) => {
    onPlayClick();
    const newRate = currentRate * (1 + pct / 100);
    setTargetRate(newRate.toFixed(3));
    if (pct > 0) {
      setCondition('ABOVE_OR_EQUAL');
    } else {
      setCondition('BELOW_OR_EQUAL');
    }
  };

  const handleSave = () => {
    onPlayClick();
    if (numericTarget > 0) {
      addAlert(currency.code, numericTarget, condition);
      setJustSaved(true);
      setTimeout(() => {
        setJustSaved(false);
      }, 1500);
    }
  };

  const handleSimulate = () => {
    onPlayClick();
    simulateTrigger(currency.code, currentRate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Bottom Sheet */}
      <div className="w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] animate-in slide-in-from-bottom duration-300">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${theme.accentBgLight} ${theme.accentText}`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Price Alert: {currency.code}/MAD
              </h3>
              <p className="text-xs text-slate-400">
                Get notified when {currency.name} hits your target rate
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Current Rate Benchmark Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Current Live Benchmark</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-2xl" role="img" aria-label={currency.country}>
                  {currency.flag}
                </span>
                <span className="text-lg font-black text-white tabular-nums">
                  1 {currency.code} = {currentRate.toFixed(3)} MAD
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className={`text-xs font-bold tabular-nums ${currency.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currency.change24h >= 0 ? '+' : ''}{currency.change24h}% (24h)
              </span>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Alert Trigger Condition:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onPlayClick();
                  setCondition('ABOVE_OR_EQUAL');
                }}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                  condition === 'ABOVE_OR_EQUAL'
                    ? `${theme.accentBgLight} ${theme.accentBorder} text-white ring-1 ring-white/10`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-xs font-semibold">
                  <span>Rises Above (≥)</span>
                  <span className="block text-[10px] text-slate-400 font-normal">Stronger currency</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onPlayClick();
                  setCondition('BELOW_OR_EQUAL');
                }}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                  condition === 'BELOW_OR_EQUAL'
                    ? `${theme.accentBgLight} ${theme.accentBorder} text-white ring-1 ring-white/10`
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <ArrowDownRight className="w-4 h-4 text-rose-400 shrink-0" />
                <div className="text-xs font-semibold">
                  <span>Drops Below (≤)</span>
                  <span className="block text-[10px] text-slate-400 font-normal">Cheaper to buy</span>
                </div>
              </button>
            </div>
          </div>

          {/* Target Rate Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Exchange Rate (MAD):</label>
              <span className="text-[11px] text-slate-400 font-mono">
                Variance: {(((numericTarget - currentRate) / currentRate) * 100).toFixed(2)}%
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  step="0.001"
                  value={targetRate}
                  onChange={(e) => setTargetRate(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-black text-lg tabular-nums focus:outline-none focus:ring-2 ${theme.accentRing}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  MAD
                </span>
              </div>

              {/* Stepper buttons */}
              <button
                onClick={() => {
                  onPlayClick();
                  setTargetRate((prev) => (Math.max(0, (parseFloat(prev) || currentRate) - 0.05)).toFixed(3));
                }}
                className="px-2.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700"
              >
                -0.05
              </button>
              <button
                onClick={() => {
                  onPlayClick();
                  setTargetRate((prev) => ((parseFloat(prev) || currentRate) + 0.05).toFixed(3));
                }}
                className="px-2.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 border border-slate-700"
              >
                +0.05
              </button>
            </div>

            {/* Quick Percentage Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 no-scrollbar text-xs">
              <span className="text-[10px] text-slate-500 shrink-0">Presets:</span>
              {[
                { label: '-2%', val: -2 },
                { label: '-1%', val: -1 },
                { label: '-0.5%', val: -0.5 },
                { label: '+0.5%', val: 0.5 },
                { label: '+1%', val: 1 },
                { label: '+2%', val: 2 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => handlePercentageBump(p.val)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono tabular-nums border border-slate-700/60"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons: Save & Simulate */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition flex items-center justify-center gap-1.5 ${theme.accentBg} ${theme.accentBgHover}`}
            >
              {justSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Alert Saved!</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  <span>Set Price Alert</span>
                </>
              )}
            </button>

            <button
              onClick={handleSimulate}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-slate-700/80 transition flex items-center gap-1.5 shrink-0"
              title="Test notification immediately"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Alert</span>
            </button>
          </div>

          {/* Active Alerts List for Current Currency */}
          {currencyAlerts.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-bold text-white block">Active Alerts ({currencyAlerts.length}):</span>
              {currencyAlerts.map((alt) => (
                <div
                  key={alt.id}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    {alt.condition === 'ABOVE_OR_EQUAL' ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-white tabular-nums">
                        {alt.condition === 'ABOVE_OR_EQUAL' ? '≥' : '≤'} {alt.targetRate.toFixed(3)} MAD
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {alt.isTriggered ? 'Triggered' : alt.isActive ? 'Active monitoring' : 'Paused'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onPlayClick();
                        toggleAlert(alt.id);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold transition ${
                        alt.isActive
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {alt.isActive ? 'Active' : 'Off'}
                    </button>
                    <button
                      onClick={() => {
                        onPlayClick();
                        removeAlert(alt.id);
                      }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                      aria-label="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
