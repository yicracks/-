export type DrawingTool = 'brush' | 'line' | 'curve' | 'circle' | 'ellipse' | 'leaf' | 'moon' | 'star' | 'rect';
export type AnimationMode = 'none' | 'nested-zoom';

export interface MandalaSettings {
  count: number; // number of sectors
  brushColor: string;
  brushSize: number;
  tool: DrawingTool;
  animation: AnimationMode;
  animationSpeed: number;   // 1-5, speed multiplier
  animationDensity: number; // 2-10, number of nested circles
  maxZoomScale: number;     // 2.0-8.0, maximum multiplier scale
}

export interface Point {
  x: number;
  y: number;
}

export interface SavedMandala {
  id: string;
  name: string;
  dataUrl: string;
}

export interface MixerTrack {
  id: string;
  type: 'built-in' | 'tts' | 'mic' | 'import';
  name: string;
  volume: number; // 0 to 1
  speed: number;  // 0.5 to 2.0
  active: boolean;
  soundId?: string;       // for built-in
  ttsText?: string;       // for tts
  recordedUrl?: string;   // for mic
  importDataUrl?: string; // for import
  customFileName?: string; // for import
  duration?: number;
}

export interface SavedTrack {
  id: string;
  name: string;
  sounds: { [soundId: string]: number }; // volume of each sound ID (0 to 1)
  ttsText?: string;
  customAudioName?: string;
  customAudioDataUrl?: string;
  recordedAudioName?: string;
  recordedAudioDataUrl?: string;
  maxDuration?: number; // total maximum duration of the tracks, in seconds
  mixerTracks?: MixerTrack[]; // optional stack of infinite tracks
}
