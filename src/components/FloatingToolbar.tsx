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
    { id: 'brush', icon: <Pencil size={18} />, label: 'Brush' },
    { id: 'line', icon: <Minus size={18} />, label: 'Line' },
    { id: 'curve', icon: <Wind size={18} />, label: 'Curve' },
    { id: 'circle', icon: <Circle size={18} />, label: 'Circle' },
    { id: 'ellipse', icon: <Orbit size={18} />, label: 'Ellipse' },
    { id: 'rect', icon: <Square size={18} />, label: 'Rectangle' },
    { id: 'leaf', icon: <Pentagon size={18} />, label: 'Leaf' },
    { id: 'star', icon: <Star size={18} />, label: 'Star' },
    { id: 'moon', icon: <Moon size={18} />, label: 'Moon' },
  ];

  if (!isVisible) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={() => setIsVisible(true)}
        className="fixed top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-50 shadow-xl"
      >
        <Pencil size={20} />
      </motion.button>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 right-6 bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl z-50 flex flex-col gap-2 min-w-[64px]"
    >
      <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-white/5">
        <GripVertical size={14} className="text-white/20 cursor-grab active:cursor-grabbing" />
        <button onClick={() => setIsVisible(false)} className="text-white/20 hover:text-white transition-colors">
          <X size={14} />
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
              ? 'bg-orange-500 text-white' 
              : 'text-white/40 hover:text-white hover:bg-white/5'
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
