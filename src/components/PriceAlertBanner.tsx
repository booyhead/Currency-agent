import React from 'react';
import { BellRing, X, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { useAlerts } from '../context/AlertContext';
import { useTheme } from '../context/ThemeContext';

export const PriceAlertBanner: React.FC = () => {
  const { activeNotifications, dismissNotification } = useAlerts();
  const { theme } = useTheme();

  if (activeNotifications.length === 0) return null;

  return (
    <div className="absolute top-10 left-3 right-3 z-50 flex flex-col gap-2 pointer-events-auto">
      {activeNotifications.map((notif) => {
        const isAbove = notif.condition === 'ABOVE_OR_EQUAL';
        const triggerRate = notif.currentRateAtTrigger ?? notif.targetRate;

        return (
          <div
            key={notif.id}
            className="p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-amber-500/50 shadow-2xl shadow-amber-950/40 animate-in slide-in-from-top-4 duration-300 flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 animate-bounce">
              <BellRing className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Rate Alert Triggered!
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                </div>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-sm font-extrabold text-white mt-0.5">
                {notif.currencyCode} crossed your target threshold!
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
                <span className="tabular-nums font-mono">
                  Live Rate: <strong className="text-emerald-400">{triggerRate.toFixed(3)} MAD</strong>
                </span>
                <span>·</span>
                <span className="text-slate-400 flex items-center gap-0.5 text-[11px]">
                  {isAbove ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownRight className="w-3 h-3 text-rose-400" />}
                  Target: {isAbove ? '≥' : '≤'} {notif.targetRate.toFixed(3)} MAD
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${theme.accentBg} ${theme.accentBgHover} text-white shadow-sm transition`}
                >
                  Acknowledge
                </button>
                <span className="text-[10px] text-slate-500">
                  {notif.triggeredAt ? new Date(notif.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
