import React, { useState } from 'react';
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
  ArrowRight,
  Download
} from 'lucide-react';
import { SavedMandala, SavedTrack } from '../types';
import { renderMixerTracksToWav, savedTrackToMixerTracks } from '../utils/audioRender';

interface MyCreationsProps {
  savedMandalas: SavedMandala[];
  savedTracks: SavedTrack[];
  onDeleteMandala: (id: string) => void;
  onDeleteTrack: (id: string) => void;
  onRenameMandala: (id: string, newName: string) => void;
  onRenameTrack: (id: string, newName: string) => void;
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
  onRenameMandala,
  onRenameTrack,
  selectedMandalaId,
  setSelectedMandalaId,
  activeTrackId,
  setActiveTrackId,
  isDark,
  onNavigateToTab
}: MyCreationsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);

  return (
    <div id="my-creations-page" className="w-full h-full flex flex-col space-y-6">
      
      {/* Decorative Top header */}
      <div className="flex items-center justify-between border-b pb-4 border-stone-200/10">
        <div>
          <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-stone-100' : 'text-stone-850'}`}>我的专属作品集</h2>
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
              <h3 className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                制作的曼陀罗图案 ({savedMandalas.length})
              </h3>
            </div>
            
            <button
              onClick={() => onNavigateToTab('canvas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all border ${
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
                  <p className="text-xs font-bold">暂无制作的曼陀罗</p>
                  <p className="text-xs opacity-75">利用对称物理镜像画板，开始描摹专属的心灵密码吧</p>
                </div>
                <button
                  onClick={() => onNavigateToTab('canvas')}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold active:scale-95 shadow-sm transition-all"
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
                          {editingId === mandala.id ? (
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onBlur={() => {
                                if (editingValue.trim()) {
                                  onRenameMandala(mandala.id, editingValue.trim());
                                }
                                setEditingId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (editingValue.trim()) {
                                    onRenameMandala(mandala.id, editingValue.trim());
                                  }
                                  setEditingId(null);
                                }
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                              className={`text-xs font-bold w-full px-1.5 py-0.5 border rounded outline-none ${
                                isDark 
                                  ? 'bg-stone-800 border-stone-700 text-stone-100' 
                                  : 'bg-stone-50 border-stone-200 text-stone-900'
                              }`}
                            />
                          ) : (
                            <p 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingId(mandala.id);
                                setEditingValue(mandala.name);
                              }}
                              title="点击重命名"
                              className={`text-xs font-bold truncate cursor-pointer hover:text-amber-500 transition-colors ${
                                isDark ? 'text-stone-200' : 'text-stone-800'
                              }`}
                            >
                              {mandala.name} ✏️
                            </p>
                          )}
                          <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                            ID: {mandala.id.split('-').pop()?.toUpperCase() || mandala.id.slice(-4)}
                          </p>
                        </div>

                        {/* Action buttons list */}
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            type="button"
                            title={isActive ? '当前正在作为播放器梦境背景进行动态展示' : '点击将此曼陀罗设为播放器梦境背景'}
                            onClick={() => setSelectedMandalaId(mandala.id)}
                            className={`py-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center ${
                              isActive
                                ? 'bg-amber-600 text-white shadow-sm font-bold'
                                : isDark
                                  ? 'bg-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-750'
                                  : 'bg-stone-50 text-stone-650 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
                            }`}
                          >
                            <span>{isActive ? '使用中' : '使用'}</span>
                          </button>

                          <button
                            type="button"
                            title="下载此曼陀罗图片"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.download = `${mandala.name.replace(/\s+/g, '_')}.png`;
                              link.href = mandala.dataUrl;
                              link.click();
                            }}
                            className={`py-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center border ${
                              isDark
                                ? 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white hover:bg-stone-750'
                                : 'bg-stone-50 border-stone-200 text-stone-650 hover:bg-stone-100 hover:text-stone-900'
                            }`}
                          >
                            <Download size={10} className="mr-0.5" />
                            <span>下载</span>
                          </button>
                          
                          <button
                            type="button"
                            title="删除作品"
                            onClick={() => onDeleteMandala(mandala.id)}
                            className={`py-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center border border-transparent ${
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
              <h3 className={`text-sm font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                制作的催眠混音 ({savedTracks.length})
              </h3>
            </div>
            
            <button
              onClick={() => onNavigateToTab('mixer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all border ${
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
                  <p className="text-xs font-bold">暂无制作的催眠混音</p>
                  <p className="text-xs opacity-75">利用声音多轨叠加台，合成只给自己的睡眠共鸣助眠曲</p>
                </div>
                <button
                  onClick={() => onNavigateToTab('mixer')}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold active:scale-95 shadow-sm transition-all border border-emerald-500"
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
                            {editingId === track.id ? (
                              <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                onBlur={() => {
                                  if (editingValue.trim()) {
                                    onRenameTrack(track.id, editingValue.trim());
                                  }
                                  setEditingId(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (editingValue.trim()) {
                                      onRenameTrack(track.id, editingValue.trim());
                                    }
                                    setEditingId(null);
                                  }
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                className={`text-xs font-bold px-1.5 py-0.5 border rounded outline-none ${
                                  isDark 
                                    ? 'bg-stone-850 border-stone-750 text-stone-100' 
                                    : 'bg-stone-50 border-stone-200 text-stone-900'
                                }`}
                              />
                            ) : (
                              <h4 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingId(track.id);
                                  setEditingValue(track.name);
                                }}
                                title="点击重命名"
                                className={`text-sm font-semibold truncate cursor-pointer hover:text-amber-500 transition-colors ${
                                  isDark ? 'text-stone-100' : 'text-stone-800'
                                }`}
                              >
                                {track.name} ✏️
                              </h4>
                            )}
                            {isActive && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-md text-[10px] font-black tracking-widest scale-95 origin-left">
                                使用中
                              </span>
                            )}
                          </div>
                          
                          <p className={`text-xs truncate font-medium ${isDark ? 'text-stone-450' : 'text-stone-450'}`}>
                            {subLabel}
                          </p>
                        </div>
                      </div>

                      {/* Right buttons row */}
                      <div className="flex items-center gap-1.5 justify-end self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setActiveTrackId(track.id)}
                          title={isActive ? '当前正在伴眠中' : '将此白噪音伴眠曲设为当前播放曲轨'}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : isDark
                                ? 'bg-stone-800 text-stone-300 hover:text-stone-100 hover:bg-stone-750'
                                : 'bg-stone-100 text-stone-650 hover:bg-stone-200 border border-stone-200'
                          }`}
                        >
                          <Play size={8} fill={isActive ? '#ffffff' : 'currentColor'} />
                          <span>{isActive ? '正在伴眠' : '使用'}</span>
                        </button>

                        <button
                          type="button"
                          title={isDownloading ? "正在合成中..." : "合成并下载高保真 WAV 音频文件"}
                          disabled={isDownloading}
                          onClick={async () => {
                            const rawTracks = savedTrackToMixerTracks(track);
                            const activeTracks = rawTracks.filter(t => t.active);
                            if (activeTracks.length === 0) {
                              alert("无法合成此伴眠曲，因为没有包含任何活跃的白噪音或底噪轨。");
                              return;
                            }

                            const renderableActive = activeTracks.filter(t => t.type !== 'tts');
                            if (renderableActive.length === 0) {
                              alert("由于安全和技术架构限制，单纯由TTS朗读语音构成的混合轨无法直接转换为离线音频文件。推荐将TTS与白噪音底噪、导入或麦克风音轨协同混合后重试。");
                              return;
                            }

                            setIsDownloading(true);
                            setDownloadingTrackId(track.id);
                            setDownloadProgress('正在初始化混合渲染缓冲区...');

                            try {
                              const hasTts = activeTracks.some(t => t.type === 'tts');
                              const renderDuration = 60; // 60s sample loop

                              setDownloadProgress('正在数字虚拟混片并生成高解析原声 (60秒)...');
                              const audioBlob = await renderMixerTracksToWav(rawTracks, renderDuration);

                              setDownloadProgress('合并写入 WAV 格式...');
                              const url = URL.createObjectURL(audioBlob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `${track.name.replace(/\s+/g, '_')}.wav`;
                              link.click();
                              URL.revokeObjectURL(url);

                              if (hasTts) {
                                alert("下载成功！\n注意：受安全沙箱约束，离线混音器暂时无法在渲染侧合成TTS朗读轨道（TTS轨道在伴眠端可协同在线播发）。所有底噪白噪音、录制音轨和外部乐曲已经全部成功混缩！");
                              }
                            } catch (err: any) {
                              console.error("Mixed render error:", err);
                              alert(`合成合并失败: ${err?.message || '请移除过大文件后重试'}`);
                            } finally {
                              setIsDownloading(false);
                              setDownloadingTrackId(null);
                              setDownloadProgress('');
                            }
                          }}
                          className={`p-1.5 rounded-xl transition-all border flex items-center justify-center ${
                            isDownloading && downloadingTrackId === track.id
                              ? 'bg-amber-650 border-amber-600 text-white cursor-not-allowed'
                              : isDark
                                ? 'bg-stone-800 border-stone-700 text-stone-300 hover:text-stone-100 hover:bg-stone-750'
                                : 'bg-stone-50 border-stone-200 text-stone-500 hover:text-stone-900 hover:bg-stone-105'
                          }`}
                        >
                          {isDownloading && downloadingTrackId === track.id ? (
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-200/45 border-t-white animate-spin" />
                          ) : (
                            <Download size={11} />
                          )}
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

      {/* Downloading and offline renders loading state */}
      <AnimatePresence>
        {isDownloading && (
          <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-md flex items-center justify-center z-55 p-4 animate-gpu">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-[24px] p-6 space-y-4 border shadow-xl text-center ${
                isDark 
                  ? 'bg-stone-900 border-stone-800 text-stone-100' 
                  : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 rounded-full border-4 border-amber-600/20 border-t-amber-600 animate-spin" />
                <div className="space-y-1.5">
                  <h4 className="text-sm font-bold">高品质音频合成中</h4>
                  <p className="text-xs opacity-75">{downloadProgress}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Internal check helper for rotating disk feedback
function isPlayingMandala(id: string) {
  // Can expand to track rotational state
  return false;
}
