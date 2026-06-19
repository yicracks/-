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
    '#ffffff', '#ff4e00', '#00ffcc', '#ffcc00', '#ff00ff', '#0099ff', '#99ff00', '#ff6666'
  ];

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-6 bottom-6 w-80 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl z-50 flex flex-col gap-6 overflow-y-auto"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400">
          <CircleDot size={24} />
        </div>
        <div>
          <h1 className="text-xl font-medium text-white tracking-tight">Mandala Gen</h1>
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Creator Pro</p>
        </div>
      </div>

      {/* Symmetry Count */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
            Sectors
          </label>
          <span className="text-xs font-mono text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">
            {settings.count}
          </span>
        </div>
        <input 
          type="range"
          min="3"
          max="32"
          value={settings.count}
          onChange={(e) => setSettings(s => ({ ...s, count: parseInt(e.target.value) }))}
          className="w-full accent-orange-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
        />
      </section>

      {/* Brush Settings */}
      <section className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Brush Size</label>
            <span className="text-xs font-mono text-white/60">{settings.brushSize}px</span>
          </div>
          <input 
            type="range"
            min="1"
            max="50"
            value={settings.brushSize}
            onChange={(e) => setSettings(s => ({ ...s, brushSize: parseInt(e.target.value) }))}
            className="w-full accent-white h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
            <Palette size={12} />
            Colors
          </label>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setSettings(s => ({ ...s, brushColor: c }))}
                className={`w-full aspect-square rounded-full transition-transform hover:scale-110 active:scale-95 border-2 ${
                  settings.brushColor === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input 
            type="color"
            value={settings.brushColor}
            onChange={(e) => setSettings(s => ({ ...s, brushColor: e.target.value }))}
            className="w-full h-8 bg-transparent border-none cursor-pointer"
          />
        </div>
      </section>

      {/* Dynamic Effects */}
      <section className="space-y-3">
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block flex items-center gap-2">
          <Sparkles size={12} className="text-orange-400" />
          Dynamic Effects (动态效果)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['none', 'nested-zoom'] as const).map((mode) => {
            let label = 'Static (静态)';
            let icon = <Grid2X2 size={16} />;
            if (mode === 'nested-zoom') {
              label = 'Tunnel (嵌套缩放)';
              icon = <Infinity size={16} />;
            }

            const active = settings.animation === mode;
            return (
              <button
                key={mode}
                onClick={() => setSettings(s => ({ ...s, animation: mode }))}
                className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-2xl border text-[11px] font-medium transition-all ${
                  active 
                    ? 'bg-orange-500 text-white border-orange-400 font-semibold shadow-lg shadow-orange-500/20' 
                    : 'bg-white/5 text-white/40 border-white/5 hover:bg-white/10 hover:text-white'
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
      <section className="space-y-3">
        <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest block">
          Controls (撤销、重做与重置)
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl border text-[10px] sm:text-xs font-semibold transition-all ${
              canUndo 
                ? 'bg-white/10 hover:bg-white/15 text-white border-white/15' 
                : 'opacity-35 bg-neutral-800/20 text-white/20 border-white/5 cursor-not-allowed'
            }`}
          >
            <Undo2 size={13} />
            <span>撤销 (Undo)</span>
          </button>
          
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl border text-[10px] sm:text-xs font-semibold transition-all ${
              canRedo 
                ? 'bg-white/10 hover:bg-white/15 text-white border-white/15' 
                : 'opacity-35 bg-neutral-800/20 text-white/20 border-white/5 cursor-not-allowed'
            }`}
          >
            <Redo2 size={13} />
            <span>重做 (Redo)</span>
          </button>

          <button
            onClick={onClear}
            className="flex flex-col items-center justify-center gap-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all text-[10px] sm:text-xs font-semibold border border-red-500/20"
          >
            <RefreshCw size={13} />
            <span>充零 (Restart)</span>
          </button>
        </div>
      </section>

      {/* Actions (Save and Export PNG) */}
      <div className="mt-auto pt-6 flex gap-3 border-t border-white/5">
        <button
          onClick={onSave}
          className="flex-1 flex items-center justify-center gap-1.5 py-4 bg-orange-500 hover:bg-orange-600 border border-orange-400 text-white rounded-2xl transition-all font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95"
        >
          <FolderHeart size={16} />
          <span>保存 (Save)</span>
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-1.5 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all font-semibold text-xs border border-white/10 active:scale-95"
        >
          <Download size={16} />
          <span>导出 (Export)</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
