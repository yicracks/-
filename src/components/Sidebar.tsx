import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Square, 
  Circle, 
  Grid2X2, 
  Eraser, 
  Download, 
  Settings2, 
  Palette,
  CircleDot,
  Type,
  MousePointer2,
  Trash2,
  Maximize,
  Copy,
  Undo2,
  Redo2,
  RefreshCw,
  RotateCw,
  Infinity,
  Sparkles,
  FolderHeart
} from 'lucide-react';
import { MandalaSettings } from '../types';
import { Lang, t } from '../utils/i18n';

interface SidebarProps {
  settings: MandalaSettings;
  setSettings: React.Dispatch<React.SetStateAction<MandalaSettings>>;
  onClear: () => void;
  onDownload: () => void;
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDark?: boolean;
  lang?: Lang;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  settings, 
  setSettings, 
  onClear, 
  onDownload,
  onSave,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  isDark = false,
  lang = 'en' as Lang
}) => {
  const colors = [
    '#4A4A4A', '#C5A880', '#8E9F8E', '#D29C8B', '#A19CBE', '#A1C4D1', '#EAD5A0', '#B26262'
  ];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`w-full md:w-64 shrink-0 rounded-2xl p-3 md:p-4 flex flex-row md:flex-col gap-4 overflow-x-auto md:overflow-y-auto select-none border transition-all duration-300 pb-4 md:pb-6 ${
        isDark 
          ? 'bg-stone-900/40 border-stone-800/80 text-stone-100 shadow-inner' 
          : 'bg-stone-50/80 border-stone-200/50 text-stone-850 shadow-inner'
      }`}
    >
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0 pr-2 border-r md:border-r-0 md:border-b md:pb-3 border-stone-400/10">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
          isDark 
            ? 'bg-amber-950/30 border-amber-800 text-amber-400' 
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <CircleDot size={15} className="text-amber-500 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-xs md:text-sm font-bold tracking-tight">{t(lang, 'sidebar.title')}</h1>
          <p className="text-[8px] font-bold tracking-wider uppercase opacity-40 leading-none">SOOTHING DRAWING</p>
        </div>
      </div>

      {/* Symmetry Count */}
      <section className="space-y-1.5 shrink-0 w-[180px] md:w-auto">
        <div className="flex justify-between items-center text-[10px] md:text-xs">
          <label className={`font-bold tracking-tight ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>
            {t(lang, 'draw.symmetry')}
          </label>
          <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
            isDark 
              ? 'text-amber-400 bg-amber-950/40 border border-amber-900/40' 
              : 'text-amber-700 bg-amber-50 border border-amber-100'
          }`}>
            {settings.count} {t(lang, 'draw.axes')}
          </span>
        </div>
        <input 
          type="range"
          min="3"
          max="32"
          value={settings.count}
          onChange={(e) => setSettings(s => ({ ...s, count: parseInt(e.target.value) }))}
          className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none ${
            isDark ? 'bg-stone-800/70' : 'bg-stone-200'
          }`}
        />
      </section>

      {/* Brush Settings */}
      <section className="space-y-2.5 shrink-0 w-[240px] md:w-auto border-l md:border-l-0 md:pl-0 pl-3 border-stone-400/15">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] md:text-xs">
            <label className={`font-bold tracking-tight ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>{t(lang, 'draw.brushSize')}</label>
            <span className={`font-mono font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{settings.brushSize}px</span>
          </div>
          <input 
            type="range"
            min="1"
            max="50"
            value={settings.brushSize}
            onChange={(e) => setSettings(s => ({ ...s, brushSize: parseInt(e.target.value) }))}
            className={`w-full h-1 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none ${
              isDark ? 'bg-stone-800/70' : 'bg-stone-200'
            }`}
          />
        </div>

        <div className="space-y-1">
          <label className={`text-[10px] md:text-xs font-bold tracking-tight flex items-center gap-1.5 ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>
            <Palette size={11} className="text-amber-600" />
            {t(lang, 'draw.color')}
          </label>
          <div className="flex gap-1 overflow-x-auto py-0.5 max-w-[200px] md:max-w-none md:grid md:grid-cols-8 md:gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setSettings(s => ({ ...s, brushColor: c }))}
                className={`w-5 h-5 md:w-full aspect-square rounded-full transition-all hover:scale-110 active:scale-95 border shrink-0 ${
                  settings.brushColor === c 
                    ? 'border-amber-600 ring-1 ring-amber-500 shadow-sm' 
                    : isDark ? 'border-stone-800' : 'border-stone-200'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[10px] font-medium ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>{t(lang, 'draw.colorPicker')}</span>
            <input 
              type="color"
              value={settings.brushColor}
              onChange={(e) => setSettings(s => ({ ...s, brushColor: e.target.value }))}
              className={`w-5 h-4 bg-transparent border rounded cursor-pointer ${
                isDark ? 'border-stone-700' : 'border-stone-300'
              }`}
            />
          </div>
        </div>
      </section>

      {/* Dynamic Effects */}
      <section className="space-y-1 shrink-0 w-[160px] md:w-auto border-l md:border-l-0 md:pl-0 pl-3 border-stone-400/15">
        <label className={`text-[10px] md:text-xs font-bold tracking-tight flex items-center gap-1 ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>
          <Sparkles size={11} className="text-amber-500" />
          {t(lang, 'draw.evolution')}
        </label>
        <div className="grid grid-cols-2 gap-1 md:gap-1.5">
          {(['none', 'nested-zoom'] as const).map((mode) => {
            let label = t(lang, 'draw.static');
            let icon = <Grid2X2 size={11} />;
            if (mode === 'nested-zoom') {
              label = t(lang, 'draw.dynamic');
              icon = <Infinity size={11} />;
            }

            const active = settings.animation === mode;
            return (
              <button
                key={mode}
                onClick={() => setSettings(s => ({ ...s, animation: mode }))}
                className={`flex items-center justify-center gap-1 py-1 px-1.5 md:py-1.5 md:px-2 rounded-xl border text-[10px] md:text-xs font-bold transition-all shrink-0 ${
                  active 
                    ? isDark
                      ? 'bg-amber-950/45 text-amber-300 border-amber-700 font-semibold shadow-sm'
                      : 'bg-amber-50 text-amber-900 border-amber-200 font-semibold shadow-sm' 
                    : isDark
                      ? 'bg-stone-950/40 text-stone-400 border-stone-850 hover:bg-stone-800 hover:text-stone-200'
                      : 'bg-white text-stone-500 border-stone-200 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </section>

    </motion.div>
  );
};

export default Sidebar;
