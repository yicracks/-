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
  Maximize2,
  Sun,
  Eye,
  Palette,
  Settings,
  Mail,
  User,
  X,
  Info
} from 'lucide-react';
import MandalaCanvas from './components/MandalaCanvas';
import Sidebar from './components/Sidebar';
import FloatingToolbar from './components/FloatingToolbar';
import SleepPlayer from './components/SleepPlayer';
import SoundMixer from './components/SoundMixer';
import MyCreations from './components/MyCreations';
import { MandalaSettings, SavedMandala, SavedTrack } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'player' | 'canvas' | 'mixer' | 'creations'>('player');
  const [themeMode, setThemeMode] = useState<'day' | 'night' | 'eye' | 'custom'>('day');
  const [customBgColor, setCustomBgColor] = useState<string>('#9AB8A2'); // elegant sage green / pastel custom initial
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsSubTab, setSettingsSubTab] = useState<'appearance' | 'about'>('appearance');
  const [fadeEnabled, setFadeEnabled] = useState<boolean>(true);
  const [selectedMandalaId, setSelectedMandalaId] = useState<string>('default');

  const isDark = themeMode === 'night';

  const getBgColor = () => {
    switch (themeMode) {
      case 'day': return '#FAF6F0';
      case 'eye': return '#EBF2EB';
      case 'night': return '#12100E';
      case 'custom': return customBgColor;
    }
  };

  const getAmbientHighlights = () => {
    switch (themeMode) {
      case 'day':
        return `
          radial-gradient(circle at 50% -10%, #FFEFD5 0%, transparent 60%),
          radial-gradient(circle at 10% 80%, #FFF5EE 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, #F5F5DC 0%, transparent 40%)
        `;
      case 'eye':
        return `
          radial-gradient(circle at 50% -10%, #D8ECD9 0%, transparent 60%),
          radial-gradient(circle at 10% 80%, #E8F5E9 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, #E0ECE1 0%, transparent 40%)
        `;
      case 'night':
        return `
          radial-gradient(circle at 50% -10%, #302621 0%, transparent 60%),
          radial-gradient(circle at 10% 80%, #111D18 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, #151A30 0%, transparent 40%)
        `;
      case 'custom':
      default:
        return `
          radial-gradient(circle at 50% -10%, rgba(255,255,255,0.4) 0%, transparent 60%),
          radial-gradient(circle at 10% 80%, rgba(255,255,255,0.2) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(0,0,0,0.05) 0%, transparent 40%)
        `;
    }
  };

  // Interactive Symmetrical Settings state for Canvas Editor
  const [settings, setSettings] = useState<MandalaSettings>({
    count: 12,
    brushColor: '#C5A880',
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
    setActiveTrackId(track.id);
  };

  const handleDeleteMandala = (id: string) => {
    setSavedMandalas(prev => prev.filter(m => m.id !== id));
    if (selectedMandalaId === id) {
      setSelectedMandalaId('default');
    }
  };

  const handleDeleteTrack = (id: string) => {
    setSavedTracks(prev => prev.filter(t => t.id !== id));
    if (activeTrackId === id) {
      setActiveTrackId('track-default-resonance');
    }
  };

  return (
    <div 
      style={{ backgroundColor: getBgColor() }}
      className={`relative w-full h-screen overflow-hidden flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 transition-colors duration-300 ${
        isDark ? 'text-stone-200' : 'text-stone-800'
      }`}
    >
      
      {/* Soft Cozy Candlelight Ambient Highlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute inset-0 opacity-70 blur-[130px]"
          style={{
            background: getAmbientHighlights()
          }}
        />
      </div>

      {/* Modern High-Aesthetics Pristine Navigation Bar */}
      <header className={`relative w-full z-40 backdrop-blur-md px-6 lg:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 border-b ${
        isDark 
          ? 'bg-stone-900/80 border-stone-805 text-stone-100' 
          : 'bg-white/70 border-stone-200/60 text-stone-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-250 text-amber-700 shadow-sm shadow-amber-500/5">
            <Compass size={18} className="animate-spin-slow text-amber-600" />
          </div>
          <div>
            <h1 className={`text-sm font-bold tracking-tight leading-tight transition-colors ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>曼陀罗催眠</h1>
          </div>
        </div>

        {/* Tab Selection Row - Renamed strictly according to request */}
        <nav className={`flex p-1 border rounded-2xl gap-1 shadow-sm transition-colors ${
          isDark 
            ? 'bg-stone-950/80 border-stone-800' 
            : 'bg-stone-100/80 border-stone-250/20'
        }`}>
          <button
            onClick={() => setActiveTab('player')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'player'
                ? isDark
                  ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                  : 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Moon size={13} className={activeTab === 'player' ? 'text-amber-600' : isDark ? 'text-stone-500' : 'text-stone-400'} />
            <span>催眠播放器</span>
          </button>

          <button
            onClick={() => setActiveTab('canvas')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'canvas'
                ? isDark
                  ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                  : 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Grid2X2 size={13} className={activeTab === 'canvas' ? 'text-amber-600' : isDark ? 'text-stone-500' : 'text-stone-400'} />
            <span>曼陀罗画制作</span>
          </button>

          <button
            onClick={() => setActiveTab('mixer')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'mixer'
                ? isDark
                  ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                  : 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : isDark
                  ? 'text-stone-405 hover:text-stone-200'
                  : 'text-stone-505 hover:text-stone-800'
            }`}
          >
            <Volume2 size={13} className={activeTab === 'mixer' ? 'text-amber-600' : isDark ? 'text-stone-500' : 'text-stone-400'} />
            <span>催眠混音制作</span>
          </button>

          <button
            onClick={() => setActiveTab('creations')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'creations'
                ? isDark
                  ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700'
                  : 'bg-white text-stone-900 shadow-sm border border-stone-200'
                : isDark
                  ? 'text-stone-400 hover:text-stone-200'
                  : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Sparkles size={13} className={activeTab === 'creations' ? 'text-amber-600' : isDark ? 'text-stone-500' : 'text-stone-400'} />
            <span>我的作品</span>
          </button>
        </nav>

        {/* Dynamic theme adaptive switcher control Settings Gear button */}
        <div className="flex items-center">
          <button
            onClick={() => {
              setSettingsSubTab('appearance');
              setShowSettingsModal(true);
            }}
            title="高级设置"
            type="button"
            className={`px-4 py-2 rounded-2xl border flex items-center justify-center gap-1.5 transition-all text-xs font-semibold shadow-sm active:scale-95 hover:border-amber-500 ${
              isDark 
                ? 'bg-stone-900 border-stone-805 text-stone-300 hover:text-amber-400 hover:bg-stone-850' 
                : 'bg-stone-50 border-stone-250/50 text-stone-650 hover:text-amber-700 hover:bg-stone-100'
            }`}
          >
            <Settings size={14} className="animate-spin-slow text-amber-600" />
            <span>设置</span>
          </button>
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
          className={`flex-1 relative rounded-[32px] border backdrop-blur-lg shadow-md p-6 transition-all duration-300 ${
            isDark 
              ? 'border-stone-850/80 bg-stone-900/35 text-stone-100 shadow-stone-950/20' 
              : 'border-stone-200/50 bg-white/40 text-stone-800 shadow-stone-200/10'
          } ${
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
              selectedMandalaId={selectedMandalaId}
              setSelectedMandalaId={setSelectedMandalaId}
              onNavigateToTab={setActiveTab}
              isDark={isDark}
              fadeEnabled={fadeEnabled}
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
              isDark={isDark}
            />
          </motion.div>

          {/* 4. My Creations View */}
          <motion.div
            key="creations"
            animate={{ opacity: activeTab === 'creations' ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full animate-gpu"
            style={{ 
              display: activeTab === 'creations' ? 'block' : 'none',
              pointerEvents: activeTab === 'creations' ? 'auto' : 'none'
            }}
          >
            <MyCreations 
              savedMandalas={savedMandalas}
              savedTracks={savedTracks}
              onDeleteMandala={handleDeleteMandala}
              onDeleteTrack={handleDeleteTrack}
              selectedMandalaId={selectedMandalaId}
              setSelectedMandalaId={setSelectedMandalaId}
              activeTrackId={activeTrackId}
              setActiveTrackId={setActiveTrackId}
              isDark={isDark}
              onNavigateToTab={setActiveTab}
            />
          </motion.div>
        </motion.main>

      </div>
      
      {/* Settings Dialog Overlay */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettingsModal(false)}
              className="absolute inset-0 bg-stone-950/50 backdrop-blur-sm shadow-xl"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`relative w-full max-w-md rounded-[28px] border shadow-2xl overflow-hidden z-10 flex flex-col transition-colors duration-300 ${
                isDark 
                  ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-stone-950/40' 
                  : 'bg-white border-stone-205 text-stone-800 shadow-stone-200/20'
              }`}
            >
              {/* Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'border-stone-850' : 'border-stone-100'
              }`}>
                <div className="flex items-center gap-2">
                  <Settings size={15} className="text-amber-600 animate-spin-slow" />
                  <span className="text-xs font-bold tracking-tight">高级设置 & 关于</span>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className={`p-1.5 rounded-xl transition-colors ${
                    isDark ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-100' : 'hover:bg-stone-100 text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Segment Tab Controls */}
              <div className={`flex p-1 border-b transition-colors ${
                isDark ? 'bg-stone-950/40 border-stone-850' : 'bg-stone-50/50 border-stone-100'
              }`}>
                <button
                  onClick={() => setSettingsSubTab('appearance')}
                  className={`flex-1 py-2 px-4 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    settingsSubTab === 'appearance'
                      ? isDark 
                        ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60' 
                        : 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                      : isDark
                        ? 'text-stone-500 hover:text-stone-300'
                        : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Palette size={13} className="text-amber-600" />
                  <span>外观 (Appearance)</span>
                </button>

                <button
                  onClick={() => setSettingsSubTab('about')}
                  className={`flex-1 py-2 px-4 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 ${
                    settingsSubTab === 'about'
                      ? isDark 
                        ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60' 
                        : 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                      : isDark
                        ? 'text-stone-500 hover:text-stone-300'
                        : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <Info size={13} className="text-amber-600" />
                  <span>关于 (About)</span>
                </button>
              </div>

              {/* Tab Panel Body */}
              <div className="p-6 overflow-y-auto max-h-[55vh]">
                
                {/* 1. APPEARANCE TAB PANEL */}
                {settingsSubTab === 'appearance' && (
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <h3 className={`text-xs font-bold leading-none ${isDark ? 'text-stone-300' : 'text-stone-750'}`}>系统主题背景色</h3>
                      <p className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>选择最适合您当前伴眠环境的背景颜色。</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Day Mode */}
                      <button
                        onClick={() => setThemeMode('day')}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 relative ${
                          themeMode === 'day'
                            ? 'border-amber-500 bg-amber-500/5'
                            : isDark
                              ? 'border-stone-800 bg-stone-950/20 hover:border-stone-700'
                              : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold">白天</span>
                          <div className="w-5 h-5 rounded-full bg-[#FAF6F0] border shadow-inner" />
                        </div>
                        <span className={`text-[9px] ${themeMode === 'day' ? 'text-amber-700 font-semibold' : 'text-stone-450'}`}>温馨沙白</span>
                      </button>

                      {/* Night Mode */}
                      <button
                        onClick={() => setThemeMode('night')}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 relative ${
                          themeMode === 'night'
                            ? 'border-amber-500 bg-amber-500/5'
                            : isDark
                              ? 'border-stone-800 bg-stone-950/20 hover:border-stone-700'
                              : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold">黑夜</span>
                          <div className="w-5 h-5 rounded-full bg-[#12100E] border border-stone-850 shadow-inner" />
                        </div>
                        <span className={`text-[9px] ${themeMode === 'night' ? 'text-amber-400 font-semibold' : 'text-stone-450'}`}>静谧灰黑</span>
                      </button>

                      {/* Eye Mode */}
                      <button
                        onClick={() => setThemeMode('eye')}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 relative ${
                          themeMode === 'eye'
                            ? 'border-amber-500 bg-amber-500/5'
                            : isDark
                              ? 'border-stone-800 bg-stone-950/20 hover:border-stone-700'
                              : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold">护眼</span>
                          <div className="w-5 h-5 rounded-full bg-[#EBF2EB] border border-emerald-250/20 shadow-inner" />
                        </div>
                        <span className={`text-[9px] ${themeMode === 'eye' ? 'text-emerald-700 font-semibold' : 'text-stone-450'}`}>莫兰浅绿</span>
                      </button>

                      {/* Custom Mode */}
                      <button
                        onClick={() => setThemeMode('custom')}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 relative ${
                          themeMode === 'custom'
                            ? 'border-amber-500 bg-amber-500/5'
                            : isDark
                              ? 'border-stone-800 bg-stone-950/20 hover:border-stone-700'
                              : 'border-stone-200 bg-stone-50 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-bold">自定义</span>
                          <div 
                            className="w-5 h-5 rounded-full border shadow-inner animate-pulse animate-duration-1000"
                            style={{ backgroundColor: customBgColor }}
                          />
                        </div>
                        <span className={`text-[9px] ${themeMode === 'custom' ? 'text-amber-700 font-semibold' : 'text-stone-455'}`}>自定调配</span>
                      </button>
                    </div>

                    {/* Color Input Controls for Custom */}
                    {themeMode === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-colors ${
                          isDark ? 'bg-stone-950/50 border-stone-850' : 'bg-stone-50 border-stone-100'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={customBgColor}
                            onChange={(e) => {
                              setCustomBgColor(e.target.value);
                              setThemeMode('custom');
                            }}
                            className="w-7 h-7 p-0 border-0 rounded-lg cursor-pointer outline-none bg-transparent"
                          />
                          <div>
                            <span className="text-[10px] font-bold block leading-tight">选色盘</span>
                            <span className={`text-[8px] font-mono leading-none ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>{customBgColor.toUpperCase()}</span>
                          </div>
                        </div>

                        <input 
                          type="text"
                          value={customBgColor}
                          onChange={(e) => {
                            setCustomBgColor(e.target.value);
                            setThemeMode('custom');
                          }}
                          className={`w-20 text-[9px] font-mono font-bold rounded-lg px-2 text-center py-1.5 outline-none transition-colors border ${
                            isDark ? 'bg-stone-900 border-stone-805 text-stone-300' : 'bg-white border-stone-200 text-stone-700'
                          }`}
                        />
                      </motion.div>
                    )}

                    {/* Sleep Timer volume fade-out functional switch */}
                    <div className={`pt-4 border-t transition-colors ${isDark ? 'border-stone-800' : 'border-stone-105'} space-y-3`}>
                      <div className="space-y-1 flex justify-between items-center">
                        <div>
                          <h3 className={`text-xs font-bold leading-none ${isDark ? 'text-stone-300' : 'text-stone-750'}`}>功能设置 (Functional Settings)</h3>
                          <p className={`text-[10px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>个性化调配伴眠音频和播放淡出行为。</p>
                        </div>
                      </div>

                      <div 
                        onClick={() => setFadeEnabled(prev => !prev)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 select-none ${
                          fadeEnabled 
                            ? 'border-amber-500 bg-amber-500/5' 
                            : isDark 
                              ? 'border-stone-800 bg-stone-950/20 hover:border-stone-750' 
                              : 'border-stone-200 bg-stone-50/50 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">开启播放器渐弱</span>
                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-bold ${
                              fadeEnabled 
                                ? 'bg-amber-600/10 text-amber-600' 
                                : isDark ? 'bg-stone-800 text-stone-500' : 'bg-stone-200 text-stone-600'
                            }`}>默认开启</span>
                          </div>
                          <p className={`text-[9.5px] leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                            定时将平滑分成10段，音量按时段均匀递减。若不设定时，则按10小时内平滑均匀递减。最末档将维持伴眠最低档，不彻底静音。
                          </p>
                        </div>
                        <div className="relative">
                          {/* Modern dynamic toggle switch */}
                          <div className={`w-9 h-5 rounded-full transition-colors relative ${
                            fadeEnabled ? 'bg-amber-600' : 'bg-stone-300'
                          }`}>
                            <motion.div 
                              layout
                              className="absolute w-4 h-4 bg-white rounded-full top-0.5 left-0.5"
                              animate={{ x: fadeEnabled ? 16 : 0 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ABOUT TAB PANEL */}
                {settingsSubTab === 'about' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex flex-col items-center py-3 text-center border-b transition-colors border-stone-200/20 mb-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-250 text-amber-700 shadow-sm mb-3">
                        <Compass size={20} className="animate-spin-slow text-amber-600" />
                      </div>
                      <h4 className="font-bold text-xs">曼陀罗催眠 (Mandala Hypnosis)</h4>
                      <p className={`text-[9px] mt-1 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Version 1.2.0 · 科学舒适催眠大师</p>
                    </div>

                    <div className="space-y-3.5">
                      <div className={`p-4 rounded-xl space-y-2.5 border ${
                        isDark ? 'bg-stone-950/20 border-stone-850' : 'bg-stone-50/50 border-stone-100'
                      }`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-semibold ${isDark ? 'text-stone-500' : 'text-stone-450'}`}>作者 (Author)</span>
                          <span className="font-bold font-sans">Yi</span>
                        </div>

                        <div className="flex justify-between items-center border-t pt-2.5 transition-colors border-stone-200/20">
                          <span className={`font-semibold ${isDark ? 'text-stone-500' : 'text-stone-450'}`}>联系方式 (Contact)</span>
                          <a 
                            href="mailto:cracks@yeah.net" 
                            className="font-bold text-amber-600 hover:underline font-mono"
                          >
                            cracks@yeah.net
                          </a>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border text-[9px] leading-relaxed transition-colors ${
                        isDark ? 'border-dashed border-stone-800 text-stone-500' : 'border-dashed border-stone-200 text-stone-450'
                      }`}>
                        <p>
                          * 应用程序精心利用“对称曼陀罗视觉渲染”与“等比呼气引导”结合的催眠艺术，配合高质 ASMR 声音合成，带您体验前所未有的心灵归一之旅。如有任何改进意见或反馈，随时欢迎发信。
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className={`p-4 border-t flex items-center justify-end ${
                isDark ? 'border-stone-850' : 'border-stone-100'
              }`}>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all active:scale-95 border border-amber-500"
                >
                  确定
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
