import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<Props> = ({ children }) => {
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center relative selection:bg-emerald-500 selection:text-white">
      {/* Desktop Mode Switcher Bar */}
      <div className="hidden lg:flex items-center justify-between w-full max-w-4xl px-4 py-2 text-xs text-slate-400 border-b border-slate-900 absolute top-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-semibold text-slate-200">DirhamPay Android PWA</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Moroccan Dirham (MAD) Currency Hub</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDeviceFrameMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium ${
              deviceFrameMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android Frame</span>
          </button>
          <button
            onClick={() => setDeviceFrameMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition font-medium ${
              !deviceFrameMode
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Full Width</span>
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div
        className={`w-full transition-all duration-300 flex items-center justify-center ${
          deviceFrameMode
            ? 'lg:py-10 max-w-md h-[100dvh] lg:h-[844px]'
            : 'max-w-xl h-[100dvh] lg:py-6'
        }`}
      >
        {deviceFrameMode ? (
          /* Realistic Android Phone Mockup */
          <div className="w-full h-full sm:h-[844px] max-w-[412px] bg-slate-950 rounded-none sm:rounded-[42px] sm:ring-[12px] sm:ring-slate-800 sm:shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden sm:border-[3px] sm:border-slate-700/60">
            {/* Speaker Ear Piece slot */}
            <div className="hidden sm:block absolute top-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-slate-800 rounded-full z-40 pointer-events-none" />

            {/* Inner Phone Screen */}
            <div className="w-full h-full flex flex-col bg-slate-950 text-slate-100 overflow-hidden relative">
              {children}
            </div>
          </div>
        ) : (
          /* Fluid Tablet / Full Container */
          <div className="w-full h-full max-w-md bg-slate-950 flex flex-col overflow-hidden border border-slate-800 rounded-2xl shadow-2xl">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
