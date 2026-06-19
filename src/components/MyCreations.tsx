import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, 
  Check, 
  Sparkles, 
  Music, 
  Image as ImageIcon, 
  Compass, 
  Plus, 
  Play, 
  Disc,
  ArrowRight
} from 'lucide-react';
import { SavedMandala, SavedTrack } from '../types';

interface MyCreationsProps {
  savedMandalas: SavedMandala[];
  savedTracks: SavedTrack[];
  onDeleteMandala: (id: string) => void;
  onDeleteTrack: (id: string) => void;
  selectedMandalaId: string;
  setSelectedMandalaId: (id: string) => void;
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  isDark: boolean;
  onNavigateToTab: (tab: 'player' | 'canvas' | 'mixer' | 'creations') => void;
}

export default function MyCreations({
  savedMandalas,
  savedTracks,
  onDeleteMandala,
  onDeleteTrack,
  selectedMandalaId,
  setSelectedMandalaId,
  activeTrackId,
  setActiveTrackId,
  isDark,
  onNavigateToTab
}: MyCreationsProps) {
  return (
    <div id="my-creations-page" className="w-full h-full flex flex-col space-y-6">
      
      {/* Decorative Top header */}
      <div className="flex items-center justify-between border-b pb-4 border-stone-200/10">
        <div>
          <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-stone-100' : 'text-stone-850'}`}>我的专属作品集</h2>
          <p className={`text-[10px] mt-1 ${isDark ? 'text-stone-450' : 'text-stone-500'}`}>在这里管理您手工创作的对称曼陀罗以及精细调配的催眠双音频轨道。</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
          <Sparkles size={11} className="text-amber-600 animate-pulse" />
          <span className="text-[9px] font-bold text-amber-700">伴眠灵感坊</span>
        </div>
      </div>

      {/* Two Columns Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start flex-1 overflow-y-auto pb-8 pr-1">
        
        {/* Section 1: 制作的曼陀罗图案 */}
        <div id="mandala-creations-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 border border-orange-500/20">
                <ImageIcon size={12} />
              </div>
              <h3 className={`text-xs font-bold ${isDark ? 'text-stone-205' : 'text-stone-800'}`}>
                制作的曼陀罗图案 ({savedMandalas.length})
              </h3>
            </div>
            
            <button
              onClick={() => onNavigateToTab('canvas')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-semibold tracking-tight transition-all border ${
                isDark 
                  ? 'bg-stone-850 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800' 
                  : 'bg-stone-100 border-stone-250/50 text-stone-650 hover:bg-stone-200 hover:text-stone-850'
              }`}
            >
              <Plus size={10} />
              <span>绘制新画布</span>
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {savedMandalas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center space-y-3.5 transition-colors ${
                  isDark ? 'bg-stone-900/10 border-stone-800/80 text-stone-500' : 'bg-stone-50/40 border-stone-200 text-stone-400'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-stone-500/5 border border-stone-500/10 flex items-center justify-center text-stone-500">
                  <Compass size={18} className="text-stone-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold">暂无制作的曼陀罗</p>
                  <p className="text-[8.5px] opacity-75">利用对称物理镜像画板，开始描摹专属的心灵密码吧</p>
                </div>
                <button
                  onClick={() => onNavigateToTab('canvas')}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[9.5px] font-bold active:scale-95 shadow-sm transition-all"
                >
                  去制作曼陀罗🎨
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
              >
                {savedMandalas.map((mandala) => {
                  const isActive = selectedMandalaId === mandala.id;
                  return (
                    <motion.div
                      key={mandala.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className={`group relative border rounded-2xl p-2.5 flex flex-col justify-between gap-3 shadow-sm hover:shadow transition-all duration-300 ${
                        isActive
                          ? isDark 
                            ? 'border-amber-600 bg-amber-950/10 shadow-amber-500/5' 
                            : 'border-amber-500/70 bg-amber-500/5 shadow-amber-500/5'
                          : isDark
                            ? 'border-stone-850 bg-stone-900/70 hover:border-stone-750'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      {/* Thumbnail frame view */}
                      <div className="aspect-square relative w-full rounded-xl overflow-hidden bg-stone-950/5 border border-stone-200/10 flex items-center justify-center">
                        <img 
                          src={mandala.dataUrl} 
                          alt={mandala.name} 
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover select-none transition-transform duration-500 ${
                            isPlayingMandala(mandala.id) ? 'scale-110' : 'group-hover:scale-105'
                          }`}
                        />
                        {isActive && (
                          <div className="absolute top-1.5 right-1.5 bg-amber-600 text-white p-1 rounded-full shadow border border-amber-500">
                            <Check size={8} strokeWidth={3} />
                          </div>
                        )}
                        
                        {/* Smooth active breathing ring decoration */}
                        {isActive && (
                          <span className="absolute inset-2 border-2 border-dashed border-amber-600/35 rounded-full animate-spin-slow pointer-events-none" />
                        )}
                      </div>

                      {/* Info & action buttons */}
                      <div className="space-y-2">
                        <div className="px-0.5">
                          <p className={`text-[10px] font-bold truncate ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                            {mandala.name}
                          </p>
                          <p className={`text-[8px] font-mono mt-0.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                            ID: {mandala.id.split('-').pop()?.toUpperCase() || mandala.id.slice(-4)}
                          </p>
                        </div>

                        {/* Action buttons list */}
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedMandalaId(mandala.id)}
                            className={`py-1 rounded-lg text-[8.5px] font-bold transition-all text-center flex items-center justify-center ${
                              isActive
                                ? 'bg-amber-600 text-white shadow-sm'
                                : isDark
                                  ? 'bg-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-750'
                                  : 'bg-stone-50 text-stone-650 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                            }`}
                          >
                            {isActive ? '播放中使用' : '设为播放器图案'}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => onDeleteMandala(mandala.id)}
                            className={`py-1 rounded-lg text-[8.5px] font-bold transition-all text-center flex items-center justify-center border border-transparent ${
                              isDark
                                ? 'bg-stone-950 hover:bg-red-950/20 hover:border-red-900/50 text-stone-500 hover:text-red-400'
                                : 'bg-stone-50/50 hover:bg-red-50 hover:border-red-200 text-stone-450 hover:text-red-600 border-stone-200'
                            }`}
                          >
                            <Trash2 size={10} className="mr-0.5" />
                            <span>删除</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Section 2: 制作的催眠混音 */}
        <div id="audio-creations-section" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                <Music size={12} />
              </div>
              <h3 className={`text-xs font-bold ${isDark ? 'text-stone-205' : 'text-stone-800'}`}>
                制作的催眠混音 ({savedTracks.length})
              </h3>
            </div>
            
            <button
              onClick={() => onNavigateToTab('mixer')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-semibold tracking-tight transition-all border ${
                isDark 
                  ? 'bg-stone-850 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-800' 
                  : 'bg-stone-100 border-stone-250/50 text-stone-650 hover:bg-stone-200 hover:text-stone-850'
              }`}
            >
              <Plus size={10} />
              <span>调配新共鸣</span>
            </button>
          </div>

          <AnimatePresence mode="popLayout">
            {savedTracks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`p-8 rounded-2xl border border-dashed flex flex-col items-center justify-center text-center space-y-3.5 transition-colors ${
                  isDark ? 'bg-stone-900/10 border-stone-800/80 text-stone-500' : 'bg-stone-50/40 border-stone-200 text-stone-400'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-stone-500/5 border border-stone-500/10 flex items-center justify-center text-stone-500 animate-pulse">
                  <Music size={18} className="text-stone-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold">暂无制作的催眠混音</p>
                  <p className="text-[8.5px] opacity-75">利用声音多轨叠加台，合成只给自己的睡眠共鸣助眠曲</p>
                </div>
                <button
                  onClick={() => onNavigateToTab('mixer')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9.5px] font-bold active:scale-95 shadow-sm transition-all border border-emerald-500"
                >
                  去调配混音🎵
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="space-y-3"
              >
                {savedTracks.map((track) => {
                  const isActive = activeTrackId === track.id;
                  
                  // Construct helper sub label showing the track sound names
                  let subLabel = '';
                  if (track.mixerTracks && track.mixerTracks.length > 0) {
                    subLabel = track.mixerTracks
                      .filter(t => t.active)
                      .map(t => t.name)
                      .slice(0, 4)
                      .join(' + ');
                  } else if (track.sounds) {
                    // Extract non-zero names
                    subLabel = Object.entries(track.sounds)
                      .filter(([_, vol]) => (vol as number) > 0)
                      .map(([id]) => {
                        if (id === 'bowl') return '天音颂钵';
                        if (id === 'rain') return '深夜林间微雨';
                        if (id === 'thunder') return '远山闷雷';
                        if (id === 'ocean') return '潮汐起落';
                        if (id === 'wind') return '旷野微风';
                        if (id === 'crackle') return '红泥暖炉炭火';
                        return id;
                      })
                      .join(' + ');
                  }
                  
                  if (!subLabel) subLabel = '纯净底噪氛围色';

                  return (
                    <motion.div
                      key={track.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                      className={`group border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-all duration-300 ${
                        isActive
                          ? isDark 
                            ? 'border-emerald-600/60 bg-emerald-950/10' 
                            : 'border-emerald-500 bg-emerald-500/5'
                          : isDark
                            ? 'border-stone-850 bg-stone-900/60 hover:border-stone-800'
                            : 'border-stone-200 bg-white hover:border-stone-250/60'
                      }`}
                    >
                      {/* Brand Info detail */}
                      <div className="flex items-center gap-3 w-full sm:max-w-[65%]">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/10'
                            : isDark ? 'bg-stone-950 text-stone-500' : 'bg-stone-50 text-stone-400'
                        }`}>
                          {isActive ? (
                            <Disc size={15} className="animate-spin-slow" />
                          ) : (
                            <Music size={14} className="group-hover:rotate-6 transition-transform" />
                          )}
                        </div>
                        
                        <div className="space-y-0.5 truncate flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className={`text-[11px] font-bold truncate ${isDark ? 'text-stone-100' : 'text-stone-800'}`}>
                              {track.name}
                            </h4>
                            {isActive && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md text-[7.5px] font-black tracking-widest scale-95 origin-left">
                                使用中
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-[8.5px] truncate font-medium ${isDark ? 'text-stone-450' : 'text-stone-450'}`}>
                            {subLabel}
                          </p>
                        </div>
                      </div>

                      {/* Right buttons row */}
                      <div className="flex items-center gap-2 justify-end self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setActiveTrackId(track.id)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black transition-all flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : isDark
                                ? 'bg-stone-800 text-stone-300 hover:text-stone-100'
                                : 'bg-stone-100 text-stone-650 hover:bg-stone-200 border border-stone-200'
                          }`}
                        >
                          <Play size={8} fill={isActive ? '#ffffff' : 'currentColor'} />
                          <span>{isActive ? '正在伴眠' : '设为播放器音乐'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteTrack(track.id)}
                          title="删除作品"
                          className={`p-1.5 rounded-xl transition-all border border-transparent ${
                            isDark
                              ? 'bg-stone-950 text-stone-550 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/40'
                              : 'bg-stone-50/50 text-stone-450 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border-stone-200'
                          }`}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>

                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

// Internal check helper for rotating disk feedback
function isPlayingMandala(id: string) {
  // Can expand to track rotational state
  return false;
}
