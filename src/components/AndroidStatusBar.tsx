import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles, Download, Volume2, VolumeX, Palette, MapPin } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';

interface Props {
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const AndroidStatusBar: React.FC<Props> = ({ soundEnabled, onToggleSound }) => {
  const isOnline = useOnlineStatus();
  const { isInstallable, install } = usePWAInstall();
  const { theme, setIsThemeModalOpen } = useTheme();
  const { detectedLocation, pinnedCurrencyCode } = useLocation();
  const [time, setTime] = useState('12:45');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md px-4 py-1.5 flex items-center justify-between text-[11px] font-medium text-slate-300 border-b border-white/5 select-none shrink-0 z-30">
      {/* Left: Clock & Network Carrier & Location */}
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-100 tracking-tight">{time}</span>
        <span className="hidden sm:inline text-slate-400 text-[10px]">·</span>
        <span className="text-[10px] text-slate-400 font-normal">Maroc Telecom 5G</span>
        {detectedLocation && (
          <span className="hidden xs:flex items-center gap-0.5 text-[10px] text-emerald-400/90 font-medium">
            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
            <span>{detectedLocation.countryCode}</span>
          </span>
        )}
      </div>

      {/* Center: Punch-hole camera simulator indicator on framed view */}
      <div className="hidden sm:flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-2 ring-slate-800"></div>
      </div>

      {/* Right: Actions, Theme, Sound, Offline badge, WiFi & Battery */}
      <div className="flex items-center gap-2.5">
        {/* Color Theme switcher button */}
        <button
          onClick={() => setIsThemeModalOpen(true)}
          title={`Theme: ${theme.name} (Tap to change)`}
          className="flex items-center gap-1 p-0.5 text-slate-400 hover:text-slate-200 transition"
          aria-label="Change color theme"
        >
          <div
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white/20"
            style={{ backgroundColor: theme.previewColor }}
          />
          <Palette className="w-3.5 h-3.5" />
        </button>

        {/* Sound toggle button */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? 'Mute click sound' : 'Enable click sound'}
          className="text-slate-400 hover:text-slate-200 transition p-0.5"
          aria-label="Toggle haptic audio"
        >
          {soundEnabled ? (
            <Volume2 className={`w-3.5 h-3.5 ${theme.accentText}`} />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
        </button>

        {/* PWA Install shortcut button */}
        {isInstallable && (
          <button
            onClick={install}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition ${theme.accentBgLight} ${theme.accentText} ${theme.accentBorder}`}
          >
            <Download className="w-2.5 h-2.5" />
            Install
          </button>
        )}

        {/* Online / Offline status */}
        {!isOnline ? (
          <span className="flex items-center gap-1 text-[10px] text-amber-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Offline
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-normal hidden xs:inline">5G</span>
        )}

        <Wifi className="w-3 h-3 text-slate-300" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-300 tabular-nums">98%</span>
          <BatteryMedium className={`w-3.5 h-3.5 ${theme.accentText}`} />
        </div>
      </div>
    </div>
  );
};
