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
  canRedo
}) => {
  const colors = [
    '#4A4A4A', '#C5A880', '#8E9F8E', '#D29C8B', '#A19CBE', '#A1C4D1', '#EAD5A0', '#B26262'
  ];

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-6 bottom-6 w-80 bg-white/95 backdrop-blur-xl border border-stone-200/60 rounded-3xl p-6 shadow-md z-50 flex flex-col gap-6 overflow-y-auto text-stone-800"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200 text-amber-700 shadow-sm shadow-amber-500/5">
          <CircleDot size={22} className="text-amber-600" />
        </div>
        <div>
          <h1 className="text-base font-bold text-stone-800 tracking-tight">曼陀罗创想</h1>
          <p className="text-[10px] text-stone-400 font-semibold tracking-wider uppercase">SOOTHING DRAWING</p>
        </div>
      </div>

      {/* Symmetry Count */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold text-stone-500">
            对称轴数量
          </label>
          <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-100">
            {settings.count}
          </span>
        </div>
        <input 
          type="range"
          min="3"
          max="32"
          value={settings.count}
          onChange={(e) => setSettings(s => ({ ...s, count: parseInt(e.target.value) }))}
          className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
        />
      </section>

      {/* Brush Settings */}
      <section className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-stone-500">画笔粗细</label>
            <span className="text-xs font-mono text-stone-600 font-semibold">{settings.brushSize}px</span>
          </div>
          <input 
            type="range"
            min="1"
            max="50"
            value={settings.brushSize}
            onChange={(e) => setSettings(s => ({ ...s, brushSize: parseInt(e.target.value) }))}
            className="w-full h-1 bg-stone-100 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-stone-500 flex items-center gap-2">
            <Palette size={13} className="text-stone-450" />
            舒缓色调 Palette
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setSettings(s => ({ ...s, brushColor: c }))}
                className={`w-full aspect-square rounded-full transition-all hover:scale-105 active:scale-95 border-2 ${
                  settings.brushColor === c ? 'border-amber-600 scale-105 shadow-sm' : 'border-stone-100'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-stone-400">其他颜色选择:</span>
            <input 
              type="color"
              value={settings.brushColor}
              onChange={(e) => setSettings(s => ({ ...s, brushColor: e.target.value }))}
              className="w-8 h-6 bg-transparent border border-stone-200 rounded cursor-pointer"
            />
          </div>
        </div>
      </section>

      {/* Dynamic Effects */}
      <section className="space-y-2">
        <label className="text-xs font-semibold text-stone-500 flex items-center gap-2">
          <Sparkles size={13} className="text-amber-600" />
          动态演化模式
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['none', 'nested-zoom'] as const).map((mode) => {
            let label = '静态画卷';
            let icon = <Grid2X2 size={14} />;
            if (mode === 'nested-zoom') {
              label = '嵌套推进';
              icon = <Infinity size={14} />;
            }

            const active = settings.animation === mode;
            return (
              <button
                key={mode}
                onClick={() => setSettings(s => ({ ...s, animation: mode }))}
                className={`flex flex-col items-center justify-center gap-1.5 py-2 rounded-2xl border text-xs font-medium transition-all ${
                  active 
                    ? 'bg-amber-50 text-amber-900 border-amber-300 font-semibold shadow-sm' 
                    : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                {icon}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* History Controls / Undo, Redo, Restart placed together */}
      <section className="space-y-2">
        <label className="text-xs font-semibold text-stone-500">
          编辑选项
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[11px] font-semibold transition-all ${
              canUndo 
                ? 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200' 
                : 'opacity-40 bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
            }`}
          >
            <Undo2 size={13} />
            <span>撤销</span>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex flex-col items-center justify-center gap-1 py-2 rounded-xl border text-[11px] font-semibold transition-all ${
              canRedo 
                ? 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200' 
                : 'opacity-40 bg-stone-50 text-stone-300 border-stone-100 cursor-not-allowed'
            }`}
          >
            <Redo2 size={13} />
            <span>重做</span>
          </button>

          <button
            onClick={onClear}
            className="flex flex-col items-center justify-center gap-1 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl transition-all text-[11px] font-semibold border border-rose-150"
          >
            <RefreshCw size={13} />
            <span>清空</span>
          </button>
        </div>
      </section>

      {/* Actions (Save and Export PNG) */}
      <div className="mt-auto pt-4 flex gap-3 border-t border-stone-200/60">
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-amber-600 hover:bg-amber-700 border border-amber-500 text-white rounded-2xl transition-all font-semibold text-xs shadow-sm active:scale-95"
        >
          <FolderHeart size={14} />
          <span>保存画作</span>
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-2xl transition-all font-semibold text-xs border border-stone-200 active:scale-95"
        >
          <Download size={14} />
          <span>导出画作</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
