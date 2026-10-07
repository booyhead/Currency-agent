import React from 'react';
import { ArrowLeftRight, TrendingUp, ShoppingBag, Banknote, QrCode } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab = 'converter' | 'rates' | 'souk' | 'banknotes' | 'transfer';

interface Props {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onNavClickSound?: () => void;
}

export const AndroidNavBar: React.FC<Props> = ({
  activeTab,
  onTabChange,
  onNavClickSound,
}) => {
  const { theme } = useTheme();

  const tabs: { id: ActiveTab; label: string; labelAr: string; icon: React.FC<{ className?: string }> }[] = [
    {
      id: 'converter',
      label: 'Convert',
      labelAr: 'تحويل',
      icon: ArrowLeftRight,
    },
    {
      id: 'rates',
      label: 'BAM Rates',
      labelAr: 'الأسعار',
      icon: TrendingUp,
    },
    {
      id: 'souk',
      label: 'Souk & Ryal',
      labelAr: 'سوق وريال',
      icon: ShoppingBag,
    },
    {
      id: 'banknotes',
      label: 'Banknotes',
      labelAr: 'أوراق نقدية',
      icon: Banknote,
    },
    {
      id: 'transfer',
      label: 'Pay & QR',
      labelAr: 'أداء و QR',
      icon: QrCode,
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    if (onNavClickSound) onNavClickSound();
    onTabChange(tab);
  };

  return (
    <div className="w-full bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 shrink-0 z-20 pb-safe select-none">
      {/* 5 Material You navigation destinations */}
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className="flex flex-col items-center justify-center min-h-[48px] w-full group relative focus:outline-none transition-transform active:scale-95"
              aria-label={tab.label}
            >
              {/* Material You active indicator pill */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? `${theme.activeNavBg} ring-1`
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105' : 'scale-100'}`} />
              </div>
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive ? `${theme.accentText} font-semibold` : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android Native Gesture Home Bar */}
      <div className="w-full flex justify-center pb-1.5 pt-0.5">
        <div className="w-28 h-1 bg-slate-600/60 rounded-full"></div>
      </div>
    </div>
  );
};
