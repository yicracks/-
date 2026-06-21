import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  Sparkles, 
  Play, 
  Square, 
  Plus, 
  Upload, 
  Music, 
  X, 
  Save, 
  Check, 
  Mic, 
  FileAudio, 
  Trash2, 
  Clock, 
  AudioLines,
  Sliders,
  PlayCircle,
  PauseCircle,
  Info,
  Download
} from 'lucide-react';
import { SavedTrack, MixerTrack } from '../types';
import { AVAILABLE_ASMR_SOUNDS, setSoundVolume, stopAllSounds } from '../utils/audioSynth';
import { renderMixerTracksToWav } from '../utils/audioRender';
import { NOISE_CATALOG } from '../utils/noiseCatalog';

interface SoundMixerProps {
  savedTracks: SavedTrack[];
  onAddTrack: (track: SavedTrack) => void;
  onNavigateToTab: (tab: 'player' | 'canvas' | 'mixer' | 'creations') => void;
  isDark?: boolean;
}

const SoundMixer: React.FC<SoundMixerProps> = ({
  savedTracks,
  onAddTrack,
  onNavigateToTab,
  isDark = false
}) => {
  // Current stacked tracks in the mixer
  const [mixerTracks, setMixerTracks] = useState<MixerTrack[]>([
    {
      id: 'init-rain',
      type: 'built-in',
      name: '林间淅淅微雨',
      volume: 0.5,
      speed: 1.0,
      active: true,
      soundId: 'rain-light-rain'
    },
    {
      id: 'init-bowl',
      type: 'built-in',
      name: '佛照静心颂钵',
      volume: 0.4,
      speed: 1.0,
      active: true,
      soundId: 'things-singing-bowl'
    }
  ]);

  // Global trial/audible preview status
  const [isAudible, setIsAudible] = useState(false);

  // Modal / Creator Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrackType, setNewTrackType] = useState<'built-in' | 'tts' | 'mic' | 'import'>('built-in');

  // Input states for 'built-in' type
  const [selectedASMRId, setSelectedASMRId] = useState<string>('rain-light-rain');
  const [selectedCategory, setSelectedCategory] = useState<string>('rain');

  // Input states for 'tts' type
  const [ttsInput, setTtsInput] = useState('静静聆听这深夜的雨声，吸气，呼气，世界在这一刻安宁。');

  // Input states for 'mic' type
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordDuration, setRecordDuration] = useState<number>(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  // Input states for 'import' type
  const [importedFile, setImportedFile] = useState<{ name: string; size: string; dataUrl: string; duration: number } | null>(null);

  // Edit / Compile state
  const [mixName, setMixName] = useState('');
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  // Interactive dynamic audio nodes references for playing preview overlays
  const audioNodesRef = useRef<{ [trackId: string]: HTMLAudioElement }>({});
  const activeTtsTimeoutsRef = useRef<{ [trackId: string]: any }>({});
  const activeTtsSpeakingRef = useRef<{ [trackId: string]: boolean }>({});

  // Clean-up refs on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      stopAllPlayingAudio();
    };
  }, []);

  // Stop everything playing
  const stopAllPlayingAudio = () => {
    stopAllSounds();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    Object.keys(activeTtsTimeoutsRef.current).forEach(id => {
      clearTimeout(activeTtsTimeoutsRef.current[id]);
    });
    activeTtsTimeoutsRef.current = {};
    activeTtsSpeakingRef.current = {};

    for (const key in audioNodesRef.current) {
      audioNodesRef.current[key]?.pause();
    }
    audioNodesRef.current = {};
  };

  // Sync state to Web Audio Synth and custom Audio tags
  useEffect(() => {
    if (isAudible) {
      // 1. Handle built-in ASMR volumes
      // Stop all builtins first, then set volumes for active ones
      AVAILABLE_ASMR_SOUNDS.forEach(asmr => {
        const correspondingTracks = mixerTracks.filter(t => t.active && t.type === 'built-in' && t.soundId === asmr.id);
        if (correspondingTracks.length > 0) {
          // Sum or use highest volume
          const maxVol = Math.max(...correspondingTracks.map(t => t.volume));
          setSoundVolume(asmr.id, maxVol);
        } else {
          setSoundVolume(asmr.id, 0); // Mute
        }
      });

      // 2. Handle Mic and Import loops
      mixerTracks.forEach(track => {
        if (!track.active) {
          if (audioNodesRef.current[track.id]) {
            audioNodesRef.current[track.id].pause();
          }
          return;
        }

        const url = track.type === 'mic' ? track.recordedUrl : track.importDataUrl;
        if (url) {
          let audio = audioNodesRef.current[track.id];
          if (!audio) {
            audio = new Audio(url);
            audio.loop = true;
            audioNodesRef.current[track.id] = audio;
          }
          audio.volume = track.volume;
          audio.playbackRate = track.speed;
          audio.play().catch(e => console.log("Overlay play interrupted:", e));
        }
      });

      // Pause files from tracks that were deleted or deactivated
      Object.keys(audioNodesRef.current).forEach(id => {
        const tr = mixerTracks.find(t => t.id === id);
        if (!tr || !tr.active) {
          audioNodesRef.current[id].pause();
        }
      });

    } else {
      // stop all live playback
      stopAllPlayingAudio();
    }
  }, [isAudible, mixerTracks]);

  // Handle active TTS tracks looping inside Master Audio Preview (isAudible)
  useEffect(() => {
    // Clear any previous loops on triggers or pause
    Object.keys(activeTtsTimeoutsRef.current).forEach(id => {
      clearTimeout(activeTtsTimeoutsRef.current[id]);
    });
    activeTtsTimeoutsRef.current = {};
    activeTtsSpeakingRef.current = {};

    if (!isAudible) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    const activeTtsTracks = mixerTracks.filter(t => t.active && t.type === 'tts' && t.ttsText);

    activeTtsTracks.forEach(track => {
      const playTtsLoop = () => {
        if (!isAudible) return;
        
        // Find if this specific track is still active
        const stillActive = mixerTracks.some(t => t.id === track.id && t.active);
        if (!stillActive) return;

        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(track.ttsText!);
          utterance.rate = 0.55 * track.speed; // Bind to speed control
          utterance.volume = track.volume;     // Bind to volume control
          utterance.pitch = 0.85;

          const voices = window.speechSynthesis.getVoices();
          const premiumZhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
          if (premiumZhVoice) {
            utterance.voice = premiumZhVoice;
          }

          utterance.onend = () => {
            activeTtsSpeakingRef.current[track.id] = false;
            // Short calm 5s breath pause to prevent overcrowding
            if (isAudible) {
              const timeout = setTimeout(playTtsLoop, 5000);
              activeTtsTimeoutsRef.current[track.id] = timeout;
            }
          };

          utterance.onerror = () => {
            activeTtsSpeakingRef.current[track.id] = false;
            if (isAudible) {
              const timeout = setTimeout(playTtsLoop, 10000); // Retry longer delay if failed
              activeTtsTimeoutsRef.current[track.id] = timeout;
            }
          };

          activeTtsSpeakingRef.current[track.id] = true;
          window.speechSynthesis.speak(utterance);
        }
      };

      // Play immediately
      playTtsLoop();
    });

    return () => {
      Object.keys(activeTtsTimeoutsRef.current).forEach(id => {
        clearTimeout(activeTtsTimeoutsRef.current[id]);
      });
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAudible, mixerTracks]);

  const [isRecordingSimulated, setIsRecordingSimulated] = useState(false);
  const simOscsRef = useRef<any[]>([]);
  const simCtxRef = useRef<AudioContext | null>(null);

  // Micro recorder tools
  const startRecording = async () => {
    setIsRecordingSimulated(false);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setRecordedBlob(blob);
          const url = URL.createObjectURL(blob);
          setRecordedUrl(url);
          stream.getTracks().forEach(track => track.stop());
        };

        setRecordDuration(0);
        mediaRecorder.start();
        setIsRecording(true);

        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordDuration(prev => prev + 1);
        }, 1000);
      } else {
        throw new Error("navigator.mediaDevices or getUserMedia not available");
      }
    } catch (err) {
      console.warn("Physical microphone access failed. Switching to high-fidelity AI Sleep Sound Simulator:", err);
      // Trigger simulation mode completely client side using Web Audio API so it works everywhere!
      try {
        setIsRecordingSimulated(true);
        audioChunksRef.current = [];
        
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtxClass();
        simCtxRef.current = ctx;
        
        const dest = ctx.createMediaStreamDestination();
        
        // Let's generate a stunning, professional multi-oscillator binaural wellness chime 
        // that sounds completely authentic to a meditative state!
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();
        
        // 136.1 Hz planetary cosmic frequency (Om frequency for meditation/sleep/relax)
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(136.1, ctx.currentTime);
        
        // 140.1 Hz frequency - creates a perfect theta wave frequency variation of exactly 4 Hz!
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(140.1, ctx.currentTime);
        
        // A slow sweeping filter LFO to simulate manual professional breathing and cosmic wind!
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // very slow breathing rate
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(3.0, ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        
        gain1.gain.setValueAtTime(0.08, ctx.currentTime);
        gain2.gain.setValueAtTime(0.06, ctx.currentTime);
        
        osc1.connect(gain1);
        osc2.connect(gain2);
        
        gain1.connect(dest);
        gain2.connect(dest);
        
        lfo.start();
        osc1.start();
        osc2.start();
        
        simOscsRef.current = [osc1, osc2, lfo];
        
        // Use MediaRecorder on the synthesized stream
        const mediaRecorder = new MediaRecorder(dest.stream);
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          setRecordedBlob(blob);
          const url = URL.createObjectURL(blob);
          setRecordedUrl(url);
          // clean up virtual context
          try {
            osc1.stop();
            osc2.stop();
            lfo.stop();
            ctx.close();
          } catch(ex) {}
        };
        
        setRecordDuration(0);
        mediaRecorder.start();
        setIsRecording(true);
        
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = setInterval(() => {
          setRecordDuration(prev => prev + 1);
        }, 1000);
        
      } catch (simError) {
        console.error("Simulation initialization issue:", simError);
        alert("无法启动录音或模拟录音。请尝试选取已有音频文件！");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // Custom audio file importer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrlStr = event.target.result as string;
        const tempAudio = new Audio(dataUrlStr);
        tempAudio.addEventListener('loadedmetadata', () => {
          const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
          setImportedFile({
            name: file.name,
            size: `${sizeInMb} MB`,
            dataUrl: dataUrlStr,
            duration: tempAudio.duration || 10
          });
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add compiled track to the main multitrack mixer list
  const handleConfirmAddTrack = () => {
    let trackName = '';
    let payload: Partial<MixerTrack> = {};

    if (newTrackType === 'built-in') {
      const match = AVAILABLE_ASMR_SOUNDS.find(s => s.id === selectedASMRId);
      trackName = match ? `${match.name.split(' ')[0]}声效` : '系统自然音';
      payload = { soundId: selectedASMRId };
    } else if (newTrackType === 'tts') {
      const truncated = ttsInput.trim().slice(0, 15);
      trackName = `播音朗读: "${truncated}${ttsInput.length > 15 ? '...' : ''}"`;
      payload = { ttsText: ttsInput.trim() };
    } else if (newTrackType === 'mic') {
      if (!recordedUrl) {
        alert("请先进行录音再添加！");
        return;
      }
      trackName = `我的伴眠录音 (${recordDuration}秒)`;
      payload = { recordedUrl, duration: recordDuration };
    } else if (newTrackType === 'import') {
      if (!importedFile) {
        alert("请选择要上传的文件！");
        return;
      }
      trackName = `外部音轨: ${importedFile.name}`;
      payload = { 
        importDataUrl: importedFile.dataUrl, 
        customFileName: importedFile.name, 
        duration: Math.ceil(importedFile.duration) 
      };
    }

    const newTrackItem: MixerTrack = {
      id: `mtrack-${Date.now()}`,
      type: newTrackType,
      name: trackName,
      volume: 0.8,
      speed: 1.0,
      active: true,
      ...payload
    };

    setMixerTracks(prev => [...prev, newTrackItem]);
    
    // Reset specific states
    setTtsInput('静静聆听这深夜的雨声，吸气，呼气，世界在这一刻安宁。');
    setRecordedUrl(null);
    setRecordedBlob(null);
    setRecordDuration(0);
    setImportedFile(null);
    setShowAddForm(false);
  };

  // Play a single TTS sentence preview
  const previewSingleTTS = (text: string, vol: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = vol;
      utterance.rate = 0.55; // gentle, comforting slow pace (催眠引导语柔和舒缓)
      utterance.pitch = 0.85; // comforting softer frequency
      const voices = window.speechSynthesis.getVoices();
      const premiumZhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
      if (premiumZhVoice) utterance.voice = premiumZhVoice;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTrackValueChange = (id: string, field: 'volume' | 'speed' | 'active', value: any) => {
    setMixerTracks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, [field]: value };
      }
      return t;
    }));
  };

  const handleRemoveTrack = (id: string) => {
    if (audioNodesRef.current[id]) {
      audioNodesRef.current[id].pause();
      delete audioNodesRef.current[id];
    }
    setMixerTracks(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveMix = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mixerTracks.length === 0) {
      alert("请至少添加一个混音轨道后再进行保存！");
      return;
    }
    let fallbackNum = 0;
    savedTracks.forEach(t => {
      const match = t.name.match(/^音乐-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > fallbackNum) {
          fallbackNum = num;
        }
      }
    });
    const finalName = mixName.trim() || `音乐-${fallbackNum + 1}`;

    // Package configurations
    const soundsConfig: { [key: string]: number } = {};
    mixerTracks.forEach(t => {
      if (t.type === 'built-in' && t.soundId) {
        soundsConfig[t.soundId] = t.volume;
      }
    });

    const firstTts = mixerTracks.find(t => t.type === 'tts')?.ttsText;
    const firstCustom = mixerTracks.find(t => t.type === 'import');
    const firstRecorded = mixerTracks.find(t => t.type === 'mic');

    const newTrack: SavedTrack = {
      id: `track-${Date.now()}`,
      name: finalName,
      sounds: soundsConfig,
      ttsText: firstTts,
      customAudioName: firstCustom?.customFileName,
      customAudioDataUrl: firstCustom?.importDataUrl,
      recordedAudioName: firstRecorded ? '麦克风温言' : undefined,
      recordedAudioDataUrl: firstRecorded?.recordedUrl,
      maxDuration: 60, // Ref baseline
      mixerTracks: mixerTracks // FULL LAYERED CONFIG! Allows beautiful playing in SleepPlayer!
    };

    onAddTrack(newTrack);
    setMixName('');
    setShowSaveModal(false);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };

  const handleDownloadMix = async () => {
    const activeTracks = mixerTracks.filter(t => t.active);
    if (activeTracks.length === 0) {
      alert("当前没有可下载的活跃音轨！请确保添加并启用了至少一个声部轨。");
      return;
    }

    // Filter non-tts active tracks for checking physical rendering capability
    const renderableActiveTracks = activeTracks.filter(t => t.type !== 'tts');
    if (renderableActiveTracks.length === 0) {
      alert("由于浏览器本身的安全沙箱限制，朗读音轨(TTS)无法直接合成为离线音频文件。请在该界面添加至少一个白噪音、麦克风录制或本地导入轨后下载。");
      return;
    }

    setIsDownloading(true);
    setDownloadProgress('正在初始化音频离线合成环境...');
    
    try {
      let fallbackNum = 0;
      savedTracks.forEach(t => {
        const match = t.name.match(/^音乐-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > fallbackNum) {
            fallbackNum = num;
          }
        }
      });
      const finalName = mixName.trim() || `音乐-${fallbackNum + 1}`;

      const hasTts = activeTracks.some(t => t.type === 'tts');
      const renderDuration = 60; // Render a sleep loop of 60 seconds

      setDownloadProgress(`正在合成 60 秒高保真、多维空间环境的助眠音轨...`);
      const audioBlob = await renderMixerTracksToWav(mixerTracks, renderDuration);
      
      setDownloadProgress('正在写出 WAV 高音质音频文件...');
      const url = URL.createObjectURL(audioBlob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.setAttribute("download", `${finalName.replace(/\s+/g, '_')}.wav`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);

      if (hasTts) {
        alert("下载成功！\n注意：受限于浏览器的安全性框架，离线混音引擎无法数字翻录合成TTS朗读流（TTS仍可在线协同试听）。所有白噪音轨、导入音频及麦克风原声已经超清合成并混缩。");
      }
    } catch (error: any) {
      console.error("Audio mixdown failed:", error);
      alert(`音频渲染合并失败: ${error?.message || '请检查音质采样，然后重试'}`);
    } finally {
      setIsDownloading(false);
      setDownloadProgress('');
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 space-y-6">
      
      {/* Header introduction banner */}
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border p-6 rounded-3xl shadow-sm transition-colors duration-300 ${
        isDark 
          ? 'bg-stone-900/60 border-stone-800/80 text-stone-100' 
          : 'bg-white/85 border-stone-200/50 text-stone-800'
      }`}>
        <div className="space-y-1">
          <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
            <Sliders className="text-amber-600" size={18} />
            白噪音多轨叠加与朗读录制
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Stacked multi-tracks dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className={`border rounded-3xl p-6 space-y-5 shadow-sm transition-colors duration-300 ${
            isDark 
              ? 'bg-stone-900/50 border-stone-800/60 text-stone-100' 
              : 'bg-white/80 border-stone-200/60 text-stone-800'
          }`}>
            <div className="flex justify-between items-center border-b pb-3 transition-colors duration-300 border-stone-200/20">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isDark ? 'text-stone-300' : 'text-stone-600'
                }`}>配戴组合音轨</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-colors ${
                  isDark 
                    ? 'bg-stone-950 text-stone-300 border-stone-800' 
                    : 'bg-stone-50 text-stone-550 border-stone-200'
                }`}>
                  {mixerTracks.length} / 无限
                </span>
              </div>
            </div>

            {/* Configured track list */}
            {mixerTracks.length === 0 ? (
              <div className={`flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl transition-colors ${
                isDark 
                  ? 'border-stone-800 bg-stone-950/40' 
                  : 'border-stone-200 bg-stone-50/50'
              }`}>
                <Music className="text-stone-400 mb-2 animate-bounce animate-duration-1000" size={32} />
                <p className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>当前暂无堆叠音源</p>
                <span className="text-[10px] mt-2.5 text-stone-400 block">
                  点击右侧加号开始制作专属催眠混音乐曲
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {mixerTracks.map((track) => (
                  <div 
                    key={track.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      track.active
                        ? isDark
                          ? 'bg-stone-950/40 border-stone-850 shadow-sm'
                          : 'bg-[#FCFAF6] border-stone-200 shadow-sm'
                        : isDark
                          ? 'bg-stone-900/10 border-stone-900 opacity-40'
                          : 'bg-stone-50 border-stone-100 opacity-50'
                    }`}
                  >
                    {/* Track info header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${
                          track.type === 'built-in' 
                            ? isDark ? 'bg-amber-950/30 border-amber-900/60 text-amber-500' : 'bg-amber-50 border-amber-200 text-amber-700' :
                          track.type === 'tts' 
                            ? isDark ? 'bg-indigo-950/30 border-indigo-900/60 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700' :
                          track.type === 'mic' 
                            ? isDark ? 'bg-rose-950/30 border-rose-900/60 text-rose-450' : 'bg-rose-50 border-rose-200 text-rose-700' :
                          isDark ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-450' : 'bg-emerald-50 border-emerald-250 text-emerald-700'
                        }`}>
                          {track.type === 'built-in' && <Volume2 size={16} />}
                          {track.type === 'tts' && <AudioLines size={16} />}
                          {track.type === 'mic' && <Mic size={16} />}
                          {track.type === 'import' && <FileAudio size={16} />}
                        </div>
                        
                        <div>
                          <h4 className={`text-xs font-bold flex items-center gap-2 transition-colors ${
                            isDark ? 'text-stone-200' : 'text-stone-800'
                          }`}>
                            {track.name}
                          </h4>
                          <span className={`text-[9px] font-semibold tracking-wider transition-colors ${
                            isDark ? 'text-stone-500' : 'text-stone-400'
                          }`}>
                            {track.type === 'built-in' ? '内置白噪音' :
                             track.type === 'tts' ? 'TTS 播音员' :
                             track.type === 'mic' ? '麦克风录音' : '本地导入文件'}
                          </span>
                        </div>
                      </div>

                      {/* Right controls */}
                      <div className="flex items-center gap-2.5">
                        {/* Play standalone button for TTS */}
                        {track.type === 'tts' && track.ttsText && (
                          <button
                            onClick={() => previewSingleTTS(track.ttsText!, track.volume)}
                            className={`p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                              isDark 
                                ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-900/40' 
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                            }`}
                          >
                            单独朗读
                          </button>
                        )}

                        {/* Left-right 开启/关闭 selector capsule track styled with sliding motion */}
                        <div className={`relative flex items-center rounded-full p-0.5 border text-[10px] font-bold select-none h-7 w-24 transition-colors ${
                          isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-100 border-stone-200'
                        }`}>
                          {/* Sliding Pill Background indicator */}
                          <motion.div
                            className="absolute top-0.5 bottom-0.5 rounded-full bg-amber-600 shadow-[0_1px_3px_rgba(0,0,0,0.15)]"
                            initial={false}
                            animate={{
                              left: track.active ? '2px' : 'calc(50% + 1px)',
                              right: track.active ? 'calc(50% + 1px)' : '2px',
                            }}
                            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                          />
                          
                          <button
                            type="button"
                            onClick={() => handleTrackValueChange(track.id, 'active', true)}
                            className={`w-1/2 h-full z-10 rounded-full transition-colors duration-200 flex items-center justify-center whitespace-nowrap ${
                              track.active
                                ? 'text-white'
                                : isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-500 hover:text-stone-700'
                            }`}
                          >
                            开启
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleTrackValueChange(track.id, 'active', false)}
                            className={`w-1/2 h-full z-10 rounded-full transition-colors duration-200 flex items-center justify-center whitespace-nowrap ${
                              !track.active
                                ? 'text-white'
                                : isDark ? 'text-stone-500 hover:text-stone-300' : 'text-stone-505 hover:text-stone-700'
                            }`}
                          >
                            关闭
                          </button>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleRemoveTrack(track.id)}
                          className={`p-2 rounded-xl transition-all border ${
                            isDark 
                              ? 'bg-stone-900 hover:bg-rose-950/40 border-stone-850 text-stone-500 hover:text-rose-450' 
                              : 'bg-stone-50 hover:bg-rose-50 border-stone-200 text-stone-400 hover:text-rose-600'
                          }`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Volume slider only - speed removed */}
                    <div className={`border-t pt-3 transition-colors ${
                      isDark ? 'border-stone-850' : 'border-stone-105'
                    }`}>
                      {/* Volume */}
                      <div className="space-y-1 w-full max-w-[240px]">
                        <div className="flex justify-between items-center text-[10px] font-medium font-semibold">
                          <span className={isDark ? 'text-stone-500' : 'text-stone-400'}>配戴音量</span>
                          <span className={`font-mono font-semibold ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{Math.round(track.volume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={track.volume}
                          onChange={(e) => handleTrackValueChange(track.id, 'volume', parseFloat(e.target.value))}
                          className={`w-full accent-amber-600 h-1.5 rounded cursor-pointer ${
                            isDark ? 'bg-stone-900' : 'bg-stone-100'
                          }`}
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right 1 Column: Create Form and Save Block */}
        <div className="space-y-6">
          <div className={`border rounded-3xl p-6 space-y-5 shadow-sm transition-colors duration-300 ${
            isDark 
              ? 'bg-stone-900/50 border-stone-800/60 text-stone-100' 
              : 'bg-white/80 border-stone-200/60 text-stone-800'
          }`}>
            <h3 className="text-xs font-bold leading-none select-none tracking-wider uppercase opacity-70">
              制作专属合成音
            </h3>

            {!showOptions && !showAddForm ? (
              <div className="flex flex-col items-center justify-center py-12">
                <button
                  type="button"
                  onClick={() => setShowOptions(true)}
                  className="w-14 h-14 rounded-full bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shadow-md shadow-amber-900/10 active:scale-95 transition-all border border-amber-500"
                >
                  <Plus size={24} strokeWidth={2.5} />
                </button>
                <span className="text-[10px] mt-4 text-stone-450 font-medium tracking-wide">添加新音轨叠加</span>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Four visual category choice keys */}
                <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl border transition-colors bg-stone-950/10 border-stone-200/15 dark:bg-stone-950/40">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTrackType('built-in');
                      setShowAddForm(true);
                      setShowOptions(true);
                    }}
                    className={`py-2 rounded-xl text-center text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      newTrackType === 'built-in' && showAddForm
                        ? 'bg-amber-600 text-white shadow-sm border border-amber-500'
                        : isDark
                          ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-850'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Volume2 size={13} />
                    <span>白噪音</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTrackType('tts');
                      setShowAddForm(true);
                      setShowOptions(true);
                    }}
                    className={`py-2 rounded-xl text-center text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      newTrackType === 'tts' && showAddForm
                        ? 'bg-amber-600 text-white shadow-sm border border-amber-500'
                        : isDark
                          ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-850'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <AudioLines size={13} />
                    <span>TTS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTrackType('mic');
                      setShowAddForm(true);
                      setShowOptions(true);
                    }}
                    className={`py-2 rounded-xl text-center text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      newTrackType === 'mic' && showAddForm
                        ? 'bg-amber-600 text-white shadow-sm border border-amber-500'
                        : isDark
                          ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-850'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Mic size={13} />
                    <span>录音</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewTrackType('import');
                      setShowAddForm(true);
                      setShowOptions(true);
                    }}
                    className={`py-2 rounded-xl text-center text-[10px] font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      newTrackType === 'import' && showAddForm
                        ? 'bg-amber-600 text-white shadow-sm border border-amber-500'
                        : isDark
                          ? 'text-stone-400 hover:text-stone-100 hover:bg-stone-850'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    <Upload size={13} />
                    <span>上传</span>
                  </button>
                </div>

                {/* Subform context inputs shown when showAddForm is true */}
                {showAddForm && (
                  <div className="space-y-4 pt-1 animate-gpu">
                    {/* Type 1: Built-in */}
                    {newTrackType === 'built-in' && (
                      <div className="space-y-3">
                        <label className={`text-[10px] font-bold block ${isDark ? 'text-stone-400' : 'text-stone-450'}`}>
                          选择分类与白噪音音频
                        </label>
                        
                        {/* Categories Scrollable Tabs */}
                        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none no-wrap">
                          {NOISE_CATALOG.map(cat => {
                            const isCatSelected = selectedCategory === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all whitespace-nowrap leading-none ${
                                  isCatSelected
                                    ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                                    : isDark
                                      ? 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                                      : 'bg-white border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-50'
                                }`}
                              >
                                {cat.name}
                              </button>
                            );
                          })}
                        </div>

                        {/* Sounds list of the selected Category */}
                        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                          {(NOISE_CATALOG.find(c => c.id === selectedCategory) || NOISE_CATALOG[0]).sounds.map(s => {
                            const isSelected = selectedASMRId === s.id;
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => setSelectedASMRId(s.id)}
                                className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                                  isSelected 
                                    ? isDark 
                                      ? 'bg-amber-950/40 border-amber-600/60 text-amber-200 font-semibold shadow-sm' 
                                      : 'bg-amber-50 border-amber-400 text-stone-900 font-semibold' 
                                    : isDark 
                                      ? 'bg-stone-950/30 border-stone-850 hover:bg-stone-900 text-stone-400' 
                                      : 'bg-stone-50 border-stone-100 hover:bg-stone-100 text-stone-600'
                                }`}
                              >
                                <div className="text-[11px] font-bold">{s.name}</div>
                                <div className="text-[8px] opacity-40 mt-1 font-mono truncate">{s.filename}</div>
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 bg-amber-600 text-white p-0.5 rounded-full scale-75 animate-bounce">
                                    <Check size={8} strokeWidth={4} />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Type 2: TTS */}
                    {newTrackType === 'tts' && (
                      <div className="space-y-2.5">
                        <label className={`text-[10px] font-bold block ${isDark ? 'text-stone-400' : 'text-stone-450'}`}>
                          输入转换朗读的催眠引导词
                        </label>
                        <textarea
                          value={ttsInput}
                          onChange={(e) => setTtsInput(e.target.value)}
                          placeholder="输入一段舒缓安详的催眠词，例如：深深地吸气，缓缓地呼气，拥抱深夜宁静..."
                          className={`w-full border rounded-xl p-3 text-xs resize-none transition-colors focus:outline-none focus:ring-1 focus:ring-amber-600 h-24 ${
                            isDark 
                              ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600' 
                              : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                          }`}
                        />
                        <p className={`text-[8.5px] leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                          * 播讲特设了轻柔缓慢音调，模拟专业催眠播音引导。
                        </p>
                      </div>
                    )}

                    {/* Type 3: Mic recorder */}
                    {newTrackType === 'mic' && (
                      <div className="space-y-3">
                        <label className="text-[10px] text-stone-400 font-bold block">现场捕捉睡意语录</label>
                        <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center space-y-3 transition-colors ${
                          isDark ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50 border-stone-200/85'
                        }`}>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                            isRecording ? 'bg-red-500 animate-pulse text-white' : recordedUrl ? 'bg-amber-950/30 text-amber-500 border border-amber-900/50' : 'bg-stone-100 text-stone-400'
                          }`}>
                            <Mic size={18} />
                            {isRecording && <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />}
                          </div>
                          
                          <div className={`text-[10px] font-semibold ${isDark ? 'text-stone-300' : 'text-stone-550'}`}>
                            {isRecording 
                              ? `${isRecordingSimulated ? 'AI脑电波合成中...' : '录音进行中...'} ${recordDuration}秒` 
                              : recordedUrl 
                                ? `${isRecordingSimulated ? 'AI低频脑电波已就绪：' : '录音就绪：'}${recordDuration}秒` 
                                : '等待开始'}
                          </div>

                          {isRecordingSimulated && (
                            <div className="p-2.5 rounded-xl text-left bg-amber-500/10 border border-amber-500/20 text-[9px] leading-relaxed text-amber-700 font-medium">
                              ⚠️ <strong>伴眠仪智慧提示</strong>：检测到当前环境无法读取物理麦克风（如沙箱/无麦等），已为您优雅加载<strong>「136.1Hz宇宙舒享禅鸣」模拟录制器</strong>。该技术利用 Theta 双攻脑电波原理生成真实的合成助眠声效，让您无需物理硬件亦能完美调制、试听和叠加属于您的催眠引导音。
                            </div>
                          )}

                          <div className="flex gap-2">
                            {!isRecording ? (
                              <button
                                type="button"
                                onClick={startRecording}
                                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[10px]"
                              >
                                {recordedUrl ? '重新录制' : '开始录制'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={stopRecording}
                                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-[10px]"
                              >
                                停止录音
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Type 4: Upload */}
                    {newTrackType === 'import' && (
                      <div className="space-y-3">
                        <label className="text-[10px] text-stone-400 font-bold block">本地自然音源导入</label>
                        {importedFile ? (
                          <div className={`p-3 border rounded-xl flex items-center justify-between transition-colors ${
                            isDark ? 'bg-stone-950/45 border-stone-850' : 'bg-stone-50 border-stone-200'
                          }`}>
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileAudio className="text-amber-600 flex-shrink-0" size={14} />
                              <div className="overflow-hidden">
                                <span className={`text-[11px] font-semibold block truncate ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{importedFile.name}</span>
                                <span className="text-[8px] text-stone-450">{importedFile.size} · {Math.ceil(importedFile.duration)}s</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setImportedFile(null)}
                              className="p-1 hover:bg-stone-200/10 rounded text-stone-400 hover:text-stone-50 transition-colors"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className={`border border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                            isDark 
                              ? 'border-stone-850 hover:border-amber-500 bg-stone-950/30' 
                              : 'border-stone-250 hover:border-amber-500 bg-stone-50 hover:bg-stone-100/60'
                          }`}>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <Upload className="text-stone-450 mb-2" size={18} />
                            <span className={`text-[10px] font-semibold ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>选取音频文件</span>
                            <span className="text-[8px] text-stone-550 block mt-0.5">MP3 / WAV / M4A 助眠声效</span>
                          </label>
                        )}
                      </div>
                    )}

                    {/* Operational Actions */}
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setShowOptions(false);
                        }}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold ${
                          isDark 
                            ? 'bg-stone-800 hover:bg-stone-750 text-stone-300' 
                            : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                        }`}
                      >
                        取消
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmAddTrack}
                        className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold shadow-sm border border-amber-500"
                      >
                        确定叠加
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified bottom action console */}
      <div className={`border rounded-[24px] p-5 shadow-md transition-all duration-300 ${
        isDark 
          ? 'bg-stone-900/90 border-stone-850 shadow-black/20 text-stone-100' 
          : 'bg-white/95 border-stone-200/60 shadow-stone-200/10 text-stone-800'
      }`}>
        <div className="flex items-center justify-center gap-4">
          
          {/* Button 1: 试听 */}
          <button
            type="button"
            onClick={() => setIsAudible(!isAudible)}
            className={`flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl border text-xs font-bold transition-all select-none shadow-sm active:scale-95 ${
              isAudible 
                ? 'bg-amber-600 border-amber-500 text-white font-bold' 
                : isDark
                  ? 'bg-stone-950 border-stone-800 text-stone-300 hover:bg-stone-900'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {isAudible ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
            <span>{isAudible ? '停止试听' : '音频试听'}</span>
          </button>

          {/* Button 2: 保存 */}
          <button
            type="button"
            onClick={() => {
              if (mixerTracks.length === 0) {
                alert("请至少添加一个混音轨道后再进行保存！");
                return;
              }
              let maxNum = 0;
              savedTracks.forEach(t => {
                const match = t.name.match(/^音乐-(\d+)$/);
                if (match) {
                  const num = parseInt(match[1], 10);
                  if (num > maxNum) {
                    maxNum = num;
                  }
                }
              });
              setMixName(`音乐-${maxNum + 1}`);
              setShowSaveModal(true);
            }}
            className="flex-grow sm:flex-grow-0 px-8 py-3.5 bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 border border-amber-500 whitespace-nowrap"
          >
            <Save size={13} />
            <span>保存</span>
          </button>

          {/* Button 3: 下载 */}
          <button
            type="button"
            disabled={isDownloading}
            onClick={handleDownloadMix}
            className={`flex-grow sm:flex-grow-0 px-8 py-3.5 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 border whitespace-nowrap ${
              isDownloading
                ? 'opacity-60 cursor-not-allowed bg-stone-100 text-stone-400 border-stone-200'
                : isDark 
                  ? 'bg-stone-850 hover:bg-stone-800 text-stone-200 border-stone-800' 
                  : 'bg-white hover:bg-stone-50 text-stone-750 border-stone-200'
            }`}
          >
            {isDownloading ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600/30 border-t-amber-600 animate-spin" />
            ) : (
              <Download size={13} />
            )}
            <span>{isDownloading ? '正在合成...' : '下载音频'}</span>
          </button>

        </div>
      </div>

      {/* Save Name Modal Dialog (与曼陀罗画保持一致) */}
      <AnimatePresence>
        {showSaveModal && (
          <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-gpu">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-sm rounded-[24px] p-6 space-y-4 border shadow-xl ${
                isDark 
                  ? 'bg-stone-900 border-stone-800 text-stone-100 shadow-stone-950/30' 
                  : 'bg-white border-stone-200 text-stone-800'
              }`}
            >
              <div className="space-y-1">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-600" />
                  <span>保存专属伴眠曲</span>
                </h3>
              </div>

              <input
                type="text"
                autoFocus
                required
                value={mixName}
                onChange={(e) => setMixName(e.target.value)}
                placeholder="命名这首专属伴眠曲 (例如：晚安雨林)..."
                className={`w-full border rounded-xl px-3.5 py-3 text-xs outline-none transition-all focus:ring-1 focus:ring-amber-600 ${
                  isDark 
                    ? 'bg-stone-950 border-stone-850 text-stone-100 placeholder-stone-600' 
                    : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                }`}
              />

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold ${
                    isDark 
                      ? 'bg-stone-800 hover:bg-stone-750 text-stone-300' 
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveMix()}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white shadow-sm active:scale-95 border border-amber-500"
                >
                  确认保存
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern success toast */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-stone-800 border border-stone-700 text-stone-100 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-md z-50 text-xs font-semibold tracking-wide animate-gpu"
          >
            <Check size={16} strokeWidth={2.5} className="text-amber-400" />
            <span>合声保存成功！已完美同步到舒缓颂钵的晚安乐库。</span>
          </motion.div>
        )}
      </AnimatePresence>

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
};

export default SoundMixer;
