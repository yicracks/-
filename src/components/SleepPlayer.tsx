import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  Volume2, 
  Moon, 
  Sparkles, 
  Grid2X2, 
  Infinity,
  Disc,
  Clock,
  Compass,
  ChevronRight,
  RefreshCw,
  Sliders,
  ChevronLeft
} from 'lucide-react';
import { SavedMandala, SavedTrack, AnimationMode } from '../types';
import { AVAILABLE_ASMR_SOUNDS, setSoundVolume, stopAllSounds, playTextSpeech, stopSpeech } from '../utils/audioSynth';

interface SleepPlayerProps {
  savedMandalas: SavedMandala[];
  savedTracks: SavedTrack[];
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  onNavigateToTab: (tab: 'player' | 'canvas' | 'mixer') => void;
}

// Predefined relax ambient soundtracks
const PRELOADED_SLEEP_TRACKS: SavedTrack[] = [
  {
    id: 'track-default-resonance',
    name: 'Cosmic Singularity (宇宙振鸣)',
    sounds: { 'bowl': 0.8, 'wind': 0.3 }
  },
  {
    id: 'track-default-rainstorm',
    name: 'Rainforest Whispers (深夜雨林)',
    sounds: { 'rain': 0.9, 'thunder': 0.3, 'ocean': 0.2 }
  },
  {
    id: 'track-default-tides',
    name: 'Eternal Tide Swell (永恒潮汐)',
    sounds: { 'ocean': 0.9, 'wind': 0.2, 'bowl': 0.15 }
  },
  {
    id: 'track-default-zen',
    name: 'Mountain Zen Gate (空山禅意)',
    sounds: { 'bowl': 0.95, 'crackle': 0.25, 'wind': 0.3 }
  }
];

