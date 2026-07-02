// Procedural Sound Synthesizer using Web Audio API
// This avoids relying on external host files, offering customizable parameters.
import { NOISE_CATALOG, getSoundById } from './noiseCatalog';

export const AVAILABLE_ASMR_SOUNDS: Array<{ id: string; name: string; desc: string }> = NOISE_CATALOG.flatMap(cat => 
  cat.sounds.map(s => ({
    id: s.id,
    name: `${s.name}`,
    desc: `物理音轨 - 归类于 ${cat.name}`
  }))
);

export function updateAvailableAsmrSounds() {
  AVAILABLE_ASMR_SOUNDS.length = 0;
  NOISE_CATALOG.forEach(cat => {
    cat.sounds.forEach(s => {
      AVAILABLE_ASMR_SOUNDS.push({
        id: s.id,
        name: `${s.name}`,
        desc: `物理音轨 - 归类于 ${cat.name}`
      });
    });
  });
}

// HTML5 standard Audio elements cache for looping physical white noise files
const physicalAudioCache: { [soundId: string]: HTMLAudioElement } = {};

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

let thunderInterval: any = null;

export function getProceduralSynthId(soundId: string): string | null {
  const s = soundId.toLowerCase();
  
  // Standard built-in synthesized sounds
  if (s === 'rain' || s.includes('rain-') || s === 'rain-light-rain' || s === 'rain-heavy-downpour' || s === 'rain-window-pane' || s === 'rain-forest-shower') return 'rain';
  if (s === 'wind' || s.includes('wind-') || s === 'nature-wind' || s === 'nature-gale' || s === 'nature-pine' || s === 'nature-leaf') return 'wind';
  if (s === 'ocean' || s.includes('waves') || s === 'nature-waves' || s === 'nature-shoreline' || s === 'nature-underwater' || s === 'nature-waterfall') return 'ocean';
  if (s === 'crackle' || s.includes('campfire') || s === 'nature-campfire' || s === 'nature-hearth' || s === 'nature-forestfire') return 'crackle';
  if (s === 'bowl' || s.includes('singing-bowl') || s === 'things-singing-bowl' || s === 'things-temple-bell' || s === 'things-tuning-fork') return 'bowl';
  if (s === 'thunder' || s === 'rain-thunder' || s.includes('thunder')) return 'thunder';

  // Specific BGM synth triggers
  if (s.includes('calming-night') || s.includes('calming_night') || s === 'bgm-calming-night') return 'bgm-calming-night';
  if (s.includes('cozy-rain') || s.includes('cozy_rain') || s === 'bgm-cozy-rain') return 'bgm-cozy-rain';
  if (s.includes('magical-forest') || s.includes('magical_forest') || s === 'bgm-magical-forest') return 'bgm-magical-forest';
  if (s.includes('peaceful-midnight') || s.includes('peaceful_midnight') || s === 'bgm-peaceful-midnight') return 'bgm-peaceful-midnight';
  if (s.includes('soft-tide') || s.includes('soft_tide') || s === 'bgm-soft-tide') return 'bgm-soft-tide';
  if (s.includes('soul-frequencies') || s.includes('soul_frequencies') || s === 'bgm-soul-frequencies') return 'bgm-soul-frequencies';

  return null;
}

