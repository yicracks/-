// Procedural Sound Synthesizer using Web Audio API
// This avoids relying on external host files, offering customizable parameters.

let audioCtx: AudioContext | null = null;

// Node caches for active real-time synthesis
const activeNodes: { [key: string]: {
  gainNode: GainNode;
  sources: AudioNode[];
  updater?: () => void;
} } = {};

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate sound buffers for noise varieties
function createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown', durationSeconds = 4): AudioBuffer {
  const bufferSize = ctx.sampleRate * durationSeconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    // Pink noise approximation (Paul Kellet's refined method)
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // rescue clipping
      b6 = white * 0.115926;
    }
  } else {
    // Brown noise (integration of white noise)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // restore gain
    }
  }
  return buffer;
}

export const AVAILABLE_ASMR_SOUNDS = [
  { id: 'rain', name: 'Rainfall (漫步雨中)', desc: 'Distant cozy raindrops on window pane' },
  { id: 'wind', name: 'Pine Wind (松涛林风)', desc: 'Deep whistling breeze sweeping treetops' },
  { id: 'ocean', name: 'Deep Ocean (深海潮汐)', desc: 'Cyclic rhythmic wave swells' },
  { id: 'crackle', name: 'Campfire (篝火木柴)', desc: 'Warm static wood crackles & warmth' },
  { id: 'bowl', name: 'Singing Bowl (颂钵静心)', desc: 'Pure spiritual resonance' },
  { id: 'thunder', name: 'Soft Thunder (低鸣隐雷)', desc: 'Occasional low rumble' },
];

let thunderInterval: any = null;

export function setSoundVolume(soundId: string, volume: number) {
  try {
    const ctx = getAudioContext();
    if (volume <= 0) {
      stopSound(soundId);
      return;
    }

    // Initialize if not running
    if (!activeNodes[soundId]) {
      startSound(ctx, soundId);
    }

    const nodeInfo = activeNodes[soundId];
    if (nodeInfo) {
      // Smooth transit to avoid audio pops
      nodeInfo.gainNode.gain.setTargetAtTime(volume * 0.3, ctx.currentTime, 0.1);
    }
  } catch (err) {
    console.error("Set volume failed:", err);
  }
}

