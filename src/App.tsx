/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import MandalaCanvas from './components/MandalaCanvas';
import Sidebar from './components/Sidebar';
import FloatingToolbar from './components/FloatingToolbar';
import { MandalaSettings } from './types';

export default function App() {
  const [settings, setSettings] = useState<MandalaSettings>({
    count: 12,
    brushColor: '#ffffff',
    brushSize: 3,
    tool: 'brush',
  });

  const [clearFn, setClearFn] = useState<() => void>(() => () => {});

  const registerClearFn = useCallback((fn: () => void) => {
    setClearFn(() => fn);
  }, []);

  const handleDownload = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `mandala-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0a0502] overflow-hidden flex font-sans selection:bg-orange-500/30">
      {/* Immersive Atmospheric Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40 blur-[100px]"
          style={{
            background: `
              radial-gradient(circle at 50% 50%, #3a1510 0%, transparent 60%),
              radial-gradient(circle at 10% 80%, #ff4e00 0%, transparent 40%),
              radial-gradient(circle at 90% 20%, #0099ff 0%, transparent 40%)
            `
          }}
        />
      </div>

      <Sidebar 
        settings={settings} 
        setSettings={setSettings} 
        onClear={clearFn} 
        onDownload={handleDownload}
      />

      <FloatingToolbar settings={settings} setSettings={setSettings} />

      <motion.main 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 ml-[340px] m-6 relative rounded-[40px] border border-white/5 overflow-hidden bg-black/40 backdrop-blur-sm shadow-2xl"
      >
        <MandalaCanvas 
          settings={settings} 
          onClear={registerClearFn} 
        />
        
        {/* Floating Tooltip */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white/40 text-xs font-medium tracking-wider uppercase flex items-center gap-4 pointer-events-none">
          <span className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Vivid Mandala Creator
          </span>
          <div className="w-px h-3 bg-white/10" />
          <span>Press & Drag to Create</span>
        </div>
      </motion.main>
    </div>
  );
}
