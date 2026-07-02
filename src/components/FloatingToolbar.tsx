import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Pencil, 
  Minus, 
  Orbit, 
  Circle, 
  Pentagon, 
  Star, 
  Moon, 
  Square,
  Zap,
  GripVertical,
  X,
  Wind
} from 'lucide-react';
import { MandalaSettings, DrawingTool } from '../types';
import { Lang, t } from '../utils/i18n';

interface FloatingToolbarProps {
  settings: MandalaSettings;
  setSettings: React.Dispatch<React.SetStateAction<MandalaSettings>>;
  isDark?: boolean;
  lang?: Lang;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ settings, setSettings, isDark = false, lang = 'en' as Lang }) => {
  const [isVisible, setIsVisible] = useState(true);

  const tools: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { id: 'brush', icon: <Pencil size={14} />, label: t(lang, 'tool.brush') },
    { id: 'line', icon: <Minus size={14} />, label: t(lang, 'tool.line') },
    { id: 'curve', icon: <Wind size={14} />, label: t(lang, 'tool.curve') },
    { id: 'circle', icon: <Circle size={14} />, label: t(lang, 'tool.circle') },
    { id: 'ellipse', icon: <Orbit size={14} />, label: t(lang, 'tool.ellipse') },
    { id: 'rect', icon: <Square size={14} />, label: t(lang, 'tool.rect') },
    { id: 'leaf', icon: <Pentagon size={14} />, label: t(lang, 'tool.leaf') },
    { id: 'star', icon: <Star size={14} />, label: t(lang, 'tool.star') },
    { id: 'moon', icon: <Moon size={14} />, label: t(lang, 'tool.moon') },
  ];

  if (!isVisible) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsVisible(true)}
        className={`absolute top-4 right-4 w-9 h-9 border rounded-full flex items-center justify-center transition-all z-30 shadow-md ${
          isDark 
            ? 'bg-stone-900/90 border-stone-800 text-amber-500 hover:bg-stone-800' 
            : 'bg-white/90 border-stone-200 text-amber-700 hover:bg-stone-50'
        }`}
      >
        <Pencil size={14} className="text-amber-500" />
      </motion.button>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`absolute top-4 right-4 border rounded-2xl p-2 shadow-lg z-30 flex flex-col gap-1.5 min-w-[48px] select-none transition-colors duration-300 ${
        isDark 
          ? 'bg-stone-900/95 backdrop-blur-md border-stone-800 text-stone-100' 
          : 'bg-white/95 backdrop-blur-md border-stone-200/80 text-stone-805'
      }`}
    >
      <div className={`flex items-center justify-between px-1.5 pb-1 border-b ${
        isDark ? 'border-stone-800' : 'border-stone-100'
      }`}>
        <GripVertical size={11} className={`${isDark ? 'text-stone-700' : 'text-stone-300'} cursor-grab active:cursor-grabbing`} />
        <button onClick={() => setIsVisible(false)} className="text-stone-400 hover:text-amber-500 transition-colors">
          <X size={11} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSettings(s => ({ ...s, tool: tool.id }))}
            title={tool.label}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
              settings.tool === tool.id 
              ? 'bg-amber-600 text-white shadow-sm font-semibold' 
              : isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
            }`}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default FloatingToolbar;
