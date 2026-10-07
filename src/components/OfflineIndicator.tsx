import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white shadow-xl border border-amber-400/30 animate-in fade-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 shrink-0" />
        <span>Offline Mode — Using cached Bank Al-Maghrib rates</span>
      </div>
      <span className="h-2 w-2 rounded-full bg-white animate-pulse shrink-0" />
    </div>
  );
};
