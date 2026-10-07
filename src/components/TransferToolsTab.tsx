import React, { useState } from 'react';
import { Landmark, Send, AlertTriangle, ShieldCheck, ExternalLink, HelpCircle, Palette, Check, QrCode } from 'lucide-react';
import { Currency } from '../types/currency';
import { REMITTANCE_OPTIONS } from '../data/banknotes';
import { useTheme, APP_THEMES } from '../context/ThemeContext';
import { PaymentRequestQR } from './PaymentRequestQR';

interface Props {
  selectedCurrency: Currency;
  currencies?: Currency[];
  onSelectCurrency?: (curr: Currency) => void;
  onPlayClick: () => void;
}

export const TransferToolsTab: React.FC<Props> = ({ 
  selectedCurrency, 
  currencies, 
  onSelectCurrency, 
  onPlayClick 
}) => {
  const { themeId, theme, setThemeId } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'qr' | 'remittance' | 'settings'>('qr');
  const [sendAmount, setSendAmount] = useState<number>(300);

  const calculateReceivedMad = (sendVal: number, fee: number, spreadPct: number) => {
    const netSend = Math.max(0, sendVal - fee);
    const baseRate = selectedCurrency.rateToMad;
    const effectiveRate = baseRate * (1 - spreadPct / 100);
    return Math.round(netSend * effectiveRate);
  };

  return (
    <div className="flex flex-col flex-1 pb-4 overflow-y-auto px-4 space-y-3 pt-3">
      {/* Sub-Navigation Switcher */}
      <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
        <button
          onClick={() => {
            onPlayClick();
            setActiveSubTab('qr');
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'qr'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Merchant QR</span>
        </button>

        <button
          onClick={() => {
            onPlayClick();
            setActiveSubTab('remittance');
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'remittance'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Remittance</span>
        </button>

        <button
          onClick={() => {
            onPlayClick();
            setActiveSubTab('settings');
          }}
          className={`flex-1 py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
            activeSubTab === 'settings'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Theme & Rules</span>
        </button>
      </div>

      {/* Sub-Tab 1: Payment Request QR Generator */}
      {activeSubTab === 'qr' && (
        <PaymentRequestQR
          selectedCurrency={selectedCurrency}
          currencies={currencies}
          onSelectCurrency={onSelectCurrency}
          onPlayClick={onPlayClick}
        />
      )}

      {/* Sub-Tab 2: Remittance Provider Comparison */}
      {activeSubTab === 'remittance' && (
        <>
          {/* Header card */}
          <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border ${theme.cardGlowBorder}`}>
            <div className={`flex items-center gap-2 ${theme.accentText} text-xs font-bold mb-1`}>
              <Send className="w-4 h-4" />
              <span>Sending Money to Morocco (MRE & Remittance)</span>
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Transfer Comparison & ATM Guide
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Compare total Moroccan Dirham received when sending from abroad to Morocco.
            </p>

            {/* Amount Input */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 block mb-1">Send Amount ({selectedCurrency.code}):</label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    value={sendAmount || ''}
                    onChange={(e) => setSendAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-base tabular-nums focus:outline-none focus:ring-1 ${theme.accentRing}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {selectedCurrency.code}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 self-end pb-1">
                {[100, 300, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      onPlayClick();
                      setSendAmount(amt);
                    }}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Remittance Comparison Cards */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white block">Provider Comparison:</span>
            {REMITTANCE_OPTIONS.map((provider) => {
              const madReceived = calculateReceivedMad(
                sendAmount,
                provider.transferFeeUsd,
                provider.spreadPercent
              );

              return (
                <div
                  key={provider.name}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-1.5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{provider.name}</h4>
                      <div className="text-[11px] text-emerald-400 font-medium">
                        {provider.recommendedFor}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-400 tabular-nums">
                        {madReceived.toLocaleString()} MAD
                      </div>
                      <div className="text-[10px] text-slate-400">Est. payout</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Fee:</span>
                      <span className="text-slate-300 font-medium">${provider.transferFeeUsd.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Speed:</span>
                      <span className="text-slate-300 font-medium">{provider.deliverySpeed}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Spread:</span>
                      <span className="text-slate-300 font-medium">~{provider.spreadPercent}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Sub-Tab 3: App Appearance & Moroccan Customs Regulations */}
      {activeSubTab === 'settings' && (
        <>
          {/* App Appearance / Color Theme Setting Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className={`w-4 h-4 ${theme.accentText}`} />
                <h3 className="text-xs font-bold text-white">App Color Theme</h3>
              </div>
              <span className={`text-[10px] font-semibold ${theme.accentText}`}>
                {theme.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Choose your preferred color palette for buttons, keypad, and navigation:
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {Object.values(APP_THEMES).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onPlayClick();
                    setThemeId(t.id);
                  }}
                  className={`py-2 px-1 rounded-xl border flex flex-col items-center gap-1.5 transition text-center ${
                    themeId === t.id
                      ? 'bg-slate-800 border-slate-600 ring-1 ring-white/20 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: t.previewColor }}
                  >
                    {themeId === t.id && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-200 truncate w-full px-0.5">
                    {t.name.split(' ')[1] || t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Moroccan Customs & Currency Regulations Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Morocco Customs & Exchange Regulations (Office des Changes)</span>
            </h3>

            <div className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                • <strong>Non-Convertible Currency:</strong> The Moroccan Dirham is restricted. You cannot take more than <strong>2,000 MAD in physical cash</strong> outside the country when departing.
              </p>
              <p>
                • <strong>Exchange Slips:</strong> Always keep your bank receipt or bureau de change voucher when exchanging cash in Morocco. You will need it to convert remaining MAD back to foreign currency at the airport before departure.
              </p>
              <p>
                • <strong>Bringing Foreign Cash:</strong> Foreign travelers may bring up to <strong>100,000 MAD</strong> equivalent in foreign currency without customs declaration. Above that, customs declaration upon arrival is mandatory.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
