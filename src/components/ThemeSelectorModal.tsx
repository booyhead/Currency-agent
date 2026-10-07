import React from 'react';
import { Palette, X, Check, Sparkles } from 'lucide-react';
import { useTheme, APP_THEMES, AppThemeId } from '../context/ThemeContext';

interface Props {
  onPlayClick: () => void;
}

export const ThemeSelectorModal: React.FC<Props> = ({ onPlayClick }) => {
  const { themeId, setThemeId, isThemeModalOpen, setIsThemeModalOpen } = useTheme();

  if (!isThemeModalOpen) return null;

  const themeList = Object.values(APP_THEMES);

  const handleSelect = (id: AppThemeId) => {
    onPlayClick();
    setThemeId(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop tap to dismiss */}
      <div className="flex-1" onClick={() => setIsThemeModalOpen(false)} />

      {/* Android Material 3 Bottom Sheet */}
      <div className="w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">App Color Theme</h3>
              <p className="text-xs text-slate-400">Choose primary palette for buttons, tabs, and accents</p>
            </div>
          </div>
          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
            aria-label="Close theme selector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme List */}
        <div className="p-5 space-y-2.5 overflow-y-auto">
          {themeList.map((t) => {
            const isSelected = themeId === t.id;

            return (
              <button
                key={t.id}
                onClick={() => handleSelect(t.id)}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center justify-between group ${
                  isSelected
                    ? 'bg-slate-800/90 border-slate-600 ring-2 ring-white/10 shadow-lg'
                    : 'bg-slate-950/60 border-slate-850 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  {/* Color Swatch Circle */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 ring-2 ring-white/10"
                    style={{ backgroundColor: t.previewColor }}
                  >
                    {isSelected && <Check className="w-5 h-5 text-white stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white tracking-tight">{t.name}</span>
                      <span className="text-xs text-slate-400 font-arabic">{t.nameAr}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{t.desc}</p>
                  </div>
                </div>

                {/* Sample mini interactive button preview */}
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm"
                    style={{ backgroundColor: t.previewColor }}
                  >
                    Sample
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info note */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Your selected theme is automatically saved to your device for future visits.</span>
        </div>
      </div>
    </div>
  );
};
