/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  Moon, 
  Sparkles, 
  Grid2X2, 
  Infinity, 
  Volume2, 
  Music,
  Maximize2
} from 'lucide-react';
import MandalaCanvas from './components/MandalaCanvas';
import Sidebar from './components/Sidebar';
import FloatingToolbar from './components/FloatingToolbar';
import SleepPlayer from './components/SleepPlayer';
import SoundMixer from './components/SoundMixer';
import { MandalaSettings, SavedMandala, SavedTrack } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'canvas' | 'mixer'>('player');

  // Interactive Symmetrical Settings state for Canvas Editor
  const [settings, setSettings] = useState<MandalaSettings>({
    count: 12,
    brushColor: '#ffcc00',
    brushSize: 3,
    tool: 'brush',
    animation: 'none',
  });

  // State caches for saved elements synced between creators
  const [savedMandalas, setSavedMandalas] = useState<SavedMandala[]>([]);
  const [savedTracks, setSavedTracks] = useState<SavedTrack[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string>('track-default-resonance');

  // Drawing Canvas control commands registration slots
  const [clearFn, setClearFn] = useState<() => void>(() => () => {});
  const [undoFn, setUndoFn] = useState<() => void>(() => () => {});
  const [redoFn, setRedoFn] = useState<() => void>(() => () => {});
  const [saveFn, setSaveFn] = useState<() => void>(() => () => {});
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const registerClearFn = useCallback((fn: () => void) => {
    setClearFn(() => fn);
  }, []);

  const registerUndoFn = useCallback((fn: () => void) => {
    setUndoFn(() => fn);
  }, []);

  const registerRedoFn = useCallback((fn: () => void) => {
    setRedoFn(() => fn);
  }, []);

  const registerSaveFn = useCallback((fn: () => void) => {
    setSaveFn(() => fn);
  }, []);

  const handleHistoryChange = useCallback((undoAvailable: boolean, redoAvailable: boolean) => {
    setCanUndo(undoAvailable);
    setCanRedo(redoAvailable);
  }, []);

  const handleDownload = () => {
    const canvas = document.getElementById('mandala-master-canvas') as HTMLCanvasElement || document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `mandala-${Date.now()}.png`;
      const dataUrl = canvas.toDataURL();
      link.href = dataUrl;
      link.click();

      // Automatically register the exported diagram inside TAB1 list as requested!
      const exportName = `导出的曼陀罗 #${Date.now().toString().slice(-4)}`;
      setSavedMandalas(prev => [
        { id: `mandala-${Date.now()}`, name: exportName, dataUrl },
        ...prev
      ]);
    }
  };

  // Sync saved items to state cache
  const handleSaveMandala = (name: string, dataUrl: string) => {
    setSavedMandalas(prev => [
      { id: `mandala-${Date.now()}`, name, dataUrl },
      ...prev
    ]);
  };

  const handleAddTrack = (track: SavedTrack) => {
    setSavedTracks(prev => [track, ...prev]);
    setActiveTrackId(track.id); // set as currently active play target automatically
  };

  return (
    <div className="relative w-full h-screen bg-[#060302] overflow-hidden flex flex-col font-sans selection:bg-orange-500/35 text-white">
      
      {/* Dynamic Cosmic Space Backwards Blur Panel */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-40 blur-[130px]"
          style={{
            background: `
              radial-gradient(circle at 50% 20%, #301036 0%, transparent 60%),
              radial-gradient(circle at 10% 80%, #a23508 0%, transparent 40%),
              radial-gradient(circle at 90% 80%, #0d2856 0%, transparent 40%)
            `
          }}
        />
      </div>

      {/* Modern High-Aesthetics Navigation Bar Top Deck */}
      <header className="relative w-full z-40 bg-neutral-950/20 border-b border-white/5 backdrop-blur-md px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
            <Compass size={20} className="animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white leading-tight">Monaural Mandala (颂钵曼陀罗)</h1>
            <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase">Deep sleep & meditation space</p>
          </div>
        </div>

        {/* Tab Selection Row */}
        <nav className="flex bg-neutral-950/60 p-1 border border-white/5 rounded-2xl gap-1">
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'player'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
                : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Moon size={13} />
            <span>舒缓颂钵 (Sleep Player)</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'canvas'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
                : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Grid2X2 size={13} />
            <span>曼陀罗灵感 (Mandala Creator)</span>
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'mixer'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10'
                : 'text-white/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Volume2 size={13} />
            <span>催眠白噪音 (Sound Mixer)</span>
          </button>
        </nav>

        {/* Subtitle / Ambient indicator */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
          <span className="text-[10px] font-mono tracking-wider font-bold text-orange-450 uppercase">
            Audio Synthesis Active
          </span>
        </div>
      </header>

      {/* Main Workspace Frame container */}
      <div className="relative w-full flex-1 flex overflow-hidden z-10">
        
        {/* Symmetrical Canvas Settings sidebar - only active when drawing */}
        {activeTab === 'canvas' && (
          <Sidebar 
            settings={settings} 
            setSettings={setSettings} 
            onClear={clearFn} 
            onDownload={handleDownload}
            onSave={saveFn}
            onUndo={undoFn}
            onRedo={redoFn}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        )}

        {/* Floating Sector tools - only active when drawing */}
        {activeTab === 'canvas' && (
          <FloatingToolbar settings={settings} setSettings={setSettings} />
        )}

        <motion.main 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`flex-1 relative rounded-[32px] border border-white/5 bg-black/30 backdrop-blur-md shadow-2xl p-6 ${
            activeTab === 'canvas' 
              ? 'ml-[336px] m-6 h-[calc(100vh-130px)]' 
              : 'm-6 h-[calc(100vh-130px)] overflow-y-auto'
          }`}
        >
          {/* 1. Sleep Player View */}
          <motion.div
            key="player"
            animate={{ opacity: activeTab === 'player' ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full animate-gpu"
            style={{ 
              display: activeTab === 'player' ? 'block' : 'none',
              pointerEvents: activeTab === 'player' ? 'auto' : 'none'
            }}
          >
            <SleepPlayer 
              savedMandalas={savedMandalas}
              savedTracks={savedTracks}
              activeTrackId={activeTrackId}
              setActiveTrackId={setActiveTrackId}
              onNavigateToTab={setActiveTab}
            />
          </motion.div>

          {/* 2. Mandala Canvas View */}
          <motion.div
            key="canvas"
            animate={{ opacity: activeTab === 'canvas' ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full animate-gpu"
            style={{ 
              display: activeTab === 'canvas' ? 'block' : 'none',
              pointerEvents: activeTab === 'canvas' ? 'auto' : 'none'
            }}
          >
            <MandalaCanvas 
              settings={settings} 
              onClear={registerClearFn} 
              onUndo={registerUndoFn}
              onRedo={registerRedoFn}
              onSaveRegister={registerSaveFn}
              onHistoryChange={handleHistoryChange}
              onSaveToGallery={handleSaveMandala}
            />
          </motion.div>

          {/* 3. Sound Mixer View */}
          <motion.div
            key="mixer"
            animate={{ opacity: activeTab === 'mixer' ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full animate-gpu"
            style={{ 
              display: activeTab === 'mixer' ? 'block' : 'none',
              pointerEvents: activeTab === 'mixer' ? 'auto' : 'none'
            }}
          >
            <SoundMixer 
              savedTracks={savedTracks}
              onAddTrack={handleAddTrack}
              onNavigateToTab={setActiveTab}
            />
          </motion.div>
        </motion.main>

      </div>
      
    </div>
  );
}
