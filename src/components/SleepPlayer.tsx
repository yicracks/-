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
  ChevronLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { SavedMandala, SavedTrack, AnimationMode, MandalaSettings } from '../types';
import { AVAILABLE_ASMR_SOUNDS, setSoundVolume, stopAllSounds, playTextSpeech, stopSpeech } from '../utils/audioSynth';

interface SleepPlayerProps {
  savedMandalas: SavedMandala[];
  savedTracks: SavedTrack[];
  activeTrackId: string;
  setActiveTrackId: (id: string) => void;
  selectedMandalaId: string;
  setSelectedMandalaId: (id: string) => void;
  onNavigateToTab: (tab: 'player' | 'canvas' | 'mixer' | 'creations') => void;
  isDark?: boolean;
  fadeEnabled?: boolean;
  settings?: MandalaSettings;
}

// Predefined relax ambient soundtracks
const PRELOADED_SLEEP_TRACKS: SavedTrack[] = [
  {
    id: 'track-default-calming-night',
    name: '静谧夜晚花园 (竖琴与鸣虫)',
    sounds: { 'bgm-calming-night': 0.8 },
    customAudioName: 'calming-night-garden.mp3',
    customAudioDataUrl: '/music/bgm/shorts_by_pazuzustudio-calming-night-garden-harp-and-cricket-sounds-545253.mp3'
  },
  {
    id: 'track-default-cozy-rain',
    name: '暖屋屋外小雨 (冥想竖琴)',
    sounds: { 'bgm-cozy-rain': 0.85 },
    customAudioName: 'cozy-rain-outside.mp3',
    customAudioDataUrl: '/music/bgm/shorts_by_pazuzustudio-cozy-rain-outside-meditative-harp-background-545233.mp3'
  },
  {
    id: 'track-default-magical-forest',
    name: '魔法森林夜色 (梦幻风铃)',
    sounds: { 'bgm-magical-forest': 0.8 },
    customAudioName: 'magical-forest-night.mp3',
    customAudioDataUrl: '/music/bgm/shorts_by_pazuzustudio-magical-forest-night-enchanting-harp-and-crickets-545256.mp3'
  },
  {
    id: 'track-default-peaceful-midnight',
    name: '和平午夜之歌 (夏夜鸣蝉)',
    sounds: { 'bgm-peaceful-midnight': 0.75 },
    customAudioName: 'peaceful-midnight-harp.mp3',
    customAudioDataUrl: '/music/bgm/shorts_by_pazuzustudio-peaceful-midnight-harp-with-summer-night-crickets-545257 (1).mp3'
  },
  {
    id: 'track-default-soft-tide',
    name: '柔和潮汐浪花 (舒缓钢琴)',
    sounds: { 'bgm-soft-tide': 0.85 },
    customAudioName: 'soft-tide-piano.mp3',
    customAudioDataUrl: '/music/bgm/shorts_by_pazuzustudio-soft-tide-amp-intimate-piano-short-edit-521565.mp3'
  },
  {
    id: 'track-default-soul-frequencies',
    name: '528Hz 灵魂频率 (静心冥想音)',
    sounds: { 'bgm-soul-frequencies': 0.9 },
    customAudioName: '528hz-meditation.mp3',
    customAudioDataUrl: '/music/bgm/soul_frequencies-528hz-meditation-529616.mp3'
  }
];

