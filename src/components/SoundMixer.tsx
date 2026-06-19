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
  Info
} from 'lucide-react';
import { SavedTrack, MixerTrack } from '../types';
import { AVAILABLE_ASMR_SOUNDS, setSoundVolume, stopAllSounds } from '../utils/audioSynth';

interface SoundMixerProps {
  savedTracks: SavedTrack[];
  onAddTrack: (track: SavedTrack) => void;
  onNavigateToTab: (tab: 'player' | 'canvas' | 'mixer') => void;
}

const SoundMixer: React.FC<SoundMixerProps> = ({
  savedTracks,
  onAddTrack,
  onNavigateToTab
}) => {
  // Current stacked tracks in the mixer
  const [mixerTracks, setMixerTracks] = useState<MixerTrack[]>([
    {
      id: 'init-rain',
      type: 'built-in',
      name: '森林漫步雨声 (Rainfall)',
      volume: 0.5,
      speed: 1.0,
      active: true,
      soundId: 'rain'
    },
    {
      id: 'init-bowl',
      type: 'built-in',
      name: '西藏禅意颂钵 (Singing Bowl)',
      volume: 0.4,
      speed: 1.0,
      active: true,
      soundId: 'bowl'
    }
  ]);

  // Global trial/audible preview status
  const [isAudible, setIsAudible] = useState(false);

  // Modal / Creator Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTrackType, setNewTrackType] = useState<'built-in' | 'tts' | 'mic' | 'import'>('built-in');

  // Input states for 'built-in' type
  const [selectedASMRId, setSelectedASMRId] = useState<string>('rain');

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

  // Interactive dynamic audio nodes references for playing preview overlays
  const audioNodesRef = useRef<{ [trackId: string]: HTMLAudioElement }>({});

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

  // Micro recorder tools
  const startRecording = async () => {
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
        alert("浏览器不支持获取麦克风资源！");
      }
    } catch (err) {
      console.error("Mic error:", err);
      alert("无法访问麦克风，请检查并授予网页麦克风权限！");
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
  const previewSingleTTS = (text: string, vol: number, speed: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = vol;
      utterance.rate = speed;
      utterance.pitch = 0.9;
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

  const handleSaveMix = (e: React.FormEvent) => {
    e.preventDefault();
    if (mixerTracks.length === 0) {
      alert("请至少添加一个混音轨道后再进行保存！");
      return;
    }
    const finalName = mixName.trim() || `晚安叠加合声 #${savedTracks.length + 1}`;

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
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto py-2 space-y-6">
      
      {/* Header introduction banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-orange-500/10 via-indigo-500/5 to-neutral-900 border border-white/5 p-6 rounded-3xl">
        <div className="space-y-1">
          <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <Sliders className="text-orange-400 animate-pulse" size={18} />
            无限叠轨睡眠吉他合成器 (Infinite Bedtime Multitracks)
          </h2>
          <p className="text-xs text-white/50">
            自定义堆叠任意数量自然拟音、AI朗读、现场亲密录音或外置ASMR。独立设定每一项的音量、循环速率及播放速度。
          </p>
        </div>

        {/* Global audible play monitor toggle */}
        <button
          onClick={() => {
            if (isAudible) {
              setIsAudible(false);
            } else {
              setIsAudible(true);
            }
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs font-bold transition-all select-none ${
            isAudible 
              ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20' 
              : 'bg-white/5 text-white/60 border-white/5 hover:bg-white/10'
          }`}
        >
          {isAudible ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
          <span>{isAudible ? '静音全轨合声' : '试听叠加合声'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left 2 Columns: Stacked multi-tracks dashboard */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-6 space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">配戴组合音轨</span>
                <span className="bg-white/5 px-2.5 py-0.5 rounded-full text-[10px] text-white/50 font-mono">
                  {mixerTracks.length} / 无限
                </span>
              </div>
              
              {/* Dynamic plus trigger */}
              <button
                onClick={() => setShowAddForm(prev => !prev)}
                className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
              >
                {showAddForm ? <X size={12} /> : <Plus size={12} strokeWidth={3} />}
                <span>{showAddForm ? '隐藏面板' : '叠加热和音轨'}</span>
              </button>
            </div>

            {/* Configured track list */}
            {mixerTracks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-2xl bg-neutral-950/20">
                <Music className="text-white/10 mb-2 animate-bounce" size={32} />
                <p className="text-xs text-white/40">当前暂无堆叠音源</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 text-[11px] text-orange-400 font-bold hover:underline"
                >
                  点击上方加号开始制作复合白噪音
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {mixerTracks.map((track) => (
                  <div 
                    key={track.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      track.active
                        ? 'bg-neutral-950/60 border-white/10 shadow-sm'
                        : 'bg-white/2 border-white/5 opacity-50'
                    }`}
                  >
                    {/* Track info header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                          track.type === 'built-in' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                          track.type === 'tts' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                          track.type === 'mic' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                          'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                          {track.type === 'built-in' && <Volume2 size={16} />}
                          {track.type === 'tts' && <AudioLines size={16} />}
                          {track.type === 'mic' && <Mic size={16} />}
                          {track.type === 'import' && <FileAudio size={16} />}
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-2">
                            {track.name}
                          </h4>
                          <span className="text-[9px] text-white/40 capitalize tracking-wider uppercase font-semibold">
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
                            onClick={() => previewSingleTTS(track.ttsText!, track.volume, track.speed)}
                            title="单独试听此条语音"
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/10 text-[10px]"
                          >
                            单独朗读
                          </button>
                        )}

                        {/* Mute switcher */}
                        <button
                          onClick={() => handleTrackValueChange(track.id, 'active', !track.active)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all ${
                            track.active
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : 'bg-white/5 text-white/30 border-white/5'
                          }`}
                        >
                          {track.active ? '激活开' : '静音关'}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleRemoveTrack(track.id)}
                          className="p-2 bg-white/2 hover:bg-red-500/10 border border-white/5 rounded-xl hover:text-red-400 text-white/30 transition-all"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Symmetrical volume & play speed sliders */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-3">
                      {/* Volume */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-white/40">
                          <span>配戴音量</span>
                          <span className="font-mono text-white/70">{Math.round(track.volume * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={track.volume}
                          onChange={(e) => handleTrackValueChange(track.id, 'volume', parseFloat(e.target.value))}
                          className="w-full accent-orange-500/80 bg-neutral-900 h-1.5 rounded cursor-pointer"
                        />
                      </div>

                      {/* Speed/Rate modulation (except built-in, though speed can represent filter sweeps for built-in, showing speed) */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-white/40">
                          <span>循环速差 (Speed)</span>
                          <span className="font-mono text-white/70">{track.speed.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={track.speed}
                          onChange={(e) => handleTrackValueChange(track.id, 'speed', parseFloat(e.target.value))}
                          className="w-full accent-orange-500/80 bg-neutral-900 h-1.5 rounded cursor-pointer"
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
          
          <AnimatePresence mode="wait">
            {/* The Plus wizard form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-neutral-900/60 border border-white/10 rounded-3xl p-6 space-y-5"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">配戴新伴眠轨</span>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="p-1 hover:bg-white/10 rounded-full text-white/40 hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Symmetrical segmented tab for type selection */}
                <div className="grid grid-cols-4 bg-neutral-950 p-1 rounded-2xl border border-white/5">
                  <button
                    onClick={() => setNewTrackType('built-in')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'built-in' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Volume2 size={11} />
                    <span>自然</span>
                  </button>

                  <button
                    onClick={() => setNewTrackType('tts')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'tts' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <AudioLines size={11} />
                    <span>朗读</span>
                  </button>

                  <button
                    onClick={() => setNewTrackType('mic')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'mic' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Mic size={11} />
                    <span>录音</span>
                  </button>

                  <button
                    onClick={() => setNewTrackType('import')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'import' ? 'bg-orange-500 text-white' : 'text-white/40 hover:text-white'
                    }`}
                  >
                    <Upload size={11} />
                    <span>导入</span>
                  </button>
                </div>

                {/* Inputs area based on selected type */}
                <div className="space-y-4 pt-1">
                  
                  {/* Type 1: Built-in */}
                  {newTrackType === 'built-in' && (
                    <div className="space-y-2.5">
                      <label className="text-[10px] text-white/40 font-bold block">选择内置环境声效</label>
                      <div className="grid grid-cols-2 gap-2">
                        {AVAILABLE_ASMR_SOUNDS.map(s => {
                          const isSelected = selectedASMRId === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedASMRId(s.id)}
                              className={`p-3 rounded-xl border text-left transition-all relative ${
                                isSelected 
                                  ? 'bg-orange-500/10 border-orange-500 text-white' 
                                  : 'bg-white/2 border-white/5 hover:bg-white/5 text-white/60'
                              }`}
                            >
                              <div className="text-[11px] font-bold">{s.name.split(' ')[0]}</div>
                              <div className="text-[8px] opacity-40 mt-0.5 truncate">{s.desc}</div>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white p-0.5 rounded-full scale-75">
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
                      <label className="text-[10px] text-white/40 font-bold block">输入转换朗读的文字段落</label>
                      <textarea
                        value={ttsInput}
                        onChange={(e) => setTtsInput(e.target.value)}
                        placeholder="输入一段舒缓安详的词句，比如：拥抱深夜，呼气放松..."
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-orange-500 h-24 resize-none"
                      />
                    </div>
                  )}

                  {/* Type 3: Mic record */}
                  {newTrackType === 'mic' && (
                    <div className="space-y-3">
                      <label className="text-[10px] text-white/40 font-bold block">现场捕捉睡意亲语</label>
                      <div className="flex flex-col items-center justify-center p-4 bg-neutral-950 rounded-2xl border border-white/5 text-center space-y-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                          isRecording ? 'bg-red-500 animate-pulse' : recordedUrl ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/5 text-white/30'
                        }`}>
                          <Mic size={18} />
                          {isRecording && <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />}
                        </div>
                        
                        <div className="text-[10px]">
                          {isRecording ? `录音进行中... ${recordDuration}秒` : recordedUrl ? `录音就绪：${recordDuration}秒` : '等待开始'}
                        </div>

                        <div className="flex gap-2">
                          {!isRecording ? (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 font-bold rounded-lg text-[10px]"
                            >
                              {recordedUrl ? '重新录音' : '开始录制'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={stopRecording}
                              className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 font-bold rounded-lg text-[10px]"
                            >
                              停止录音
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Type 4: File Import */}
                  {newTrackType === 'import' && (
                    <div className="space-y-3">
                      <label className="text-[10px] text-white/40 font-bold block">本地自然音源导入</label>
                      {importedFile ? (
                        <div className="p-3 bg-neutral-950 border border-white/10 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileAudio className="text-orange-400 flex-shrink-0" size={14} />
                            <div className="overflow-hidden">
                              <span className="text-[11px] font-bold text-white block truncate">{importedFile.name}</span>
                              <span className="text-[8px] text-white/50">{importedFile.size} · {Math.ceil(importedFile.duration)}s</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setImportedFile(null)}
                            className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <label className="border border-dashed border-white/10 hover:border-orange-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white/2 hover:bg-white/5 transition-all">
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Upload className="text-white/20 mb-2" size={18} />
                          <span className="text-[10px] font-semibold text-white/70">选取音频文件</span>
                          <span className="text-[8px] text-white/30 block mt-0.5">MWA / MP3 / WAV 助眠自然拟音</span>
                        </label>
                      )}
                    </div>
                  )}

                  {/* Add action button */}
                  <button
                    type="button"
                    onClick={handleConfirmAddTrack}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-md"
                  >
                    <Check size={13} strokeWidth={3} />
                    <span>确定叠加此音轨</span>
                  </button>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Compilation Save Console */}
          <div className="bg-neutral-900/60 border border-white/10 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest flex items-center gap-2 border-b border-white/5 pb-2">
              <Save size={12} className="text-indigo-400" />
              保存当前合声组合 (Save Set)
            </h3>

            <form onSubmit={handleSaveMix} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-white/40">命名您创造的晚安声谱：</label>
                <input
                  type="text"
                  required
                  value={mixName}
                  onChange={(e) => setMixName(e.target.value)}
                  placeholder="例如：深夜松林隐雨、颂钵澄明..."
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-orange-500 hover:bg-orange-600 font-bold text-xs text-white rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/10 active:scale-98"
              >
                <Plus size={14} />
                <span>保存后同步到播放器</span>
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Playback guidelines */}
      <div className="p-4 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-start gap-2.5 max-w-5xl mx-auto">
        <Info size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold text-orange-400 uppercase block">使用小贴士 Tips</span>
          <p className="text-[10px] text-white/40 leading-relaxed">
            保存后音频将自动成为您个人的专属晚安组合，多重音轨的<strong>音量权重和语/播音再生速度</strong>将被完整封装。制作完音乐后，您可以自主点击导航栏 “舒缓颂钵” 随时返回控制台进行伴眠听享，该页面不会发生强制自动跳转，让您的混音灵感专注不被打扰。
          </p>
        </div>
      </div>

      {/* Modern success toast */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-indigo-600 border border-indigo-400 text-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl z-50 text-xs font-bold tracking-wide"
          >
            <Check size={16} strokeWidth={3} />
            <span>合声保存成功！已完美同步到舒缓颂钵的晚安乐库。</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SoundMixer;
