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
  Copy
} from 'lucide-react';
import { MandalaSettings } from '../types';

interface SidebarProps {
  settings: MandalaSettings;
  setSettings: React.Dispatch<React.SetStateAction<MandalaSettings>>;
  onClear: () => void;
  onDownload: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ settings, setSettings, onClear, onDownload }) => {
  const colors = [
    '#ffffff', '#ff4e00', '#00ffcc', '#ffcc00', '#ff00ff', '#0099ff', '#99ff00', '#ff6666'
  ];

  return (
    <motion.div 
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="fixed left-6 top-6 bottom-6 w-80 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl z-50 flex flex-col gap-8 overflow-y-auto"
    >
      <div className="flex items-center gap-3 mb-2">
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
      <section className="space-y-6">
        <div className="space-y-4">
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

        <div className="space-y-4">
          <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest flex items-center gap-2">
            <Palette size={12} />
            Colors
          </label>
          <div className="grid grid-cols-4 gap-3">
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

      {/* Actions */}
      <div className="mt-auto pt-6 flex gap-3">
        <button
          onClick={onClear}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-2xl transition-all font-medium border border-red-500/20"
        >
          <Trash2 size={18} />
          Clear
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all font-medium border border-white/10"
        >
          <Download size={18} />
          Export
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