export const DEFAULT_MANDALA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500"><rect width="100%" height="100%" fill="%23FAF6F0"/><g transform="translate(250,250)" stroke="rgba(197,168,128,0.35)" stroke-width="2" fill="none"><circle r="40"/><circle r="80"/><circle r="120"/><circle r="180"/>${Array.from({ length: 48 }).map((_, i) => {
  const angle = (i * 360) / 48;
  return `<line x1="0" y1="0" x2="${Math.cos(angle * Math.PI / 180) * 220}" y2="${Math.sin(angle * Math.PI / 180) * 220}" opacity="0.3" />`;
}).join('')}${Array.from({ length: 12 }).map((_, i) => {
  const angle = (i * 360) / 12;
  return `<g transform="rotate(${angle})"><path d="M 0,-40 C 30,-80 30,-120 0,-160 C -30,-120 -30,-80 0,-40" stroke="rgba(197,168,128,0.15)" /><path d="M 0,0 C 15,-20 15,-40 0,-60 C -15,-40 -15,-20 0,0" stroke="rgba(180,140,80,0.3)" /><circle cx="0" cy="-160" r="4" fill="%23c5a880"/></g>`;
}).join('')}</g></svg>`;

const SleepPlayer: React.FC<SleepPlayerProps> = ({
  savedMandalas,
  savedTracks,
  activeTrackId,
  setActiveTrackId,
  selectedMandalaId,
  setSelectedMandalaId,
  onNavigateToTab,
  isDark = false,
  fadeEnabled = true,
  settings
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [timerLeft, setTimerLeft] = useState<number | null>(null); // clock countdown in seconds
  const [timerConfig, setTimerConfig] = useState<number | null>(null); // minutes
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [animationMode, setAnimationMode] = useState<AnimationMode>('nested-zoom');
  const [breathingGuide, setBreathingGuide] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  const [preloadTracks, setPreloadTracks] = useState<SavedTrack[]>(PRELOADED_SLEEP_TRACKS);

  // Fetch dynamic BGM list and construct the soundtracks
  useEffect(() => {
    fetch('/api/bgm-list')
      .then(res => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data: Array<{ filename: string; name: string; url: string }>) => {
        if (Array.isArray(data) && data.length > 0) {
          const dynamicTracks = data.map((item, idx) => {
            const match = PRELOADED_SLEEP_TRACKS.find(t => 
              t.customAudioDataUrl?.includes(item.filename) || t.customAudioName === item.filename
            );
            if (match) {
              return {
                ...match,
                customAudioDataUrl: item.url
              };
            }
            return {
              id: `track-dynamic-bgm-${idx}-${item.filename}`,
              name: item.name,
              sounds: {},
              customAudioName: item.filename,
              customAudioDataUrl: item.url
            };
          });
          setPreloadTracks(dynamicTracks);
        }
      })
      .catch(err => {
        console.warn("Could not load dynamic BGM list, using predefined offline tracks:", err);
      });
  }, []);

  const [sessionElapsed, setSessionElapsed] = useState<number>(0);

  // Time-decay tick loop for the volume fade-out action
  useEffect(() => {
    if (!isPlaying) {
      setSessionElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setSessionElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const getFadeRatio = () => {
    if (!fadeEnabled || !isPlaying) return 1.0;
    if (timerConfig !== null && timerLeft !== null) {
      const totalSeconds = timerConfig * 60;
      if (totalSeconds <= 0) return 1.0;
      // Divided into 10 intervals, from 1.0 to 0.19 (lowest limit, not muted)
      const segment = Math.min(9, Math.floor((sessionElapsed / totalSeconds) * 10));
      return 1.0 - segment * 0.09;
    } else {
      // 10-hour hourly steps
      const segment = Math.min(9, Math.floor(sessionElapsed / 3600));
      return 1.0 - segment * 0.09;
    }
  };

  const fadeRatio = getFadeRatio();

  const getCurrentModeLabel = () => {
    if (breathingGuide) return '当前模式：助眠呼吸引导';
    if (animationMode === 'nested-zoom') return '当前模式：动态效果';
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
  const allTracks = [...preloadTracks, ...savedTracks];
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
            setSoundVolume(t.soundId, t.volume * fadeRatio);
          } else if (t.type === 'tts' && t.ttsText) {
            // Play TTS using comforting slow pace
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(t.ttsText);
              utterance.volume = t.volume * fadeRatio;
              utterance.rate = 0.55; // gentle slow pace (催眠引导语柔和舒缓)
              utterance.pitch = 0.85; // comforting softer voice pitch
              const voices = window.speechSynthesis.getVoices();
              const premiumZhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
              if (premiumZhVoice) utterance.voice = premiumZhVoice;
              window.speechSynthesis.speak(utterance);
            }
          } else if (t.type === 'mic' && t.recordedUrl) {
            try {
              const audio = new Audio(t.recordedUrl);
              audio.loop = true;
              audio.volume = t.volume * fadeRatio;
              audio.playbackRate = t.speed;
              audio.play().catch(e => console.error("Error playing mic track:", e));
              activeMixerAudioNodesRef.current[t.id] = audio;
            } catch(e) {}
          } else if (t.type === 'import' && t.importDataUrl) {
            try {
              const audio = new Audio(t.importDataUrl);
              audio.loop = true;
              audio.volume = t.volume * fadeRatio;
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
          setSoundVolume(id, (vol as number) * fadeRatio);
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
             audio.volume = 0.8 * fadeRatio;
             audio.play().catch(e => console.error("Error playing custom track in tab1:", e));
             customAudioInstanceRef.current = audio;
           } catch(e) {}
        }

        // 4. Play microphone recorded audio loop
        if (activeTrack.recordedAudioDataUrl) {
           try {
             const audio = new Audio(activeTrack.recordedAudioDataUrl);
             audio.loop = true;
             audio.volume = 0.8 * fadeRatio;
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

  // Dynamic smooth volume modulation for the player fade-out effect as time passes
  useEffect(() => {
    if (!isPlaying) return;
    
    // 1. Modulate natural ASMR sounds
    if (activeTrack.mixerTracks && activeTrack.mixerTracks.length > 0) {
      activeTrack.mixerTracks.forEach(t => {
        if (!t.active || t.volume <= 0) return;
        if (t.type === 'built-in' && t.soundId) {
          setSoundVolume(t.soundId, t.volume * fadeRatio);
        }
      });
    } else {
      Object.entries(activeTrack.sounds).forEach(([id, vol]) => {
        setSoundVolume(id, (vol as number) * fadeRatio);
      });
    }

    // 2. Modulate HTMLAudioElement instances
    if (customAudioInstanceRef.current) {
      customAudioInstanceRef.current.volume = 0.8 * fadeRatio;
    }
    if (recordedAudioInstanceRef.current) {
      recordedAudioInstanceRef.current.volume = 0.8 * fadeRatio;
    }
    for (const key in activeMixerAudioNodesRef.current) {
      const node = activeMixerAudioNodesRef.current[key];
      if (node) {
        const origTrack = activeTrack.mixerTracks?.find(t => t.id === key);
        const baseVol = origTrack ? origTrack.volume : 0.8;
        node.volume = baseVol * fadeRatio;
      }
    }
  }, [fadeRatio, isPlaying, activeTrack]);

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
      const drawFrame = () => {
        const parent = canvas.parentElement;
        if (!parent) return;

        const w = parent.clientWidth;
        const h = parent.clientHeight;
        
        // Handle initial zero-width/height gracefully to prevent division-by-zero or scaling bugs
        if (w === 0 || h === 0) {
          animId = requestAnimationFrame(drawFrame);
          return;
        }

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          canvas.style.width = `${w}px`;
          canvas.style.height = `${h}px`;
        }

        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

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

        if (animationMode === 'nested-zoom') {
          // Continuous exponentially outward expander zoom
          const speed = settings?.animationSpeed || 2;
          const numLayers = settings?.animationDensity || 4;
          const maxScale = settings?.maxZoomScale || 4.0;
          const minScale = 0.05;

          const loopMs = 15000 / speed;
          const offsetVal = (Date.now() / loopMs) % 1;
          const maxRadius = Math.min(cx, cy);

          // Very slow, soothing rotation
          const rotationAngle = (Date.now() / (loopMs * 4)) % (Math.PI * 2);

          for (let i = 0; i < numLayers; i++) {
            const layerProgress = i + offsetVal;
            const p = layerProgress / numLayers;

            // Perfect sine curve that reaches exactly 0 on both ends (p=0 and p=1)
            const alpha = Math.sin(p * Math.PI);
            // High-fidelity exponential scale calculation
            const scale = minScale * Math.pow(maxScale / minScale, p);

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
            
            // Mask to circular viewport boundary
            ctx.beginPath();
            ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
            ctx.clip();

            ctx.translate(cx, cy);
            ctx.rotate(rotationAngle * (i % 2 === 0 ? 1 : -1) * 0.4); // Stagger rotation
            ctx.scale(scale, scale);
            ctx.translate(-cx, -cy);
            
            ctx.drawImage(imgObj, cx - 250, cy - 250, 500, 500);
            ctx.restore();
          }
        } else {
          // Static Presentation mode
          ctx.save();
          const targetSize = Math.min(w, h) * 0.95;
          
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
  }, [selectedMandalaId, animationMode, isPlaying, savedMandalas, isExpanded, settings]);

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

  if (isExpanded) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 relative overflow-hidden select-none animate-gpu">
        
        {/* Floating subtle control: Close / Minimize */}
        <button
          onClick={() => setIsExpanded(false)}
          className={`absolute top-6 right-6 p-2 rounded-full border shadow-md transition-all z-50 cursor-pointer active:scale-95 ${
            isDark 
              ? 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:bg-stone-850' 
              : 'bg-white border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50'
          }`}
          title="退出沉浸模式"
        >
          <Minimize2 size={16} />
        </button>

        {/* Big centered circular mandala showcase container */}
        <div className="relative w-full aspect-square max-w-[480px] lg:max-w-[550px] rounded-full p-4 shadow-2xl flex items-center justify-center group transition-all duration-500 bg-stone-950/20">
          <motion.div
            animate={isPlaying && animationMode !== 'nested-zoom' ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying && animationMode !== 'nested-zoom' ? { repeat: Infinity, duration: 18, ease: "linear" } : { duration: 0.5 }}
            className={`relative w-full h-full rounded-full overflow-hidden flex items-center justify-center border shadow-inner transition-colors duration-300 ${
              isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
            }`}
          >
            {/* Embedded Mandala Live Canvas */}
            <canvas ref={playerCanvasRef} className="absolute inset-0 block pointer-events-none w-full h-full" />
            
            {/* Standard CD inner hub silver ring groove decoration */}
            <div className={`absolute w-[130px] h-[130px] rounded-full border backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-15 transition-colors ${
              isDark ? 'border-stone-800 bg-stone-900/50' : 'border-stone-200 bg-white/50'
            }`}>
              <div className={`w-[100px] h-[100px] rounded-full border border-dashed flex items-center justify-center ${
                isDark ? 'border-stone-700' : 'border-stone-200'
              }`}>
                <div className={`w-[58px] h-[58px] rounded-full border ${
                  isDark ? 'bg-stone-950 border-stone-800/50' : 'bg-stone-100 border-stone-200/50'
                }`} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tip at the bottom */}
        <p className={`absolute bottom-6 text-xs tracking-widest pointer-events-none select-none transition-colors opacity-40 ${
          isDark ? 'text-stone-400' : 'text-stone-500'
        }`}>
          点击外部或右上角按钮返回
        </p>

        {/* Tap on the rest of screen background exits as well */}
        <div 
          onClick={() => setIsExpanded(false)} 
          className="absolute inset-0 z-0 cursor-pointer" 
        />
        
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col items-center justify-start md:justify-center p-1 sm:p-4 overflow-y-auto">
      
      {/* Standalone Physical styled CD Deck Container */}
      <div className={`w-full max-w-[530px] border rounded-[28px] xs:rounded-[38px] p-4 xs:p-6 shadow-md flex flex-col items-center relative overflow-hidden transition-colors duration-300 ${
        isDark 
          ? 'bg-stone-900/90 border-stone-850 text-stone-100 shadow-xl shadow-black/40' 
          : 'bg-white border-stone-200/80 text-stone-800 shadow-sm'
      }`}>

        {/* Subtle decorative expand button for fullscreen zen mode of mandala */}
        <button
          onClick={() => setIsExpanded(true)}
          className={`absolute top-4 right-4 p-1.5 rounded-xl border opacity-30 hover:opacity-100 transition-all z-30 cursor-pointer hover:scale-105 active:scale-95 ${
            isDark 
              ? 'bg-stone-950/40 border-stone-850 hover:bg-stone-800 text-stone-400 hover:text-white' 
              : 'bg-stone-50 border-stone-200/50 hover:bg-stone-100 text-stone-500 hover:text-stone-900'
          }`}
          title="沉浸式全屏放大花纹"
        >
          <Maximize2 size={13} />
        </button>
        
        {/* Subtle decorative metallic side rails for high-end feel */}
        <div className={`absolute top-8 left-0 bottom-8 w-[2px] bg-gradient-to-b from-transparent to-transparent pointer-events-none ${
          isDark ? 'via-stone-800' : 'via-stone-100'
        }`} />
        <div className={`absolute top-8 right-0 bottom-8 w-[2px] bg-gradient-to-b from-transparent to-transparent pointer-events-none ${
          isDark ? 'via-stone-800' : 'via-stone-100'
        }`} />

        {/* 1. UPPER SECTION: The Premium CD Compartment Door */}
        <div className={`relative w-full aspect-square max-w-[180px] xs:max-w-[270px] sm:max-w-[340px] md:max-w-[390px] rounded-full p-2 xs:p-3 shadow-inner border flex items-center justify-center group mb-4 xs:mb-6 transition-colors duration-300 ${
          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
        }`}>
          
          {/* Acrylic Glass cover reflection shine overlay */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none z-20 mix-blend-overlay" />
          
          {/* Outer Chrome CD drive ring line */}
          <div className="absolute inset-1 rounded-full border border-amber-500/10 pointer-events-none z-10" />

          {/* Sunk interior track mechanism background */}
          <div className={`absolute inset-4 rounded-full pointer-events-none transition-colors ${
            isDark ? 'bg-stone-900/40' : 'bg-stone-100/50'
          }`} />
          
          {/* Subtle Laser pickup arm track decoration underneath the disc */}
          <div className="absolute left-1/2 top-4 bottom-1/2 w-1 bg-gradient-to-b from-stone-200 to-transparent -translate-x-1/2 opacity-30 pointer-events-none" />
          <div className="absolute left-[54%] top-[25%] w-1.5 h-1.5 rounded-full bg-amber-500/40 shadow-sm pointer-events-none" />

          {/* Rotating CD Disc Core - Spins when isPlaying is true and not tunnel zoom */}
          <motion.div
            animate={isPlaying && animationMode !== 'nested-zoom' ? { rotate: 360 } : { rotate: 0 }}
            transition={isPlaying && animationMode !== 'nested-zoom' ? { repeat: Infinity, duration: 18, ease: "linear" } : { duration: 0.5 }}
            className={`relative w-full h-full rounded-full overflow-hidden flex items-center justify-center border shadow-inner z-10 transition-colors duration-300 ${
              isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
            }`}
          >
            {/* Embedded Mandala Live Canvas */}
            <canvas ref={playerCanvasRef} className="absolute inset-0 block pointer-events-none w-full h-full" />
            
            {/* Standard CD inner hub silver ring groove decoration */}
            <div className={`absolute w-[70px] xs:w-[130px] h-[70px] xs:h-[130px] rounded-full border backdrop-blur-[1px] flex items-center justify-center pointer-events-none z-15 transition-colors ${
              isDark ? 'border-stone-800 bg-stone-900/50' : 'border-stone-200 bg-white/50'
            }`}>
              <div className={`w-[54px] xs:w-[100px] h-[54px] xs:h-[100px] rounded-full border border-dashed flex items-center justify-center ${
                isDark ? 'border-stone-700' : 'border-stone-200'
              }`}>
                <div className={`w-[30px] xs:w-[58px] h-[30px] xs:h-[58px] rounded-full border ${
                  isDark ? 'bg-stone-950 border-stone-800/50' : 'bg-stone-100 border-stone-200/50'
                }`} />
              </div>
            </div>
          </motion.div>

          {/* The Magnetic Center Spindle lock cap (CD机中心的固定卡轴水晶柱 - Click to Toggle Mode) */}
          <button
            onClick={cycleMode}
            className={`absolute w-8 xs:w-14 h-8 xs:h-14 rounded-full border hover:border-amber-500 hover:scale-105 shadow-sm flex items-center justify-center z-35 cursor-pointer active:scale-95 transition-all group ${
              isDark 
                ? 'bg-gradient-to-r from-stone-850 via-stone-800 to-stone-900 border-stone-700' 
                : 'bg-gradient-to-r from-stone-100 via-stone-50 to-stone-200 border-stone-300'
            }`}
          >
            <div className={`w-6 xs:w-10 h-6 xs:h-10 rounded-full flex items-center justify-center shadow-inner relative ${
              isDark ? 'bg-gradient-to-tr from-stone-800 to-stone-700' : 'bg-gradient-to-tr from-stone-200 to-stone-100'
            }`}>
              <div className={`w-3 xs:w-4 h-3 xs:h-4 rounded-full shadow-sm flex items-center justify-center ${
                isDark ? 'bg-stone-900' : 'bg-stone-300'
              }`}>
                <span className="w-1 h-1 bg-amber-600 rounded-full animate-ping" />
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
                className={`absolute inset-[6px] xs:inset-[10px] rounded-full flex flex-col items-center justify-between py-4 xs:py-7 backdrop-blur-sm transition-colors duration-300 z-20 ${
                  isDark ? 'bg-stone-950/95' : 'bg-stone-50/95'
                }`}
              >
                {/* 1. TOP SECTION: Guiding label outside the circle */}
                <div className="text-center z-10 select-none mt-1 sm:mt-2">
                  <span className={`text-base sm:text-xl font-extrabold tracking-[0.25em] px-4 sm:px-5 py-1 sm:py-2 rounded-2xl shadow-sm border transition-all inline-block ${
                    breathingPhase === 'Inhale' 
                      ? isDark ? 'bg-amber-955/40 border-amber-900/50 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800'
                      : breathingPhase === 'Hold' 
                      ? isDark ? 'bg-indigo-955/40 border-indigo-900/50 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-805'
                      : isDark ? 'bg-emerald-955/40 border-emerald-900/50 text-emerald-400' : 'bg-emerald-50 border-emerald-250/60 text-emerald-850'
                  }`}>
                    {breathingPhase === 'Inhale' ? '吸气' :
                     breathingPhase === 'Hold' ? '屏气' :
                     '呼气'}
                  </span>
                  <div className={`text-[10px] sm:text-xs font-bold tracking-wider mt-1 sm:mt-2 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                    4秒 节奏引导
                  </div>
                </div>

                {/* 2. MIDDLE SECTION: The dynamic pulsing circle (purely empty) */}
                <div className="relative w-16 xs:w-32 h-16 xs:h-32 flex items-center justify-center select-none">
                  <motion.div
                    key={breathingPhase}
                    initial={{ scale: breathingPhase === 'Inhale' ? 0.4 : 1.0, opacity: 0.3 }}
                    animate={{ 
                      scale: breathingPhase === 'Inhale' ? 0.95 : breathingPhase === 'Hold' ? 0.95 : 0.4,
                      opacity: 0.8
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className={`w-14 xs:w-28 h-14 xs:h-28 rounded-full border border-dashed transition-all duration-300 ${
                      breathingPhase === 'Inhale' 
                        ? isDark ? 'bg-amber-955/20 border-amber-500/80' : 'bg-amber-50/20 border-amber-305'
                        : breathingPhase === 'Hold' 
                        ? isDark ? 'bg-indigo-955/20 border-indigo-500/80' : 'bg-indigo-50/20 border-indigo-305'
                        : isDark ? 'bg-emerald-955/20 border-emerald-500/80' : 'bg-emerald-50/20 border-emerald-305'
                    }`}
                  />
                </div>

                {/* 3. BOTTOM SECTION: Navigation control */}
                <button 
                  onClick={cycleMode}
                  className={`px-3 py-1 sm:px-3.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-semibold transition-all active:scale-95 border z-10 ${
                    isDark 
                      ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200/50'
                  }`}
                >
                  点击切换模式
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 2. LOWER SECTION: The Integrated Media Player Console */}
        <div className="w-full flex flex-col gap-3 sm:gap-5 z-20">

          {/* LED Stereo Display Readout panel (Minimalist design) */}
          <div className={`relative rounded-2xl p-4 shadow-sm overflow-hidden text-center border transition-colors duration-300 ${
            isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
          }`}>
            
            <div className="flex justify-between items-center mb-1.5 text-xs font-bold uppercase tracking-wider">
              <span 
                onClick={cycleMode}
                className={`px-2.5 py-0.5 rounded-lg border transition-colors cursor-pointer select-none hover:border-amber-500/50 ${
                  isDark 
                    ? 'text-amber-450 bg-amber-950/40 border-amber-900/60' 
                    : 'text-amber-700 bg-amber-50 border-amber-250/50'
                }`}
              >
                {breathingGuide ? '助眠呼吸引导' : animationMode === 'nested-zoom' ? '动态效果' : '静态背景'}
              </span>
              <div className={`flex items-center gap-1 transition-colors ${isDark ? 'text-stone-400' : 'text-stone-400'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-amber-600 animate-pulse' : 'bg-stone-300'}`} />
                <span>{isPlaying ? '放音中' : '待机中'}</span>
              </div>
            </div>

             {/* Glowing amber digital display for track title */}
            <h3 className={`text-base font-extrabold tracking-wide font-sans truncate mb-1 transition-colors ${
              isDark ? 'text-stone-100' : 'text-stone-800'
            }`}>
              {activeTrack.name}
            </h3>

            {/* Time status countdown segment bar */}
            <div className={`mt-3 border-t pt-2 flex justify-center items-center text-xs font-mono transition-colors ${
              isDark ? 'border-stone-850 text-stone-400' : 'border-stone-150 text-stone-500'
            }`}>
              <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border transition-colors ${
                isDark ? 'bg-stone-900 border-stone-800' : 'bg-stone-100 border-stone-200'
              }`}>
                <Clock size={11} className="text-amber-600" />
                <span>{timerLeft !== null ? formatTime(timerLeft) : '未设置定时'}</span>
              </span>
            </div>
          </div>

          {/* Tactile Aluminum Playback Control deck */}
          <div className={`flex justify-center items-center gap-6 py-2 rounded-2xl border px-4 shadow-sm transition-colors ${
            isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-50 border-stone-200'
          }`}>
            <button
              onClick={handlePrevTrack}
              type="button"
              className={`p-3 transition-colors rounded-full active:scale-95 shadow-sm border ${
                isDark 
                  ? 'text-stone-300 bg-stone-900 hover:bg-stone-800 border-stone-800 hover:text-amber-500' 
                  : 'text-stone-600 bg-white hover:bg-stone-100 border-stone-200 hover:text-amber-700'
              }`}
            >
              <div className="rotate-180"><div className="flex"><ChevronRight size={16} /></div></div>
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              type="button"
              className="w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all border border-amber-500"
            >
              {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} className="ml-0.5" fill="white" />}
            </button>

            <button
              onClick={handleNextTrack}
              type="button"
              className={`p-3 transition-colors rounded-full active:scale-95 shadow-sm border ${
                isDark 
                  ? 'text-stone-300 bg-stone-900 hover:bg-stone-800 border-stone-800 hover:text-amber-500' 
                  : 'text-stone-600 bg-white hover:bg-stone-100 border-stone-200 hover:text-amber-700'
              }`}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Background and Timer drawers stacked nicely */}
          <div className={`space-y-3 p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-stone-950/80 border-stone-855' : 'bg-stone-50 border-stone-200'
          }`}>
            
            {/* Sleeper companion dropdown selectors */}
            <div className="flex items-center justify-between gap-4">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}>
                <Disc size={11} className="text-amber-600" />
                梦境背景 (Disc Art)
              </span>
              <select
                value={selectedMandalaId}
                onChange={(e) => setSelectedMandalaId(e.target.value)}
                className={`border rounded-xl px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-600 max-w-[150px] shadow-sm ml-auto transition-colors ${
                  isDark 
                    ? 'bg-stone-900 border-stone-800 text-stone-200' 
                    : 'bg-white border-stone-250 text-stone-800'
                }`}
              >
                <option value="default">默认几何曼陀罗</option>
                {savedMandalas.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Built-in timer settings bar */}
            <div className={`space-y-2 border-t pt-2.5 transition-colors ${
              isDark ? 'border-stone-850' : 'border-stone-201/50'
            }`}>
              <label className={`text-xs font-bold uppercase tracking-wider block flex items-center gap-1.5 transition-colors ${
                isDark ? 'text-stone-400' : 'text-stone-500'
              }`}>
                <Moon size={11} className="text-amber-600" />
                定时
              </label>
              
              <div className="grid grid-cols-4 gap-1.5">
                {([15, 30, 60, null] as const).map((mins) => {
                  const isActive = timerConfig === mins;
                  return (
                    <button
                      key={mins ?? 'inf'}
                      type="button"
                      onClick={() => {
                        handleSetTimer(mins);
                        if (mins !== null) {
                          setCustomMinutes(mins.toString());
                        } else {
                          setCustomMinutes('');
                        }
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                        isActive
                          ? 'bg-amber-600 text-white border-amber-500 font-bold'
                          : isDark
                            ? 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800 hover:text-stone-100'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100/60'
                      }`}
                    >
                      {mins ? `${mins}分钟` : '不限'}
                    </button>
                  );
                })}
              </div>

              {/* Custom input line - explicitly requested */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-xs whitespace-nowrap font-medium transition-colors ${
                  isDark ? 'text-stone-400' : 'text-stone-500'
                }`}>
                  自定义时长:
                </span>
                <div className="relative flex-1 flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    placeholder="输入自定义分钟"
                    value={customMinutes}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomMinutes(val);
                      if (val && !isNaN(Number(val))) {
                        const mins = Math.max(1, Math.min(1440, Number(val)));
                        handleSetTimer(mins);
                      } else {
                        handleSetTimer(null);
                      }
                    }}
                    className={`w-full text-xs font-semibold px-3 py-1.5 rounded-xl border outline-none focus:ring-1 focus:ring-amber-600 transition-colors pr-10 ${
                      isDark 
                        ? 'bg-stone-900 border-stone-800 text-stone-100 placeholder-stone-600' 
                        : 'bg-white border-stone-250 text-stone-800 placeholder-stone-400'
                    }`}
                  />
                  <span className={`absolute right-3 text-xs font-bold ${
                    isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    分钟
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom link to Sound Mixer tab */}
          <div className="text-center pt-1">
            <button
              onClick={() => onNavigateToTab('mixer')}
              type="button"
              className="text-xs text-amber-700 hover:text-amber-800 transition-all font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <ChevronRight size={12} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SleepPlayer;
