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

interface FloatingToolbarProps {
  settings: MandalaSettings;
  setSettings: React.Dispatch<React.SetStateAction<MandalaSettings>>;
}

const FloatingToolbar: React.FC<FloatingToolbarProps> = ({ settings, setSettings }) => {
  const [isVisible, setIsVisible] = useState(true);

  const tools: { id: DrawingTool; icon: React.ReactNode; label: string }[] = [
    { id: 'brush', icon: <Pencil size={18} />, label: '画笔 (Brush)' },
    { id: 'line', icon: <Minus size={18} />, label: '直线 (Line)' },
    { id: 'curve', icon: <Wind size={18} />, label: '弧线 (Curve)' },
    { id: 'circle', icon: <Circle size={18} />, label: '圆形 (Circle)' },
    { id: 'ellipse', icon: <Orbit size={18} />, label: '椭圆 (Ellipse)' },
    { id: 'rect', icon: <Square size={18} />, label: '矩形 (Rectangle)' },
    { id: 'leaf', icon: <Pentagon size={18} />, label: '花叶 (Leaf)' },
    { id: 'star', icon: <Star size={18} />, label: '精细星芒 (Star)' },
    { id: 'moon', icon: <Moon size={18} />, label: '月晕 (Moon)' },
  ];

  if (!isVisible) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsVisible(true)}
        className="fixed top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-xl border border-stone-200 rounded-full flex items-center justify-center text-stone-700 hover:bg-stone-55 transition-all z-50 shadow-md"
      >
        <Pencil size={18} className="text-amber-700" />
      </motion.button>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 right-6 bg-white/95 backdrop-blur-2xl border border-stone-200/80 rounded-3xl p-3 shadow-md z-50 flex flex-col gap-2 min-w-[64px] text-stone-800"
    >
      <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-stone-100">
        <GripVertical size={13} className="text-stone-300 cursor-grab active:cursor-grabbing" />
        <button onClick={() => setIsVisible(false)} className="text-stone-400 hover:text-stone-800 transition-colors">
          <X size={13} />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setSettings(s => ({ ...s, tool: tool.id }))}
            title={tool.label}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
              settings.tool === tool.id 
              ? 'bg-amber-600 text-white shadow-sm' 
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