export const DEFAULT_MANDALA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><rect width="100%" height="100%" fill="%23171717"/><g transform="translate(250,250)" stroke="rgba(255,110,0,0.35)" stroke-width="2" fill="none"><circle r="40"/><circle r="80"/><circle r="120"/><circle r="180"/>${Array.from({ length: 48 }).map((_, i) => {
  const angle = (i * 360) / 48;
  return `<line x1="0" y1="0" x2="${Math.cos(angle * Math.PI / 180) * 220}" y2="${Math.sin(angle * Math.PI / 180) * 220}" opacity="0.3" />`;
}).join('')}${Array.from({ length: 12 }).map((_, i) => {
  const angle = (i * 360) / 12;
  return `<g transform="rotate(${angle})"><path d="M 0,-40 C 30,-80 30,-120 0,-160 C -30,-120 -30,-80 0,-40" stroke="rgba(255,255,255,0.15)" /><path d="M 0,0 C 15,-20 15,-40 0,-60 C -15,-40 -15,-20 0,0" stroke="rgba(255,180,0,0.3)" /><circle cx="0" cy="-160" r="4" fill="%23ff6e00"/></g>`;
}).join('')}</g></svg>`;

const SleepPlayer: React.FC<SleepPlayerProps> = ({
  savedMandalas,
  savedTracks,
  activeTrackId,
  setActiveTrackId,
  onNavigateToTab
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null); // clock countdown in seconds
  const [timerConfig, setTimerConfig] = useState<number | null>(null); // minutes
  const [selectedMandalaId, setSelectedMandalaId] = useState<string>('default');
  const [animationMode, setAnimationMode] = useState<AnimationMode>('nested-zoom');
  const [breathingGuide, setBreathingGuide] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const getCurrentModeLabel = () => {
    if (breathingGuide) return '当前模式：助眠呼吸引导';
    if (animationMode === 'nested-zoom') return '当前模式：绚丽嵌套缩放';
    return '当前模式：静态展示背景';
  };

  const cycleMode = () => {
    if (animationMode === 'nested-zoom' && !breathingGuide) {
      setAnimationMode('none');
      setBreathingGuide(false);
    } else if (animationMode === 'none' && !breathingGuide) {
      setAnimationMode('nested-zoom');
      setBreathingGuide(true);
    } else {
      setAnimationMode('nested-zoom');
      setBreathingGuide(false);
    }
  };

  const playerCanvasRef = useRef<HTMLCanvasElement>(null);
  const customAudioInstanceRef = useRef<HTMLAudioElement | null>(null);
  const recordedAudioInstanceRef = useRef<HTMLAudioElement | null>(null);
  const activeMixerAudioNodesRef = useRef<{ [trackId: string]: HTMLAudioElement }>({});

  // Combine default preset paths with user drafts
  const allTracks = [...PRELOADED_SLEEP_TRACKS, ...savedTracks];
  const activeTrack = allTracks.find(t => t.id === activeTrackId) || allTracks[0];

  // Sync state to Web Audio Synthesizer plus custom tracks
  useEffect(() => {
    // Stop all previous audio/speech first
    stopAllSounds();
    stopSpeech();
    if (customAudioInstanceRef.current) {
      customAudioInstanceRef.current.pause();
      customAudioInstanceRef.current = null;
    }
    if (recordedAudioInstanceRef.current) {
      recordedAudioInstanceRef.current.pause();
      recordedAudioInstanceRef.current = null;
    }

    // Clean up dynamic multitrack audio objects
    for (const key in activeMixerAudioNodesRef.current) {
      activeMixerAudioNodesRef.current[key]?.pause();
    }
    activeMixerAudioNodesRef.current = {};

    if (isPlaying) {
      if (activeTrack.mixerTracks && activeTrack.mixerTracks.length > 0) {
        // Play using the new unlimited multi-track list format!
        activeTrack.mixerTracks.forEach(t => {
          if (!t.active || t.volume <= 0) return;

          if (t.type === 'built-in' && t.soundId) {
            setSoundVolume(t.soundId, t.volume);
          } else if (t.type === 'tts' && t.ttsText) {
            // Play TTS using custom rate (speed/playbackRate)
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(t.ttsText);
              utterance.volume = t.volume;
              utterance.rate = t.speed;
              utterance.pitch = 0.9;
              const voices = window.speechSynthesis.getVoices();
              const premiumZhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
              if (premiumZhVoice) utterance.voice = premiumZhVoice;
              window.speechSynthesis.speak(utterance);
            }
          } else if (t.type === 'mic' && t.recordedUrl) {
            try {
              const audio = new Audio(t.recordedUrl);
              audio.loop = true;
              audio.volume = t.volume;
              audio.playbackRate = t.speed;
              audio.play().catch(e => console.error("Error playing mic track:", e));
              activeMixerAudioNodesRef.current[t.id] = audio;
            } catch(e) {}
          } else if (t.type === 'import' && t.importDataUrl) {
            try {
              const audio = new Audio(t.importDataUrl);
              audio.loop = true;
              audio.volume = t.volume;
              audio.playbackRate = t.speed;
              audio.play().catch(e => console.error("Error playing import track:", e));
              activeMixerAudioNodesRef.current[t.id] = audio;
            } catch(e) {}
          }
        });
      } else {
        // Fallback for default presets
        // 1. Play active natural ASMR sounds
        Object.entries(activeTrack.sounds).forEach(([id, vol]) => {
          setSoundVolume(id, vol as number);
        });

        // 2. Play TTS speech voice
        if (activeTrack.ttsText) {
          playTextSpeech(activeTrack.ttsText);
        }

        // 3. Play custom audio loop
        if (activeTrack.customAudioDataUrl) {
           try {
             const audio = new Audio(activeTrack.customAudioDataUrl);
             audio.loop = true;
             audio.volume = 0.8;
             audio.play().catch(e => console.error("Error playing custom track in tab1:", e));
             customAudioInstanceRef.current = audio;
           } catch(e) {}
        }

        // 4. Play microphone recorded audio loop
        if (activeTrack.recordedAudioDataUrl) {
           try {
             const audio = new Audio(activeTrack.recordedAudioDataUrl);
             audio.loop = true;
             audio.volume = 0.8;
             audio.play().catch(e => console.error("Error playing recorded track in tab1:", e));
             recordedAudioInstanceRef.current = audio;
           } catch(e) {}
        }
      }
    }

    return () => {
      stopAllSounds();
      stopSpeech();
      if (customAudioInstanceRef.current) {
        customAudioInstanceRef.current.pause();
        customAudioInstanceRef.current = null;
      }
      if (recordedAudioInstanceRef.current) {
        recordedAudioInstanceRef.current.pause();
        recordedAudioInstanceRef.current = null;
      }
      for (const key in activeMixerAudioNodesRef.current) {
        activeMixerAudioNodesRef.current[key]?.pause();
      }
    };
  }, [isPlaying, activeTrackId, activeTrack]);

  // Handle sleep timer countdown ticks
  useEffect(() => {
    if (timerLeft === null) return;
    if (timerLeft <= 0) {
      setIsPlaying(false);
      setTimerLeft(null);
      setTimerConfig(null);
      return;
    }
    const interval = setInterval(() => {
      setTimerLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [timerLeft]);

  // Breathing rhythmic cyclic updates
  useEffect(() => {
    if (!breathingGuide) return;
    let phaseTimer: NodeJS.Timeout;
    
    const runBreathingCycle = () => {
      setBreathingPhase('Inhale');
      phaseTimer = setTimeout(() => {
        setBreathingPhase('Hold');
        phaseTimer = setTimeout(() => {
          setBreathingPhase('Exhale');
          phaseTimer = setTimeout(runBreathingCycle, 4000); // Exhale 4s
        }, 4000); // Hold 4s
      }, 4000); // Inhale 4s
    };

    runBreathingCycle();
    return () => clearTimeout(phaseTimer);
  }, [breathingGuide]);

  const handleSetTimer = (minutes: number | null) => {
    setTimerConfig(minutes);
    if (minutes === null) {
      setTimerLeft(null);
    } else {
      setTimerLeft(minutes * 60);
    }
  };

  const getSelectedMandalaSrc = () => {
    if (selectedMandalaId === 'default') {
      return DEFAULT_MANDALA_SVG;
    }
    const saved = savedMandalas.find(m => m.id === selectedMandalaId);
    return saved ? saved.dataUrl : DEFAULT_MANDALA_SVG;
  };

  // Compile composite rendering on the circular CD viewport
  useEffect(() => {
    const canvas = playerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const imgObj = new Image();
    imgObj.src = getSelectedMandalaSrc();

    const startLoop = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = parent.clientWidth;
      const height = parent.clientHeight;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      const cx = width / 2;
      const cy = height / 2;

      const drawFrame = () => {
        ctx.clearRect(0, 0, width, height);

        if (!imgObj.complete) {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,255,255,0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx, cy, Math.min(cx, cy) - 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
          animId = requestAnimationFrame(drawFrame);
          return;
        }

        if (animationMode === 'nested-zoom' && isPlaying) {
          // Continuous exponentially outward expander zoom - grows up to margin circular boundaries
          const numLayers = 8;
          const offsetVal = (Date.now() / 3000) % 1; // loop precisely every 3s
          const maxRadius = Math.min(cx, cy);

          for (let i = 0; i < numLayers; i++) {
            const layerProgress = i + offsetVal;
            // Exponential scale factor growing outwards
            const scale = Math.pow(2.2, layerProgress - 3.5);
            const norm = layerProgress / numLayers; // 0 to 1

            // Custom opacity: fade in fast at deep center, stay sharp, and fade out cleanly exactly at physical disc border edge
            let alpha = 1.0;
            if (norm < 0.2) {
              alpha = norm / 0.2;
            } else if (norm > 0.8) {
              alpha = Math.max(0, (1.0 - norm) / 0.2);
            }

            if (scale > 5.5 || scale < 0.005) continue;

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            
            // Mask to circular viewport boundary
            ctx.beginPath();
            ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
            ctx.clip();

            ctx.translate(cx, cy);
            ctx.scale(scale, scale);
            ctx.translate(-cx, -cy);
            
            ctx.drawImage(imgObj, cx - 250, cy - 250, 500, 500);
            ctx.restore();
          }
        } else {
          // Static Presentation mode
          ctx.save();
          const targetSize = Math.min(width, height) * 0.95;
          
          // Outer clip
          ctx.beginPath();
          ctx.arc(cx, cy, targetSize / 2, 0, Math.PI * 2);
          ctx.clip();

          ctx.drawImage(imgObj, cx - targetSize / 2, cy - targetSize / 2, targetSize, targetSize);
          ctx.restore();
        }

        animId = requestAnimationFrame(drawFrame);
      };

      drawFrame();
    };

    imgObj.onload = startLoop;
    if (imgObj.complete) {
      startLoop();
    }

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedMandalaId, animationMode, isPlaying, savedMandalas]);

  // Formatting clock time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentPlayingTrackIndex = allTracks.findIndex(t => t.id === activeTrackId);
  const handlePrevTrack = () => {
    const nextIdx = (currentPlayingTrackIndex - 1 + allTracks.length) % allTracks.length;
    setActiveTrackId(allTracks[nextIdx].id);
  };

  const handleNextTrack = () => {
    const nextIdx = (currentPlayingTrackIndex + 1) % allTracks.length;
    setActiveTrackId(allTracks[nextIdx].id);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 xl:p-4 overflow-y-auto">
      
      {/* Standalone Physical styled CD Deck Container */}
      <div className="w-full max-w-[530px] bg-gradient-to-b from-[#161211] via-[#0b0808] to-[#040303] border border-white/10 rounded-[38px] p-6 shadow-2xl flex flex-col items-center relative overflow-hidden">
        
        {/* Subtle decorative metallic side rails for high-end feel */}
        <div className="absolute top-8 left-0 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
        <div className="absolute top-8 right-0 bottom-8 w-[2px] bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />

        {/* 1. UPPER SECTION: The Premium CD Compartment Door (像一个CD机一样，里面放图片) */}
        <div className="relative w-full aspect-square max-w-[420px] rounded-full bg-[#1c1817] p-3 shadow-[0_0_35px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.05)] border border-white/5 flex items-center justify-center group mb-6">
          
          {/* Acrylic Glass cover reflection shine overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/2 to-white/5 pointer-events-none z-20 mix-blend-overlay" />
          
          {/* Outer Chrome CD drive ring line */}
          <div className="absolute inset-1 rounded-full border border-orange-500/10 pointer-events-none z-10" />

          {/* Sunk interior track mechanism background */}
          <div className="absolute inset-4 rounded-full bg-neutral-950/80 pointer-events-none" />
          
          {/* Subtle Laser pickup arm track decoration underneath the disc */}
          <div className="absolute left-1/2 top-4 bottom-1/2 w-1 bg-gradient-to-b from-neutral-800 to-transparent -translate-x-1/2 opacity-30 pointer-events-none" />
          <div className="absolute left-[54%] top-[25%] w-1.5 h-1.5 rounded-full bg-blue-500/40 shadow-[0_0_6px_rgba(59,130,246,1)] pointer-events-none" />

          {/* Rotating CD Disc Core - Spins when isPlaying is true and not tunnel zoom */}
          <motion.div
            animate={isPlaying && animationMode !== 'nested-zoom' ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying && animationMode !== 'nested-zoom' ? { repeat: Infinity, duration: 18, ease: "linear" } : { duration: 0.5 }}
            className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-neutral-900 border border-white/10 shadow-inner z-10"
          >
            {/* Embedded Mandala Live Canvas */}
            <canvas ref={playerCanvasRef} className="absolute inset-0 block pointer-events-none w-full h-full" />
            
            {/* Standard CD inner hub silver ring groove decoration */}
            <div className="absolute w-[130px] h-[130px] rounded-full border border-white/15 bg-neutral-900/35 backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-15">
              <div className="w-[100px] h-[100px] rounded-full border border-dashed border-white/20 flex items-center justify-center">
                <div className="w-[58px] h-[58px] rounded-full bg-neutral-950/40 border border-white/10" />
              </div>
            </div>
          </motion.div>

          {/* The Magnetic Center Spindle lock cap (CD机中心的固定卡轴水晶柱 - Click to Toggle Mode) */}
          <button
            onClick={cycleMode}
            title="点击切换模式 (绚丽嵌套缩放 / 静态背景 / 呼吸引导)"
            className="absolute w-14 h-14 rounded-full bg-gradient-to-r from-neutral-300 via-neutral-100 to-neutral-400 border border-white/50 hover:border-orange-500 hover:scale-105 shadow-md flex items-center justify-center z-35 cursor-pointer active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-neutral-700 to-neutral-500 flex items-center justify-center shadow-inner relative">
              <div className="w-4 h-4 rounded-full bg-black shadow-md flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
              </div>
            </div>
          </button>

          {/* Real-time Breathing Tutor Overlay mounted over the CD */}
          <AnimatePresence>
            {breathingGuide && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-[10px] rounded-full bg-neutral-950/85 flex flex-col items-center justify-center backdrop-blur-md transition-all z-20"
              >
                <div className="mt-4 flex flex-col items-center">
                  <motion.div
                    key={breathingPhase}
                    initial={{ scale: breathingPhase === 'Inhale' ? 0.5 : 1.0, opacity: 0.5 }}
                    animate={{ 
                      scale: breathingPhase === 'Inhale' ? 0.95 : breathingPhase === 'Hold' ? 0.95 : 0.5,
                      opacity: 0.95
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className={`w-32 h-32 rounded-full flex flex-col items-center justify-center text-white border border-dashed ${
                      breathingPhase === 'Inhale' ? 'bg-orange-500/20 border-orange-400 text-orange-200' :
                      breathingPhase === 'Hold' ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200' :
                      'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                    }`}
                  >
                    <span className="text-[14px] font-bold tracking-widest uppercase mb-0.5">
                      {breathingPhase === 'Inhale' ? '吸气 Inhale' :
                       breathingPhase === 'Hold' ? '屏气 Hold' :
                       '呼气 Exhale'}
                    </span>
                    <span className="text-[9px] opacity-60 font-mono">4 Seconds</span>
                  </motion.div>
                </div>
                <button 
                  onClick={cycleMode}
                  className="mt-6 bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full text-[9px] font-semibold text-white transition-all active:scale-95 border border-white/5"
                >
                  点击切换模式 (Next Mode)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. LOWER SECTION: The Integrated Media Player Console (下面就是一个播放机，整个页面很简洁) */}
        <div className="w-full flex flex-col gap-5 z-20">

          {/* LED Stereo Display Readout panel (Minimalist design) */}
          <div className="relative bg-neutral-950 border border-white/5 rounded-2xl p-4 shadow-inner overflow-hidden text-center">
            
            {/* LED Ambient Backlight shader effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-500/2 via-transparent to-transparent pointer-events-none" />

            <div className="flex justify-between items-center mb-1.5 text-[10px] text-white/40 font-bold uppercase tracking-wider">
              <span className="text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-lg border border-orange-500/10">
                {breathingGuide ? '助眠呼吸引导' : animationMode === 'nested-zoom' ? '绚丽嵌套缩放' : '静态背景'}
              </span>
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-orange-500 animate-pulse' : 'bg-neutral-800'}`} />
                <span>{isPlaying ? '正在放音' : '待机中'}</span>
              </div>
            </div>

            {/* Glowing amber digital display for track title */}
            <h3 className="text-sm font-bold text-orange-400 tracking-wide font-sans truncate mb-1">
              {activeTrack.name}
            </h3>

            {/* Sub-status scroll text displaying playing white noises */}
            <div className="text-[10px] text-white/50 font-mono truncate">
              {Object.keys(activeTrack.sounds).map(id => {
                const s = AVAILABLE_ASMR_SOUNDS.find(x => x.id === id);
                return s ? s.name.split(' ')[0] : id;
              }).join(' + ') || '纯净寂静'}
            </div>

            {/* Time status countdown segment bar */}
            <div className="mt-3 border-t border-white/5 pt-2 flex justify-center items-center text-[10px] font-mono text-white/50">
              <span className="flex items-center gap-1 bg-white/2 px-2.5 py-0.5 rounded-full border border-white/5">
                <Clock size={11} className="text-orange-400" />
                <span>{timerLeft !== null ? formatTime(timerLeft) : '睡眠倒计时已关闭'}</span>
              </span>
            </div>
          </div>

          {/* Tactile Aluminum Playback Control deck */}
          <div className="flex justify-center items-center gap-6 py-2 bg-neutral-900/50 rounded-2xl border border-white/5 px-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <button
              onClick={handlePrevTrack}
              title="Previous soundscape"
              className="p-3 text-white/60 hover:text-orange-400 transition-all bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-full active:scale-95 shadow-sm"
            >
              <div className="rotate-180"><div className="flex"><ChevronRight size={16} /></div></div>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? "Pause music" : "Play music"}
              className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
            >
              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} className="ml-0.5" fill="white" />}
            </button>

            <button
              onClick={handleNextTrack}
              title="Next soundscape"
              className="p-3 text-white/60 hover:text-orange-400 transition-all bg-neutral-950 hover:bg-neutral-900 border border-white/5 rounded-full active:scale-95 shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Background and Timer drawers stacked nicely */}
          <div className="space-y-3 bg-neutral-950/40 p-4 rounded-2xl border border-white/5">
            
            {/* Sleeper companion dropdown selectors */}
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                <Disc size={11} className="text-orange-400" />
                选用梦境图像 (Disc Art)
              </span>
              <select
                value={selectedMandalaId}
                onChange={(e) => setSelectedMandalaId(e.target.value)}
                className="bg-[#1c1817] text-white/80 border border-white/10 rounded-xl px-2 py-1 text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-orange-500 max-w-[150px]"
              >
                <option value="default">默认几何曼陀罗</option>
                {savedMandalas.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Built-in timer settings bar */}
            <div className="space-y-1.5 border-t border-white/5 pt-2.5">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-wider block flex items-center gap-1.5">
                <Moon size={11} className="text-indigo-400" />
                自动关机定时 (Sleep Timer)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {([15, 30, 60, null] as const).map((mins) => {
                  const isActive = timerConfig === mins;
                  return (
                    <button
                      key={mins ?? 'inf'}
                      onClick={() => handleSetTimer(mins)}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                        isActive
                          ? 'bg-indigo-500 text-white border-indigo-400 font-bold'
                          : 'bg-white/2 text-white/40 border-transparent hover:bg-white/5'
                      }`}
                    >
                      {mins ? `${mins}m` : 'None'}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom link to Sound Mixer tab */}
          <div className="text-center pt-1">
            <button
              onClick={() => onNavigateToTab('mixer')}
              className="text-xs text-orange-400 hover:text-orange-300 transition-all font-semibold inline-flex items-center gap-1"
            >
              <span>没有满意的音阶？去定制音轨</span>
              <ChevronRight size={12} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SleepPlayer;
