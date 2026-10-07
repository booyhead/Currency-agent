import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Maximize2, 
  X, 
  Store, 
  FileText, 
  Tag, 
  RefreshCw, 
  Sparkles, 
  Info,
  DollarSign,
  ChevronDown
} from 'lucide-react';
import { Currency } from '../types/currency';
import { useTheme } from '../context/ThemeContext';

interface Props {
  selectedCurrency: Currency;
  currencies?: Currency[];
  onSelectCurrency?: (curr: Currency) => void;
  onPlayClick: () => void;
}

type PayloadFormat = 'formatted_text' | 'payment_url' | 'json';

export const PaymentRequestQR: React.FC<Props> = ({
  selectedCurrency,
  currencies = [],
  onSelectCurrency,
  onPlayClick,
}) => {
  const { theme } = useTheme();

  // Mode: Foreign -> MAD or MAD -> Foreign
  const [activeCurrency, setActiveCurrency] = useState<Currency>(selectedCurrency);
  const [foreignAmount, setForeignAmount] = useState<string>('50');
  const [madAmount, setMadAmount] = useState<string>(
    (50 * selectedCurrency.rateToMad).toFixed(0)
  );
  const [lastEditedField, setLastEditedField] = useState<'foreign' | 'mad'>('foreign');

  // Transaction details
  const [merchantName, setMerchantName] = useState<string>('Souk Artisan');
  const [itemDescription, setItemDescription] = useState<string>('Handcrafted Souvenirs');
  const [paymentRef, setPaymentRef] = useState<string>(() => `MAD-${Math.floor(1000 + Math.random() * 9000)}`);
  const [payloadFormat, setPayloadFormat] = useState<PayloadFormat>('formatted_text');
  
  // UI states
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with prop if selectedCurrency changes from parent
  useEffect(() => {
    setActiveCurrency(selectedCurrency);
    const fAmt = parseFloat(foreignAmount) || 0;
    setMadAmount((fAmt * selectedCurrency.rateToMad).toFixed(0));
  }, [selectedCurrency]);

  // Handle foreign amount edit
  const handleForeignChange = (val: string) => {
    setForeignAmount(val);
    setLastEditedField('foreign');
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0) {
      setMadAmount((parsed * activeCurrency.rateToMad).toFixed(2));
    } else {
      setMadAmount('0');
    }
  };

  // Handle MAD amount edit
  const handleMadChange = (val: string) => {
    setMadAmount(val);
    setLastEditedField('mad');
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && activeCurrency.rateToMad > 0) {
      setForeignAmount((parsed / activeCurrency.rateToMad).toFixed(2));
    } else {
      setForeignAmount('0');
    }
  };

  // Preset merchant amounts in MAD
  const quickPresets = [
    { label: 'Tea / Café', mad: 25, desc: 'Mint Tea & Café' },
    { label: 'Petit Taxi', mad: 30, desc: 'Medina Taxi Fare' },
    { label: 'Tagine Meal', mad: 120, desc: 'Moroccan Dinner' },
    { label: 'Souk Babouches', mad: 180, desc: 'Leather Babouches' },
    { label: 'Argan / Spices', mad: 350, desc: 'Pure Argan & Spices' },
    { label: 'Riad Stay', mad: 800, desc: 'Riad Accommodation' },
  ];

  const handleApplyPreset = (madVal: number, desc: string) => {
    onPlayClick();
    setMadAmount(madVal.toString());
    setItemDescription(desc);
    setLastEditedField('mad');
    if (activeCurrency.rateToMad > 0) {
      setForeignAmount((madVal / activeCurrency.rateToMad).toFixed(2));
    }
  };

  const handleRegenerateRef = () => {
    onPlayClick();
    setPaymentRef(`MAD-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  // Build the QR payload content
  const numericMad = parseFloat(madAmount) || 0;
  const numericForeign = parseFloat(foreignAmount) || 0;
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const buildPayloadString = (): string => {
    if (payloadFormat === 'json') {
      return JSON.stringify({
        app: 'DirhamConvert',
        type: 'PAYMENT_REQUEST',
        reference: paymentRef,
        amount_mad: numericMad,
        currency_foreign: activeCurrency.code,
        amount_foreign: numericForeign,
        exchange_rate: activeCurrency.rateToMad,
        merchant: merchantName.trim() || 'Moroccan Merchant',
        description: itemDescription.trim() || 'Purchase',
        date: currentDate,
        time: currentTime,
      }, null, 2);
    }

    if (payloadFormat === 'payment_url') {
      const params = new URLSearchParams({
        mad: numericMad.toFixed(2),
        foreign: numericForeign.toFixed(2),
        curr: activeCurrency.code,
        rate: activeCurrency.rateToMad.toFixed(4),
        ref: paymentRef,
        merchant: merchantName.trim() || 'Merchant',
        desc: itemDescription.trim() || 'Purchase',
        date: currentDate,
      });
      return `https://dirhamconvert.ma/pay?${params.toString()}`;
    }

    // Default: Formatted text receipt easily read by any smartphone camera (iPhone, Samsung, Google Lens)
    return [
      `🇲🇦 DEMANDE DE PAIEMENT DIRHAM`,
      `MOROCCAN DIRHAM PAYMENT REQUEST`,
      `طلب أداء بالدرهم المغربي`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Montant / Amount: ${numericMad.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`,
      `Équivalent / Equivalent: ${numericForeign.toFixed(2)} ${activeCurrency.code}`,
      `Taux appliqué / Rate: 1 ${activeCurrency.code} = ${activeCurrency.rateToMad.toFixed(4)} MAD`,
      `Marchand / Merchant: ${merchantName.trim() || 'Artisan / Local Merchant'}`,
      `Article / Item: ${itemDescription.trim() || 'Moroccan Crafts & Goods'}`,
      `Réf: ${paymentRef}`,
      `Date: ${currentDate} ${currentTime}`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Vérifié via DirhamConvert (Taux Bank Al-Maghrib)`,
    ].join('\n');
  };

  // Generate QR code whenever fields or format change
  useEffect(() => {
    let isCancelled = false;
    const generate = async () => {
      setGenerating(true);
      try {
        const text = buildPayloadString();
        const url = await QRCode.toDataURL(text, {
          width: 480,
          margin: 2,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#0f172a', // Deep slate for high contrast & reliable camera detection
            light: '#ffffff',
          },
        });
        if (!isCancelled) {
          setQrDataUrl(url);
        }
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      } finally {
        if (!isCancelled) setGenerating(false);
      }
    };

    generate();
    return () => {
      isCancelled = true;
    };
  }, [
    madAmount,
    foreignAmount,
    activeCurrency,
    merchantName,
    itemDescription,
    paymentRef,
    payloadFormat,
  ]);

  // Copy details to clipboard
  const handleCopyDetails = async () => {
    onPlayClick();
    const text = buildPayloadString();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  // Share via Web Share API
  const handleShare = async () => {
    onPlayClick();
    const text = buildPayloadString();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Morocco Payment Request - ${numericMad} MAD`,
          text: text,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopyDetails();
    }
  };

  // Download QR code PNG
  const handleDownloadQR = () => {
    onPlayClick();
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `dirham-payment-${paymentRef}-${numericMad}MAD.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCurrencyDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Feature Header Card */}
      <div className={`p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/90 border ${theme.cardGlowBorder} relative overflow-hidden`}>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center ${theme.accentText}`}>
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                Merchant Payment Request QR
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                  Direct Scan
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Demande de Paiement / طلب أداء — show or send to local merchants & souk artisans
              </p>
            </div>
          </div>
        </div>

        {/* Currency & Amount Builder */}
        <div className="mt-3.5 space-y-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
          {/* Two-Way Dual Currency Input Row */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Foreign Currency Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Foreign Amount
                </span>
                {/* Currency picker button */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => {
                      onPlayClick();
                      setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen);
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-300 border border-slate-700 transition"
                  >
                    <span>{activeCurrency.flag}</span>
                    <span>{activeCurrency.code}</span>
                    <ChevronDown className="w-2.5 h-2.5 opacity-70" />
                  </button>

                  {/* Dropdown menu */}
                  {isCurrencyDropdownOpen && currencies.length > 0 && (
                    <div className="absolute right-0 top-full mt-1 w-36 max-h-48 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 py-1">
                      {currencies.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => {
                            onPlayClick();
                            setActiveCurrency(c);
                            if (onSelectCurrency) onSelectCurrency(c);
                            setIsCurrencyDropdownOpen(false);
                            // Recalculate
                            const parsed = parseFloat(foreignAmount) || 0;
                            setMadAmount((parsed * c.rateToMad).toFixed(0));
                          }}
                          className={`w-full px-2.5 py-1.5 flex items-center justify-between text-left hover:bg-slate-800 text-xs transition ${
                            activeCurrency.code === c.code ? 'text-amber-300 bg-slate-800/60 font-bold' : 'text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <span>{c.flag}</span>
                            <span>{c.code}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {c.rateToMad.toFixed(2)}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={foreignAmount}
                  onChange={(e) => handleForeignChange(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-3 pr-10 py-2 rounded-xl bg-slate-900 border ${
                    lastEditedField === 'foreign' ? 'border-amber-400/60 ring-1 ring-amber-400/20' : 'border-slate-800'
                  } text-white font-extrabold text-base tabular-nums focus:outline-none focus:border-amber-400`}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                  {activeCurrency.symbol || activeCurrency.code}
                </span>
              </div>
            </div>

            {/* Moroccan Dirham Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <span>🇲🇦</span> Total in MAD
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  1 {activeCurrency.code} = {activeCurrency.rateToMad.toFixed(2)}
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={madAmount}
                  onChange={(e) => handleMadChange(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-3 pr-11 py-2 rounded-xl bg-slate-900 border ${
                    lastEditedField === 'mad' ? 'border-emerald-400/60 ring-1 ring-emerald-400/20' : 'border-slate-800'
                  } text-emerald-400 font-extrabold text-base tabular-nums focus:outline-none focus:border-emerald-400`}
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500 pointer-events-none">
                  MAD
                </span>
              </div>
            </div>
          </div>

          {/* Quick Souk / Merchant Presets */}
          <div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-amber-400" />
                <span>Common Souk & Travel Presets:</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {quickPresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleApplyPreset(preset.mad, preset.desc)}
                  className="px-2 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition flex flex-col justify-between group"
                >
                  <span className="text-[10px] font-semibold text-slate-300 group-hover:text-white truncate">
                    {preset.label}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {preset.mad} MAD
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Details: Merchant Name & Item */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <Store className="w-3 h-3 text-slate-400" />
                Merchant / Shop:
              </label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="e.g. Souk Artisan, Café"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 block mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-400" />
                Note / Item:
              </label>
              <input
                type="text"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="e.g. Babouches, Dinner"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-slate-700"
              />
            </div>
          </div>

          {/* Reference & Format Options */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px]">
              <span>Ref:</span>
              <span className="font-mono font-semibold text-slate-300">{paymentRef}</span>
              <button
                onClick={handleRegenerateRef}
                title="Generate new reference code"
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <RefreshCw className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Payload format selector */}
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => {
                  onPlayClick();
                  setPayloadFormat('formatted_text');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                  payloadFormat === 'formatted_text'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Readable Receipt
              </button>
              <button
                onClick={() => {
                  onPlayClick();
                  setPayloadFormat('payment_url');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                  payloadFormat === 'payment_url'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Web Link
              </button>
              <button
                onClick={() => {
                  onPlayClick();
                  setPayloadFormat('json');
                }}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                  payloadFormat === 'json'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main QR Code & Digital Voucher Card */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center relative space-y-4">
        {/* Scannable QR Container */}
        <div className="relative group">
          <div className="p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center border-4 border-amber-400/80 ring-4 ring-slate-800 transition transform group-hover:scale-[1.02]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Payment Request QR Code"
                className="w-52 h-52 object-contain rounded-lg"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-slate-600" />
              </div>
            )}
          </div>

          {/* Fullscreen Expand Overlay Button */}
          <button
            onClick={() => {
              onPlayClick();
              setIsFullscreen(true);
            }}
            title="Expand to Fullscreen for easy scanning"
            className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-700 shadow-lg hover:bg-slate-800 transition"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="w-full grid grid-cols-3 gap-2">
          {/* Copy Receipt Text */}
          <button
            onClick={handleCopyDetails}
            className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* Download Image */}
          <button
            onClick={handleDownloadQR}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 flex items-center justify-center gap-1.5 text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Save PNG</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 flex items-center justify-center gap-1.5 text-xs font-bold transition"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Share</span>
          </button>
        </div>

        {/* Merchant Voucher Preview (Receipt Look) */}
        <div className="w-full p-3.5 rounded-xl bg-slate-950 border border-dashed border-slate-700 relative overflow-hidden">
          {/* Top Notch Stamp Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🇲🇦</span>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  Payment Request Ticket
                </div>
                <div className="text-[9px] text-slate-400">
                  Demande de paiement au marchand
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400">
                {paymentRef}
              </div>
              <div className="text-[9px] text-slate-500">
                {currentDate}
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="flex items-baseline justify-between py-1">
            <span className="text-xs text-slate-400 font-medium">To Receive / À Payer:</span>
            <div className="text-right">
              <div className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                {numericMad.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
              </div>
              <div className="text-[11px] font-semibold text-slate-300">
                ≈ {numericForeign.toFixed(2)} {activeCurrency.code}
              </div>
            </div>
          </div>

          {/* Rate & Breakdown */}
          <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>Applied Exchange Rate:</span>
              <span className="text-slate-200 font-mono font-medium">
                1 {activeCurrency.code} = {activeCurrency.rateToMad.toFixed(4)} MAD
              </span>
            </div>
            <div className="flex justify-between">
              <span>Merchant / Shop:</span>
              <span className="text-slate-200 font-medium truncate max-w-[160px]">
                {merchantName || 'Local Merchant'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Description:</span>
              <span className="text-slate-200 font-medium truncate max-w-[160px]">
                {itemDescription || 'Souk Purchase'}
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              Official Bank Al-Maghrib benchmark rate
            </span>
            <span>DirhamConvert</span>
          </div>
        </div>

        {/* Tip for travelers */}
        <div className="w-full flex items-start gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong className="text-slate-300">Merchant Tip:</strong> Local artisans and taxi drivers in Morocco can point any smartphone camera (iPhone or Android) at this QR code to immediately read the conversion details, rate, and agreed Dirham sum.
          </p>
        </div>
      </div>

      {/* Fullscreen Enlarge Modal for Easy Scanning */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div 
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col items-center space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                <QrCode className="w-4 h-4" />
                <span>Scan with Phone Camera</span>
              </div>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* High-visibility pure white card container */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border-4 border-amber-400">
              <img
                src={qrDataUrl}
                alt="Enlarged Payment QR"
                className="w-64 h-64 object-contain"
              />
            </div>

            {/* Large Price Display */}
            <div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight font-mono">
                {numericMad.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
              </div>
              <div className="text-xs text-slate-300 font-semibold mt-0.5">
                ≈ {numericForeign.toFixed(2)} {activeCurrency.code}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {merchantName} • {itemDescription}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Tap anywhere outside or close to return
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