export function setSoundVolume(soundId: string, volume: number) {
  try {
    if (volume <= 0) {
      stopSound(soundId);
      return;
    }

    // 1. Try playing from physical audio files first (the real high-quality recordings)
    const physicalSound = getSoundById(soundId);
    let hasPlayedPhysical = false;

    if (physicalSound) {
      let audio = physicalAudioCache[soundId];
      if (!audio) {
        audio = new Audio(physicalSound.url);
        audio.loop = true;
        physicalAudioCache[soundId] = audio;
      }
      audio.volume = Math.min(1.0, Math.max(0, volume));
      if (audio.paused) {
        audio.play()
          .then(() => {
            // Successfully started physical playback! Stop any procedural fallback to prevent double-play.
            const synthId = getProceduralSynthId(soundId);
            if (synthId && activeNodes[synthId]) {
              const nodeInfo = activeNodes[synthId];
              if (nodeInfo.updater) nodeInfo.updater();
              try {
                nodeInfo.gainNode.disconnect();
              } catch (e) {}
              delete activeNodes[synthId];
            }
          })
          .catch(err => {
            console.warn(`Physical sound play delayed/prevented: ${physicalSound.url}`, err);
          });
      }
      hasPlayedPhysical = true;
    }

    // 2. Play Web Audio procedural synthesis ONLY if we did not have a physical sound!
    if (!hasPlayedPhysical) {
      const synthId = getProceduralSynthId(soundId);
      if (synthId) {
        const ctx = getAudioContext();
        if (!activeNodes[synthId]) {
          startSound(ctx, synthId);
        }

        const nodeInfo = activeNodes[synthId];
        if (nodeInfo) {
          // Smooth transit to avoid audio pops
          nodeInfo.gainNode.gain.setTargetAtTime(volume * (synthId.startsWith('bgm-') ? 0.6 : 0.3), ctx.currentTime, 0.1);
        }
      }
    } else {
      // If we are playing physical sound, ensure any procedural node for this sound is stopped
      const synthId = getProceduralSynthId(soundId);
      if (synthId && activeNodes[synthId]) {
        const nodeInfo = activeNodes[synthId];
        if (nodeInfo.updater) nodeInfo.updater();
        try {
          nodeInfo.gainNode.disconnect();
        } catch (e) {}
        delete activeNodes[synthId];
      }
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
  } else if (id === 'bgm-calming-night') {
    // Warm low brown noise breeze
    const breeze = ctx.createBufferSource();
    breeze.buffer = createNoiseBuffer(ctx, 'brown', 4);
    breeze.loop = true;
    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.setValueAtTime(160, ctx.currentTime);
    breeze.connect(breezeFilter);
    breezeFilter.connect(masterGain);
    breeze.start();
    sources.push(breeze, breezeFilter);

    // Dynamic pentatonic C Major harp melody
    const harpNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const playHarp = () => {
      if (!activeNodes['bgm-calming-night']) return;
      try {
        const osc = ctx.createOscillator();
        const pluckGain = ctx.createGain();
        osc.type = 'sine';
        const note = harpNotes[Math.floor(Math.random() * harpNotes.length)];
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        pluckGain.gain.setValueAtTime(0, ctx.currentTime);
        pluckGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.0);
        osc.connect(pluckGain);
        pluckGain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 3.1);
      } catch (e) {}
    };

    // Soft high-pitched cricket clicks
    const playCrickets = () => {
      if (!activeNodes['bgm-calming-night']) return;
      try {
        const osc = ctx.createOscillator();
        const chirpGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(4500, ctx.currentTime);
        chirpGain.gain.setValueAtTime(0.002, ctx.currentTime);
        chirpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
        osc.connect(chirpGain);
        chirpGain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
      } catch (e) {}
    };

    const intervalId = setInterval(() => {
      if (Math.random() < 0.4) playHarp();
      if (Math.random() < 0.6) playCrickets();
    }, 1100);
    updater = () => clearInterval(intervalId);

  } else if (id === 'bgm-cozy-rain') {
    // Rain background pink noise
    const rain = ctx.createBufferSource();
    rain.buffer = createNoiseBuffer(ctx, 'pink', 4);
    rain.loop = true;
    const rainFilter = ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1400, ctx.currentTime);
    rain.connect(rainFilter);
    rainFilter.connect(masterGain);
    rain.start();
    sources.push(rain, rainFilter);

    // Eb Major Pentatonic meditative harp
    const harpNotes = [311.13, 349.23, 392.00, 466.16, 523.25, 622.25, 698.46, 783.99];
    const playHarp = () => {
      if (!activeNodes['bgm-cozy-rain']) return;
      try {
        const osc = ctx.createOscillator();
        const pluckGain = ctx.createGain();
        osc.type = 'sine';
        const note = harpNotes[Math.floor(Math.random() * harpNotes.length)];
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        pluckGain.gain.setValueAtTime(0, ctx.currentTime);
        pluckGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.15);
        pluckGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.0);
        osc.connect(pluckGain);
        pluckGain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 4.1);
      } catch (e) {}
    };

    const intervalId = setInterval(() => {
      if (Math.random() < 0.45) playHarp();
    }, 1300);
    updater = () => clearInterval(intervalId);

  } else if (id === 'bgm-magical-forest') {
    // Forest wind sweep
    const wind = ctx.createBufferSource();
    wind.buffer = createNoiseBuffer(ctx, 'pink', 4);
    wind.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(3.0, ctx.currentTime);
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    wind.connect(filter);
    filter.connect(masterGain);
    wind.start();
    sources.push(wind, filter);

    let angle = 0;
    const windInterval = setInterval(() => {
      if (!activeNodes['bgm-magical-forest']) return;
      angle += 0.04;
      const f = 280 + Math.sin(angle) * 120;
      filter.frequency.setTargetAtTime(f, ctx.currentTime, 0.3);
    }, 120);

    // Forest chimes & bells
    const bellNotes = [440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
    const playBell = () => {
      if (!activeNodes['bgm-magical-forest']) return;
      try {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const bellGain = ctx.createGain();
        const f = bellNotes[Math.floor(Math.random() * bellNotes.length)];
        osc1.frequency.setValueAtTime(f, ctx.currentTime);
        osc2.frequency.setValueAtTime(f * 1.503, ctx.currentTime);
        osc1.type = 'sine';
        osc2.type = 'triangle';
        bellGain.gain.setValueAtTime(0, ctx.currentTime);
        bellGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.05);
        bellGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);
        osc1.connect(bellGain);
        osc2.connect(bellGain);
        bellGain.connect(masterGain);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 2.6);
        osc2.stop(ctx.currentTime + 2.6);
      } catch (e) {}
    };

    const intervalId = setInterval(() => {
      if (Math.random() < 0.35) playBell();
    }, 1500);

    updater = () => {
      clearInterval(windInterval);
      clearInterval(intervalId);
    };

  } else if (id === 'bgm-peaceful-midnight') {
    // Ultra peaceful 110Hz and 165Hz ambient dyad pad
    try {
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const padGainA = ctx.createGain();
      const padGainB = ctx.createGain();
      
      oscA.type = 'sine';
      oscB.type = 'sine';
      oscA.frequency.setValueAtTime(110, ctx.currentTime);
      oscB.frequency.setValueAtTime(165, ctx.currentTime);
      
      padGainA.gain.setValueAtTime(0.15, ctx.currentTime);
      padGainB.gain.setValueAtTime(0.09, ctx.currentTime);
      
      oscA.connect(padGainA).connect(masterGain);
      oscB.connect(padGainB).connect(masterGain);
      oscA.start();
      oscB.start();
      sources.push(oscA, oscB, padGainA, padGainB);
    } catch (e) {}

    // Low wind brown noise
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'brown', 4);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(100, ctx.currentTime);
    noise.connect(filter);
    filter.connect(masterGain);
    noise.start();
    sources.push(noise, filter);

    // Midnight harp notes
    const harpNotes = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00];
    const playHarp = () => {
      if (!activeNodes['bgm-peaceful-midnight']) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const note = harpNotes[Math.floor(Math.random() * harpNotes.length)];
        osc.frequency.setValueAtTime(note, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 5.0);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 5.1);
      } catch (e) {}
    };

    const intervalId = setInterval(() => {
      if (Math.random() < 0.3) playHarp();
    }, 2000);
    updater = () => clearInterval(intervalId);

  } else if (id === 'bgm-soft-tide') {
    // Ocean tide swells brown noise
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 'brown', 4);
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, ctx.currentTime);
    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.1, ctx.currentTime);
    noise.connect(filter).connect(waveGain).connect(masterGain);
    noise.start();
    sources.push(noise, filter, waveGain);

    let angle = 0;
    const waveLoop = setInterval(() => {
      if (!activeNodes['bgm-soft-tide']) return;
      angle += 0.04;
      const swell = 0.4 + Math.sin(angle) * 0.35;
      waveGain.gain.setTargetAtTime(swell, ctx.currentTime, 0.4);
      filter.frequency.setTargetAtTime(150 + swell * 250, ctx.currentTime, 0.4);
    }, 150);

    // Intimate piano major/minor chord triads
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [349.23, 440.00, 523.25, 587.33], // Fmaj7
      [220.00, 329.63, 392.00, 440.00], // Am7
      [196.00, 293.66, 392.00, 440.00]  // G6
    ];

    const playPianoChord = () => {
      if (!activeNodes['bgm-soft-tide']) return;
      try {
        const chord = chords[Math.floor(Math.random() * chords.length)];
        chord.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          const delay = idx * 0.12;
          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime + delay);
          gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + delay + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 4.5);
          osc.connect(gain).connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + delay + 4.7);
        });
      } catch (e) {}
    };

    const pianoInterval = setInterval(() => {
      if (Math.random() < 0.5) playPianoChord();
    }, 4000);

    updater = () => {
      clearInterval(waveLoop);
      clearInterval(pianoInterval);
    };

  } else if (id === 'bgm-soul-frequencies') {
    // 528Hz pure frequency binaural phase beats
    try {
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const pannerLeft = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null;
      const pannerRight = (ctx as any).createStereoPanner ? (ctx as any).createStereoPanner() : null;
      
      oscLeft.type = 'sine';
      oscLeft.frequency.setValueAtTime(528, ctx.currentTime);
      oscRight.type = 'sine';
      oscRight.frequency.setValueAtTime(528.5, ctx.currentTime);
      
      const gainLeft = ctx.createGain();
      const gainRight = ctx.createGain();
      gainLeft.gain.setValueAtTime(0.18, ctx.currentTime);
      gainRight.gain.setValueAtTime(0.18, ctx.currentTime);
      
      if (pannerLeft && pannerRight) {
        pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
        pannerRight.pan.setValueAtTime(1, ctx.currentTime);
        oscLeft.connect(gainLeft).connect(pannerLeft).connect(masterGain);
        oscRight.connect(gainRight).connect(pannerRight).connect(masterGain);
        sources.push(oscLeft, oscRight, gainLeft, gainRight, pannerLeft, pannerRight);
      } else {
        oscLeft.connect(gainLeft).connect(masterGain);
        oscRight.connect(gainRight).connect(masterGain);
        sources.push(oscLeft, oscRight, gainLeft, gainRight);
      }
      
      oscLeft.start();
      oscRight.start();
    } catch (e) {}

    // Sub-harmonic warm body resonance at 132Hz
    try {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(132, ctx.currentTime);
      subGain.gain.setValueAtTime(0.08, ctx.currentTime);
      subOsc.connect(subGain).connect(masterGain);
      subOsc.start();
      sources.push(subOsc, subGain);
    } catch (e) {}

    // Pure resonance bell chimes at 396Hz (fundamental root)
    const playResonanceChime = () => {
      if (!activeNodes['bgm-soul-frequencies']) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(396, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 5.0);
        osc.connect(gain).connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 5.1);
      } catch (e) {}
    };

    const intervalId = setInterval(() => {
      if (Math.random() < 0.4) playResonanceChime();
    }, 3000);
    updater = () => clearInterval(intervalId);
  }

  activeNodes[id] = {
    gainNode: masterGain,
    sources,
    updater
  };
}

