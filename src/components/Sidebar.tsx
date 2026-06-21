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
  isDark = false
}) => {
  const colors = [
    '#4A4A4A', '#C5A880', '#8E9F8E', '#D29C8B', '#A19CBE', '#A1C4D1', '#EAD5A0', '#B26262'
  ];

  return (
    <motion.div 
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`w-full md:w-64 shrink-0 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto select-none border transition-all duration-300 ${
        isDark 
          ? 'bg-stone-900/40 border-stone-800/80 text-stone-100 shadow-inner' 
          : 'bg-stone-50/80 border-stone-200/50 text-stone-850 shadow-inner'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
          isDark 
            ? 'bg-amber-950/30 border-amber-800 text-amber-400' 
            : 'bg-amber-50 border-amber-200 text-amber-700'
        }`}>
          <CircleDot size={16} className="text-amber-500 animate-spin-slow" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight">曼陀罗创作</h1>
          <p className={`text-[10px] font-bold tracking-wider uppercase opacity-40`}>SOOTHING DRAWING</p>
        </div>
      </div>

      {/* Symmetry Count */}
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <label className={`text-xs font-bold tracking-tight ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>
            对称轴数量
          </label>
          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
            isDark 
              ? 'text-amber-400 bg-amber-950/40 border border-amber-900/40' 
              : 'text-amber-700 bg-amber-50 border border-amber-100'
          }`}>
            {settings.count} 外轴
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
      <section className="space-y-3.5">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className={`text-xs font-bold tracking-tight ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>画笔粗细</label>
            <span className={`text-xs font-mono font-semibold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>{settings.brushSize}px</span>
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

        <div className="space-y-1.5">
          <label className={`text-xs font-bold tracking-tight flex items-center gap-1.5 ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>
            <Palette size={11} className="text-amber-600" />
            舒缓色调/画笔颜色
          </label>
          <div className="grid grid-cols-8 gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setSettings(s => ({ ...s, brushColor: c }))}
                className={`w-full aspect-square rounded-full transition-all hover:scale-110 active:scale-95 border ${
                  settings.brushColor === c 
                    ? 'border-amber-600 ring-1 ring-amber-500 shadow-sm' 
                    : isDark ? 'border-stone-800' : 'border-stone-200'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-xs font-medium ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>高级调色盘:</span>
            <input 
              type="color"
              value={settings.brushColor}
              onChange={(e) => setSettings(s => ({ ...s, brushColor: e.target.value }))}
              className={`w-7 h-4 bg-transparent border rounded cursor-pointer ${
                isDark ? 'border-stone-700' : 'border-stone-300'
              }`}
            />
          </div>
        </div>
      </section>

      {/* Dynamic Effects */}
      <section className="space-y-1.5">
        <label className={`text-xs font-bold tracking-tight flex items-center gap-1 ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>
          <Sparkles size={11} className="text-amber-500" />
          动态演化模式
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['none', 'nested-zoom'] as const).map((mode) => {
            let label = '静态画卷';
            let icon = <Grid2X2 size={11} />;
            if (mode === 'nested-zoom') {
              label = '动态效果';
              icon = <Infinity size={11} />;
            }

            const active = settings.animation === mode;
            return (
              <button
                key={mode}
                onClick={() => setSettings(s => ({ ...s, animation: mode }))}
                className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border text-xs font-bold transition-all ${
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

      {/* History Controls */}
      <section className="space-y-1.5">
        <label className={`text-xs font-bold tracking-tight ${isDark ? 'text-stone-400' : 'text-stone-550'}`}>
          编辑选项
        </label>
        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              canUndo 
                ? isDark
                  ? 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200' 
                : isDark
                  ? 'opacity-25 bg-stone-900 text-stone-600 border-stone-850 cursor-not-allowed'
                  : 'opacity-30 bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
            }`}
          >
            <Undo2 size={11} />
            <span>撤销</span>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              canRedo 
                ? isDark
                  ? 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700'
                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200' 
                : isDark
                  ? 'opacity-25 bg-stone-900 text-stone-600 border-stone-850 cursor-not-allowed'
                  : 'opacity-30 bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
            }`}
          >
            <Redo2 size={11} />
            <span>重做</span>
          </button>

          <button
            onClick={onClear}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg transition-all text-xs font-bold border ${
              isDark 
                ? 'bg-rose-950/30 hover:bg-rose-900/40 text-rose-300 border-rose-900/50' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-150'
            }`}
          >
            <RefreshCw size={11} />
            <span>清空</span>
          </button>
        </div>
      </section>

      {/* Actions */}
      <div className={`mt-auto pt-3 flex gap-2 border-t ${
        isDark ? 'border-stone-800' : 'border-stone-200/60'
      }`}>
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-600 hover:bg-amber-700 border border-amber-500 text-white rounded-xl transition-all font-bold text-xs shadow-sm active:scale-95"
        >
          <FolderHeart size={12} />
          <span>保存画作</span>
        </button>
        <button
          onClick={onDownload}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl transition-all font-bold text-xs border active:scale-95 ${
            isDark
              ? 'bg-stone-800 hover:bg-stone-750 text-stone-200 border-stone-700'
              : 'bg-white hover:bg-stone-100 text-stone-805 border-stone-200'
          }`}
        >
          <Download size={12} />
          <span>导出画作</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
