// High-Quality Client-Side Offline Audio Mixer & Synthesizer
// Synthesizes multiple procedural nodes and custom imported audio buffers into a single WAV file.

import { MixerTrack, SavedTrack } from '../types';
import { getProceduralSynthId } from './audioSynth';

// Formats an AudioBuffer into 16-bit stereo WAV container Blob
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = raw PCM
  const bitDepth = 16;
  
  let result: Float32Array;
  if (numOfChan === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }
  
  const bufferByteLen = result.length * 2;
  const wavBuffer = new ArrayBuffer(44 + bufferByteLen);
  const view = new DataView(wavBuffer);
  
  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + bufferByteLen, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numOfChan, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numOfChan * (bitDepth / 8), true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, bufferByteLen, true);
  
  // Write 16-bit integer PCM audio data
  const len = result.length;
  let index = 44;
  for (let i = 0; i < len; i++) {
    let sample = result[i];
    if (sample > 1) sample = 1;
    else if (sample < -1) sample = -1;
    view.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    index += 2;
  }
  
  return new Blob([view], { type: 'audio/wav' });
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  let index = 0;
  let inputIndex = 0;
  
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Generate sound buffers for noise varieties relative to individual contexts
function createNoiseBuffer(ctx: BaseAudioContext, type: 'white' | 'pink' | 'brown', durationSeconds = 4): AudioBuffer {
  const bufferSize = ctx.sampleRate * durationSeconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (type === 'pink') {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11;
      b6 = white * 0.115926;
    }
  } else {
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
  }
  return buffer;
}

// Quiet fetch audio and decode it inside Offline context
async function fetchAndDecodeAudio(ctx: OfflineAudioContext, url: string): Promise<AudioBuffer | null> {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return await ctx.decodeAudioData(arrayBuffer);
  } catch (err) {
    console.error("Failed offline fetch/decode of custom media track:", url, err);
    return null;
  }
}

// Maps a legacy saved track or general config track to list of MixerTracks for rendering
export function savedTrackToMixerTracks(track: SavedTrack): MixerTrack[] {
  if (track.mixerTracks && track.mixerTracks.length > 0) {
    return track.mixerTracks;
  }
  
  const result: MixerTrack[] = [];
  
  if (track.sounds) {
    Object.entries(track.sounds).forEach(([soundId, volume]) => {
      if (volume > 0) {
        result.push({
          id: `built-in-legacy-${soundId}`,
          type: 'built-in',
          name: soundId,
          volume: volume,
          speed: 1.0,
          active: true,
          soundId: soundId
        });
      }
    });
  }
  
  if (track.customAudioDataUrl) {
    result.push({
      id: `imported-custom`,
      type: 'import',
      name: track.customAudioName || '导入音轨',
      volume: 0.8,
      speed: 1.0,
      active: true,
      importDataUrl: track.customAudioDataUrl
    });
  }
  
  if (track.recordedAudioDataUrl) {
    result.push({
      id: `mic-custom`,
      type: 'mic',
      name: track.recordedAudioName || '录音音轨',
      volume: 0.8,
      speed: 1.0,
      active: true,
      recordedUrl: track.recordedAudioDataUrl
    });
  }
  
  return result;
}