export function stopSound(soundId: string) {
  // Stop physical sound if active
  const audio = physicalAudioCache[soundId];
  if (audio) {
    try {
      audio.pause();
      audio.currentTime = 0;
    } catch (e) {}
    delete physicalAudioCache[soundId];
  }

  // Stop Web Audio procedural synth node if active
  const nodeInfo = activeNodes[soundId];
  if (nodeInfo) {
    if (nodeInfo.updater) nodeInfo.updater();
    try {
      nodeInfo.gainNode.disconnect();
    } catch (e) {}
    delete activeNodes[soundId];
  }

  // Also stop the procedural node keyed by its synth ID to prevent lingering synthetic tones
  const synthId = getProceduralSynthId(soundId);
  if (synthId && activeNodes[synthId]) {
    const sNode = activeNodes[synthId];
    if (sNode.updater) sNode.updater();
    try {
      sNode.gainNode.disconnect();
    } catch (e) {}
    delete activeNodes[synthId];
  }
}

export function stopAllSounds() {
  // Stop all physical sound loops
  Object.keys(physicalAudioCache).forEach(soundId => {
    stopSound(soundId);
  });
  // Stop all Web Audio synthesis layers
  Object.keys(activeNodes).forEach(id => {
    const sNode = activeNodes[id];
    if (sNode.updater) sNode.updater();
    try {
      sNode.gainNode.disconnect();
    } catch (e) {}
    delete activeNodes[id];
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
