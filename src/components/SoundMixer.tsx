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
  const [showSaveModal, setShowSaveModal] = useState(false);

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

  const handleSaveMix = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    setShowSaveModal(false);
    setShowSaveSuccess(true);
    setTimeout(() => {
      setShowSaveSuccess(false);
    }, 2000);
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
              
              {/* Dynamic plus trigger */}
              <button
                onClick={() => setShowAddForm(prev => !prev)}
                className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 border border-amber-500"
              >
                {showAddForm ? <X size={12} /> : <Plus size={12} strokeWidth={2.5} />}
                <span>{showAddForm ? '隐藏面板' : '叠加热和音轨'}</span>
              </button>
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
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-3 text-xs text-amber-600 font-semibold hover:underline"
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
                            onClick={() => previewSingleTTS(track.ttsText!, track.volume, track.speed)}
                            className={`p-1.5 rounded-lg text-[10px] font-semibold transition-colors ${
                              isDark 
                                ? 'bg-indigo-950/30 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-900/40' 
                                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                            }`}
                          >
                            单独朗读
                          </button>
                        )}

                        {/* Mute switcher */}
                        <button
                          onClick={() => handleTrackValueChange(track.id, 'active', !track.active)}
                          className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition-all ${
                            track.active
                              ? isDark ? 'bg-amber-950/40 text-amber-500 border-amber-900' : 'bg-amber-50 text-amber-700 border-amber-200'
                              : isDark ? 'bg-stone-900 text-stone-500 border-stone-800' : 'bg-stone-50 text-stone-400 border-stone-200'
                          }`}
                        >
                          {track.active ? '已激活' : '已静音'}
                        </button>

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

                    {/* Symmetrical volume & play speed sliders */}
                    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 border-t pt-3 transition-colors ${
                      isDark ? 'border-stone-850' : 'border-stone-100'
                    }`}>
                      {/* Volume */}
                      <div className="space-y-1 max-w-[180px]">
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

                      {/* Speed/Rate modulation (except built-in, though speed can represent filter sweeps for built-in, showing speed) */}
                      <div className="space-y-1 max-w-[180px]">
                        <div className="flex justify-between items-center text-[10px] font-medium font-semibold">
                          <span className={isDark ? 'text-stone-500' : 'text-stone-450'}>循环速差 (Speed)</span>
                          <span className={`font-mono font-semibold ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>{track.speed.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={track.speed}
                          onChange={(e) => handleTrackValueChange(track.id, 'speed', parseFloat(e.target.value))}
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
          
          <AnimatePresence mode="wait">
            {/* The Plus wizard form */}
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`border rounded-3xl p-6 space-y-5 shadow-sm transition-colors duration-300 ${
                  isDark 
                    ? 'bg-stone-900/80 border-stone-800 text-stone-100 shadow-md shadow-stone-950/20' 
                    : 'bg-white/95 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex justify-between items-center border-b pb-2 transition-colors border-stone-250/20">
                  <span className={`text-xs font-bold ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>配戴新伴眠轨</span>
                  <button 
                    onClick={() => setShowAddForm(false)}
                    className="p-1 hover:bg-stone-100/10 rounded-full text-stone-400 hover:text-stone-50 transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Symmetrical segmented tab for type selection */}
                <div className={`grid grid-cols-4 p-1 rounded-2xl border transition-colors ${
                  isDark ? 'bg-stone-950 border-stone-850' : 'bg-stone-100 border-stone-200/50'
                }`}>
                  <button
                    onClick={() => setNewTrackType('built-in')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'built-in' 
                        ? isDark 
                          ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60' 
                          : 'bg-white text-stone-800 shadow-sm border border-stone-200/20' 
                        : isDark
                          ? 'text-stone-500 hover:text-stone-300'
                          : 'text-stone-400 hover:text-stone-750'
                    }`}
                  >
                    <Volume2 size={11} />
                    <span>自然</span>
                  </button>

                  <button
                    onClick={() => setNewTrackType('tts')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'tts' 
                        ? isDark 
                          ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60' 
                          : 'bg-white text-stone-800 shadow-sm border border-stone-200/20' 
                        : isDark
                          ? 'text-stone-500 hover:text-stone-300'
                          : 'text-stone-400 hover:text-stone-750'
                    }`}
                  >
                    <AudioLines size={11} />
                    <span>朗读</span>
                  </button>

                  <button
                    onClick={() => setNewTrackType('mic')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'mic' 
                        ? isDark 
                          ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60' 
                          : 'bg-white text-stone-800 shadow-sm border border-stone-200/20' 
                        : isDark
                          ? 'text-stone-500 hover:text-stone-300'
                          : 'text-stone-400 hover:text-stone-750'
                    }`}
                  >
                    <Mic size={11} />
                    <span>录音</span>
                  </button>

                  <button
                    onClick={() => setNewTrackType('import')}
                    className={`py-2 px-1 text-center rounded-xl text-[10px] font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      newTrackType === 'import' 
                        ? isDark 
                          ? 'bg-stone-800 text-stone-100 shadow-sm border border-stone-700/60' 
                          : 'bg-white text-stone-800 shadow-sm border border-stone-200/20' 
                        : isDark
                          ? 'text-stone-500 hover:text-stone-300'
                          : 'text-stone-400 hover:text-stone-750'
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
                      <label className={`text-[10px] font-bold block ${isDark ? 'text-stone-400' : 'text-stone-400'}`}>选择内置环境声效</label>
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
                                  ? isDark 
                                    ? 'bg-amber-950/40 border-amber-600/60 text-amber-200 font-semibold shadow-sm shadow-amber-950/40' 
                                    : 'bg-amber-50 border-amber-400 text-stone-900 font-semibold' 
                                  : isDark 
                                    ? 'bg-stone-950/30 border-stone-850 hover:bg-stone-900 text-stone-400' 
                                    : 'bg-stone-50 border-stone-100 hover:bg-stone-100 text-stone-600'
                              }`}
                            >
                              <div className="text-[11px] font-bold">{s.name.split(' ')[0]}</div>
                              <div className="text-[8px] opacity-40 mt-0.5 truncate">{s.desc}</div>
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 bg-amber-600 text-white p-0.5 rounded-full scale-75">
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
                      <label className={`text-[10px] font-bold block ${isDark ? 'text-stone-400' : 'text-stone-400'}`}>输入转换朗读的文字段落</label>
                      <textarea
                        value={ttsInput}
                        onChange={(e) => setTtsInput(e.target.value)}
                        placeholder="输入一段舒缓安详的词句，比如：拥抱深夜，呼气放松..."
                        className={`w-full border rounded-xl p-3 text-xs resize-none transition-colors focus:outline-none focus:ring-1 focus:ring-amber-600 h-24 ${
                          isDark 
                            ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600' 
                            : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400'
                        }`}
                      />
                    </div>
                  )}

                  {/* Type 3: Mic record */}
                  {newTrackType === 'mic' && (
                    <div className="space-y-3">
                      <label className="text-[10px] text-stone-400 font-bold block">现场捕捉睡意亲语</label>
                      <div className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center space-y-3 transition-colors ${
                        isDark ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50 border-stone-200/80'
                      }`}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center relative ${
                          isRecording ? 'bg-red-500 animate-pulse text-white' : recordedUrl ? 'bg-amber-950/30 text-amber-500 border border-amber-900/50' : 'bg-stone-100 text-stone-400'
                        }`}>
                          <Mic size={18} />
                          {isRecording && <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping" />}
                        </div>
                        
                        <div className={`text-[10px] font-semibold ${isDark ? 'text-stone-300' : 'text-stone-500'}`}>
                          {isRecording ? `录音进行中... ${recordDuration}秒` : recordedUrl ? `录音就绪：${recordDuration}秒` : '等待开始'}
                        </div>

                        <div className="flex gap-2">
                          {!isRecording ? (
                            <button
                              type="button"
                              onClick={startRecording}
                              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-[10px]"
                            >
                              {recordedUrl ? '重新录音' : '开始录制'}
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

                  {/* Type 4: File Import */}
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

                  {/* Add action button */}
                  <button
                    type="button"
                    onClick={handleConfirmAddTrack}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-98 shadow-sm border border-amber-500"
                  >
                    <Check size={13} strokeWidth={2.5} />
                    <span>确定叠加此音轨</span>
                  </button>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
              setShowSaveModal(true);
            }}
            className="flex-grow sm:flex-grow-0 px-8 py-3.5 bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 border border-amber-500 whitespace-nowrap"
          >
            <Save size={13} />
            <span>保存混音伴眠曲</span>
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
                <p className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                  这首助眠曲将被同步加进催眠播放器的音轨备选列表中。
                </p>
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

    </div>
  );
};

export default SoundMixer;