function startSound(ctx: AudioContext, id: string) {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const sources: AudioNode[] = [];
  let updater: (() => void) | undefined;

  if (id === 'rain') {
    // Rain: Loop pink noise + soft bandpass
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'pink');
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1600;

    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();

    sources.push(noise, filter);

  } else if (id === 'wind') {
    // Wind: Sweeping bandpass pink noise plus randomized LFO
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'pink');
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4.0;
    filter.frequency.value = 350;

    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();

    sources.push(noise, filter);

    // Live modulation loop for gust styling
    let angle = 0;
    const intervalId = setInterval(() => {
      if (!activeNodes['wind']) {
        clearInterval(intervalId);
        return;
      }
      angle += 0.05;
      // sweep frequency between 180Hz and 650Hz
      const freq = 400 + Math.sin(angle) * 180 + Math.cos(angle * 0.6) * 70;
      filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.2);
    }, 100);

    updater = () => clearInterval(intervalId);

  } else if (id === 'ocean') {
    // Ocean: Sweeping brown noise with slow LFO cycle (6s period)
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'brown');
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.2, ctx.currentTime);

    noise.connect(filter);
    filter.connect(lfoGain);
    lfoGain.connect(masterGain);
    noise.start();

    sources.push(noise, filter, lfoGain);

    // Cyclic wave oscillation loop
    let angle = 0;
    const intervalId = setInterval(() => {
      if (!activeNodes['ocean']) {
        clearInterval(intervalId);
        return;
      }
      angle += 0.03; // Waves sweep around 5-7 seconds
      const gainVal = 0.5 + Math.sin(angle) * 0.45;
      lfoGain.gain.setTargetAtTime(gainVal, ctx.currentTime, 0.3);
      filter.frequency.setValueAtTime(300 + gainVal * 300, ctx.currentTime);
    }, 150);

    updater = () => clearInterval(intervalId);

  } else if (id === 'crackle') {
    // Crackle: low rumbling brown noise + randomized crackling micro impluses
    const rumble = ctx.createBufferSource();
    rumble.buffer = createNoiseBuffer(ctx, 'brown');
    rumble.loop = true;
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 120;

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(masterGain);
    rumble.start();
    sources.push(rumble, rumbleFilter);

    // Spark micro pops
    const intervalId = setInterval(() => {
      if (!activeNodes['crackle']) {
        clearInterval(intervalId);
        return;
      }
      if (Math.random() < 0.4) {
        // Quick high frequency pop
        const osc = ctx.createOscillator();
        const popGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = 1500 + Math.random() * 2000;
        
        popGain.gain.setValueAtTime(0.01 + Math.random() * 0.03, ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
        
        osc.connect(popGain);
        popGain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      }
    }, 60);

    updater = () => clearInterval(intervalId);

  } else if (id === 'bowl') {
    // Pure harmonics of singing bowl (Frequencies mimicking 128Hz, 256Hz, 384Hz)
    const rootFreq = 144;
    const frequencies = [rootFreq, rootFreq * 2, rootFreq * 3.01, rootFreq * 4.98];
    const gains = [0.4, 0.25, 0.15, 0.08];

    const oscillators: OscillatorNode[] = [];
    frequencies.forEach((f, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      oscGain.gain.setValueAtTime(gains[index], ctx.currentTime);

      // Add gentle volume vibratos
      const rate = 0.2 + index * 0.1;
      const intervalId = setInterval(() => {
        if (!activeNodes['bowl']) {
          clearInterval(intervalId);
          return;
        }
        const vib = gains[index] * (0.8 + Math.sin(Date.now() / 1000 * rate) * 0.2);
        oscGain.gain.setTargetAtTime(vib, ctx.currentTime, 0.3);
      }, 100);

      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start();
      sources.push(osc, oscGain);
    });

  } else if (id === 'thunder') {
    // Constant silent sound
    const dummyOsc = ctx.createOscillator();
    dummyOsc.frequency.value = 1;
    dummyOsc.connect(masterGain);
    dummyOsc.start();
    sources.push(dummyOsc);

    // Rumble interval
    const triggerThunder = () => {
      if (!activeNodes['thunder']) return;
      const source = ctx.createBufferSource();
      source.buffer = createNoiseBuffer(ctx, 'brown', 6);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 5);

      const thunderGain = ctx.createGain();
      thunderGain.gain.setValueAtTime(0, ctx.currentTime);
      thunderGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.4);
      thunderGain.gain.setValueAtTime(0.5, ctx.currentTime + 0.6);
      thunderGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5.5);

      source.connect(filter);
      filter.connect(thunderGain);
      thunderGain.connect(masterGain);
      source.start();
    };

    triggerThunder(); // first play immediately
    const intervalId = setInterval(triggerThunder, 12000); // Trigger every 12 seconds
    updater = () => clearInterval(intervalId);
  }

  activeNodes[id] = {
    gainNode: masterGain,
    sources,
    updater
  };
}

export function stopSound(soundId: string) {
  const nodeInfo = activeNodes[soundId];
  if (nodeInfo) {
    if (nodeInfo.updater) nodeInfo.updater();
    try {
      nodeInfo.gainNode.disconnect();
    } catch (e) {}
    delete activeNodes[soundId];
  }
}

export function stopAllSounds() {
  Object.keys(activeNodes).forEach(id => {
    stopSound(id);
  });
}

// Custom Speech Synthesizer TTS (Text-to-Speech)
export function playTextSpeech(text: string, onEnd?: () => void) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // kill existing readings
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.55; // gentle, comforting slow pace (催眠引导语柔和舒缓)
    utterance.pitch = 0.85; // deep comforting warmer tone
    
    // Choose high quality regional mandarin or generic voice
    const voices = window.speechSynthesis.getVoices();
    const premiumZhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('ZH'));
    if (premiumZhVoice) {
      utterance.voice = premiumZhVoice;
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  } else {
    alert("Speech Synthesis is not natively supported by your browser environment.");
  }
}

export function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