// Master synthesizer to render list of active layers off-line
export async function renderMixerTracksToWav(tracks: MixerTrack[], durationSeconds = 60): Promise<Blob> {
  const activeTracks = tracks.filter(t => t.active);
  if (activeTracks.length === 0) {
    throw new Error('没有任何活跃音轨');
  }

  const sampleRate = 44100;
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSeconds, sampleRate);
  
  // Mixed main gain node
  const masterGain = offlineCtx.createGain();
  masterGain.gain.setValueAtTime(0.9, 0); // avoid total clipping
  masterGain.connect(offlineCtx.destination);

  // Compile each component
  for (const track of activeTracks) {
    const trackVolume = track.volume;
    
    // Create an independent channel controller gain
    const channelGain = offlineCtx.createGain();
    channelGain.gain.setValueAtTime(trackVolume, 0);
    channelGain.connect(masterGain);

    if (track.type === 'built-in' && track.soundId) {
      const synthId = getProceduralSynthId(track.soundId);
      if (!synthId) continue;

      // Apply synthId specifics inside the offline graph structure
      if (synthId === 'rain') {
        const noise = offlineCtx.createBufferSource();
        noise.buffer = createNoiseBuffer(offlineCtx, 'pink');
        noise.loop = true;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, 0);

        noise.connect(filter).connect(channelGain);
        noise.start(0);
      } 
      else if (synthId === 'wind') {
        const noise = offlineCtx.createBufferSource();
        noise.buffer = createNoiseBuffer(offlineCtx, 'pink');
        noise.loop = true;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(4.0, 0);
        filter.frequency.setValueAtTime(350, 0);

        noise.connect(filter).connect(channelGain);
        noise.start(0);

        // Sweeping schedule
        let angle = 0;
        for (let t = 0; t < durationSeconds; t += 0.2) {
          angle += 0.1;
          const freq = 400 + Math.sin(angle) * 180 + Math.cos(angle * 0.6) * 70;
          filter.frequency.setValueAtTime(freq, t);
        }
      } 
      else if (synthId === 'ocean') {
        const noise = offlineCtx.createBufferSource();
        noise.buffer = createNoiseBuffer(offlineCtx, 'brown');
        noise.loop = true;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, 0);

        const lfoGain = offlineCtx.createGain();
        lfoGain.gain.setValueAtTime(0.2, 0);

        noise.connect(filter).connect(lfoGain).connect(channelGain);
        noise.start(0);

        let angle = 0;
        for (let t = 0; t < durationSeconds; t += 0.25) {
          angle += 0.05;
          const gainVal = 0.5 + Math.sin(angle) * 0.45;
          lfoGain.gain.setValueAtTime(gainVal, t);
          filter.frequency.setValueAtTime(300 + gainVal * 300, t);
        }
      } 
      else if (synthId === 'crackle') {
        const rumble = offlineCtx.createBufferSource();
        rumble.buffer = createNoiseBuffer(offlineCtx, 'brown');
        rumble.loop = true;
        const rumbleFilter = offlineCtx.createBiquadFilter();
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(120, 0);

        rumble.connect(rumbleFilter).connect(channelGain);
        rumble.start(0);

        // Schedule random spark crackles
        for (let t = 0; t < durationSeconds; t += 0.08) {
          if (Math.random() < 0.4) {
            const osc = offlineCtx.createOscillator();
            const popGain = offlineCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1500 + Math.random() * 2000, t);
            
            popGain.gain.setValueAtTime(0, t);
            popGain.gain.linearRampToValueAtTime(0.01 + Math.random() * 0.03, t + 0.005);
            popGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
            
            osc.connect(popGain).connect(channelGain);
            osc.start(t);
            osc.stop(t + 0.05);
          }
        }
      } 
      else if (synthId === 'bowl') {
        const rootFreq = 144;
        const frequencies = [rootFreq, rootFreq * 2, rootFreq * 3.01, rootFreq * 4.98];
        const gains = [0.4, 0.25, 0.15, 0.08];

        frequencies.forEach((f, idx) => {
          const osc = offlineCtx.createOscillator();
          const oscGain = offlineCtx.createGain();
          
          osc.frequency.setValueAtTime(f, 0);
          oscGain.gain.setValueAtTime(gains[idx], 0);

          osc.connect(oscGain).connect(channelGain);
          osc.start(0);

          const rate = 0.2 + idx * 0.1;
          for (let t = 0; t < durationSeconds; t += 0.2) {
            const vib = gains[idx] * (0.8 + Math.sin(t * rate) * 0.2);
            oscGain.gain.setValueAtTime(vib, t);
          }
        });
      } 
      else if (synthId === 'thunder') {
        for (let t = 2; t < durationSeconds; t += 12) {
          const source = offlineCtx.createBufferSource();
          source.buffer = createNoiseBuffer(offlineCtx, 'brown', 6);
          
          const filter = offlineCtx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(100, t);
          filter.frequency.exponentialRampToValueAtTime(30, t + 5);

          const thunderGain = offlineCtx.createGain();
          thunderGain.gain.setValueAtTime(0, t);
          thunderGain.gain.linearRampToValueAtTime(0.5, t + 0.4);
          thunderGain.gain.setValueAtTime(0.5, t + 0.6);
          thunderGain.gain.exponentialRampToValueAtTime(0.001, t + 5.5);

          source.connect(filter).connect(thunderGain).connect(channelGain);
          source.start(t);
        }
      }
      else if (synthId === 'bgm-calming-night') {
        // brown noise breeze
        const breeze = offlineCtx.createBufferSource();
        breeze.buffer = createNoiseBuffer(offlineCtx, 'brown', 4);
        breeze.loop = true;
        const breezeFilter = offlineCtx.createBiquadFilter();
        breezeFilter.type = 'lowpass';
        breezeFilter.frequency.setValueAtTime(160, 0);
        breeze.connect(breezeFilter).connect(channelGain);
        breeze.start(0);

        // Harp notes scheduled
        const harpNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
        for (let t = 0.5; t < durationSeconds; t += 1.2) {
          if (Math.random() < 0.4) {
            const osc = offlineCtx.createOscillator();
            const pluckGain = offlineCtx.createGain();
            osc.type = 'sine';
            const note = harpNotes[Math.floor(Math.random() * harpNotes.length)];
            osc.frequency.setValueAtTime(note, t);
            pluckGain.gain.setValueAtTime(0, t);
            pluckGain.gain.linearRampToValueAtTime(0.08, t + 0.1);
            pluckGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);
            osc.connect(pluckGain).connect(channelGain);
            osc.start(t);
            osc.stop(t + 3.1);
          }
          if (Math.random() < 0.6) {
            // cricket click
            const osc = offlineCtx.createOscillator();
            const chirpGain = offlineCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(4500, t + Math.random() * 0.5);
            chirpGain.gain.setValueAtTime(0.002, t);
            chirpGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
            osc.connect(chirpGain).connect(channelGain);
            osc.start(t);
            osc.stop(t + 0.06);
          }
        }
      }
      else if (synthId === 'bgm-cozy-rain') {
        const rain = offlineCtx.createBufferSource();
        rain.buffer = createNoiseBuffer(offlineCtx, 'pink', 4);
        rain.loop = true;
        const rainFilter = offlineCtx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(1400, 0);
        rain.connect(rainFilter).connect(channelGain);
        rain.start(0);

        const harpNotes = [311.13, 349.23, 392.00, 466.16, 523.25, 622.25, 698.46, 783.99];
        for (let t = 0.5; t < durationSeconds; t += 1.3) {
          if (Math.random() < 0.45) {
            const osc = offlineCtx.createOscillator();
            const pluckGain = offlineCtx.createGain();
            osc.type = 'sine';
            const note = harpNotes[Math.floor(Math.random() * harpNotes.length)];
            osc.frequency.setValueAtTime(note, t);
            pluckGain.gain.setValueAtTime(0, t);
            pluckGain.gain.linearRampToValueAtTime(0.08, t + 0.15);
            pluckGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.0);
            osc.connect(pluckGain).connect(channelGain);
            osc.start(t);
            osc.stop(t + 4.1);
          }
        }
      }
      else if (synthId === 'bgm-magical-forest') {
        const wind = offlineCtx.createBufferSource();
        wind.buffer = createNoiseBuffer(offlineCtx, 'pink', 4);
        wind.loop = true;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.0, 0);
        filter.frequency.setValueAtTime(300, 0);
        wind.connect(filter).connect(channelGain);
        wind.start(0);

        let angle = 0;
        for (let t = 0; t < durationSeconds; t += 0.15) {
          angle += 0.04;
          const f = 280 + Math.sin(angle) * 120;
          filter.frequency.setValueAtTime(f, t);
        }

        const bellNotes = [440.00, 523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66];
        for (let t = 0.5; t < durationSeconds; t += 1.5) {
          if (Math.random() < 0.35) {
            const osc1 = offlineCtx.createOscillator();
            const osc2 = offlineCtx.createOscillator();
            const bellGain = offlineCtx.createGain();
            const f = bellNotes[Math.floor(Math.random() * bellNotes.length)];
            osc1.frequency.setValueAtTime(f, t);
            osc2.frequency.setValueAtTime(f * 1.503, t);
            osc1.type = 'sine';
            osc2.type = 'triangle';
            bellGain.gain.setValueAtTime(0, t);
            bellGain.gain.linearRampToValueAtTime(0.04, t + 0.05);
            bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
            osc1.connect(bellGain).connect(channelGain);
            osc2.connect(bellGain).connect(channelGain);
            osc1.start(t);
            osc2.start(t);
          }
        }
      }
      else if (synthId === 'bgm-peaceful-midnight') {
        const oscA = offlineCtx.createOscillator();
        const oscB = offlineCtx.createOscillator();
        const padGainA = offlineCtx.createGain();
        const padGainB = offlineCtx.createGain();

        oscA.type = 'sine';
        oscB.type = 'sine';
        oscA.frequency.setValueAtTime(110, 0);
        oscB.frequency.setValueAtTime(165, 0);

        padGainA.gain.setValueAtTime(0.15, 0);
        padGainB.gain.setValueAtTime(0.09, 0);

        oscA.connect(padGainA).connect(channelGain);
        oscB.connect(padGainB).connect(channelGain);
        oscA.start(0);
        oscB.start(0);

        const noise = offlineCtx.createBufferSource();
        noise.buffer = createNoiseBuffer(offlineCtx, 'brown', 4);
        noise.loop = true;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(100, 0);
        noise.connect(filter).connect(channelGain);
        noise.start(0);

        const harpNotes = [196.00, 220.00, 246.94, 293.66, 329.63, 392.00, 440.00];
        for (let t = 0.5; t < durationSeconds; t += 2.0) {
          if (Math.random() < 0.3) {
            const osc = offlineCtx.createOscillator();
            const gain = offlineCtx.createGain();
            osc.type = 'sine';
            const note = harpNotes[Math.floor(Math.random() * harpNotes.length)];
            osc.frequency.setValueAtTime(note, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.08, t + 0.25);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 5.0);
            osc.connect(gain).connect(channelGain);
            osc.start(t);
            osc.stop(t + 5.1);
          }
        }
      }
      else if (synthId === 'bgm-soft-tide') {
        const noise = offlineCtx.createBufferSource();
        noise.buffer = createNoiseBuffer(offlineCtx, 'brown', 4);
        noise.loop = true;
        const filter = offlineCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, 0);
        const waveGain = offlineCtx.createGain();
        waveGain.gain.setValueAtTime(0.1, 0);
        noise.connect(filter).connect(waveGain).connect(channelGain);
        noise.start(0);

        let angle = 0;
        for (let t = 0; t < durationSeconds; t += 0.15) {
          angle += 0.04;
          const swell = 0.4 + Math.sin(angle) * 0.35;
          waveGain.gain.setValueAtTime(swell, t);
          filter.frequency.setValueAtTime(150 + swell * 250, t);
        }

        const chords = [
          [261.63, 329.63, 392.00, 493.88], // Cmaj7
          [349.23, 440.00, 523.25, 587.33], // Fmaj7
          [220.00, 329.63, 392.00, 440.00], // Am7
          [196.00, 293.66, 392.00, 440.00]  // G6
        ];

        for (let t = 1.0; t < durationSeconds; t += 4.0) {
          if (Math.random() < 0.5) {
            const chord = chords[Math.floor(Math.random() * chords.length)];
            chord.forEach((f, idx) => {
              const osc = offlineCtx.createOscillator();
              const gain = offlineCtx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(f, t);
              const delay = idx * 0.12;
              gain.gain.setValueAtTime(0, t + delay);
              gain.gain.linearRampToValueAtTime(0.06, t + delay + 0.1);
              gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 4.5);
              osc.connect(gain).connect(channelGain);
              osc.start(t + delay);
              osc.stop(t + delay + 4.7);
            });
          }
        }
      }
      else if (synthId === 'bgm-soul-frequencies') {
        const oscLeft = offlineCtx.createOscillator();
        const oscRight = offlineCtx.createOscillator();

        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(528, 0);
        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(528.5, 0);

        const gainLeft = offlineCtx.createGain();
        const gainRight = offlineCtx.createGain();
        gainLeft.gain.setValueAtTime(0.18, 0);
        gainRight.gain.setValueAtTime(0.18, 0);

        oscLeft.connect(gainLeft).connect(channelGain);
        oscRight.connect(gainRight).connect(channelGain);
        oscLeft.start(0);
        oscRight.start(0);

        const subOsc = offlineCtx.createOscillator();
        const subGain = offlineCtx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(132, 0);
        subGain.gain.setValueAtTime(0.08, 0);
        subOsc.connect(subGain).connect(channelGain);
        subOsc.start(0);

        for (let t = 1.0; t < durationSeconds; t += 3.0) {
          if (Math.random() < 0.4) {
            const osc = offlineCtx.createOscillator();
            const gain = offlineCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(396, t);
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.08, t + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 5.0);
            osc.connect(gain).connect(channelGain);
            osc.start(t);
            osc.stop(t + 5.1);
          }
        }
      }
    } 
    else if (track.type === 'mic' && track.recordedUrl) {
      // Decode and play recorded physical buffer
      const buffer = await fetchAndDecodeAudio(offlineCtx, track.recordedUrl);
      if (buffer) {
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        // Apply custom pace/speed if defined
        if (track.speed && track.speed !== 1.0) {
          source.playbackRate.setValueAtTime(track.speed, 0);
        }
        source.connect(channelGain);
        source.start(0);
      }
    } 
    else if (track.type === 'import' && track.importDataUrl) {
      // Decode and play imported physical buffer
      const buffer = await fetchAndDecodeAudio(offlineCtx, track.importDataUrl);
      if (buffer) {
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        if (track.speed && track.speed !== 1.0) {
          source.playbackRate.setValueAtTime(track.speed, 0);
        }
        source.connect(channelGain);
        source.start(0);
      }
    }
  }

  // Complete offline context rendering
  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWav(renderedBuffer);
}
