import React, { useState, useEffect, useRef, useCallback } from 'react';

// Procedural ambient music generator using Web Audio API
// Creates smooth, jazzy ambient background music without requiring external files
class ProceduralMusicGenerator {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.isPlaying = false;
    this.scheduledNotes = [];
    this.nextNoteTime = 0;
    this.scheduleAheadTime = 0.1;
    this.lookAhead = 25;
    this.timerID = null;

    // Jazz-inspired chord progressions (ii-V-I variations)
    this.chordProgressions = [
      // Dm7 - G7 - Cmaj7
      [[2, 5, 9, 12], [7, 11, 14, 17], [0, 4, 7, 11]],
      // Am7 - Dm7 - G7 - Cmaj7
      [[9, 12, 16, 19], [2, 5, 9, 12], [7, 11, 14, 17], [0, 4, 7, 11]],
      // Fmaj7 - Em7 - Dm7 - Cmaj7
      [[5, 9, 12, 16], [4, 7, 11, 14], [2, 5, 9, 12], [0, 4, 7, 11]],
    ];

    this.currentProgression = 0;
    this.currentChord = 0;
    this.baseNote = 48; // C3
    this.tempo = 72; // BPM for relaxed jazz feel
  }

  start(volume = 0.3) {
    if (this.isPlaying) return;

    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    this.masterGain.connect(this.audioContext.destination);

    // Add a subtle reverb-like effect using delay
    this.delayNode = this.audioContext.createDelay();
    this.delayNode.delayTime.setValueAtTime(0.3, this.audioContext.currentTime);
    this.delayGain = this.audioContext.createGain();
    this.delayGain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.masterGain);

    this.isPlaying = true;
    this.nextNoteTime = this.audioContext.currentTime;
    this.scheduler();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID);
      this.timerID = null;
    }
    if (this.audioContext) {
      this.masterGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.5);
      setTimeout(() => {
        this.audioContext.close();
        this.audioContext = null;
      }, 600);
    }
  }

  setVolume(volume) {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1);
    }
  }

  midiToFreq(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  scheduler() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime);
      this.advanceNote();
    }
    this.timerID = setTimeout(() => this.scheduler(), this.lookAhead);
  }

  scheduleNote(time) {
    const progression = this.chordProgressions[this.currentProgression];
    const chord = progression[this.currentChord];
    const beatDuration = 60 / this.tempo;

    // Play chord tones with slight arpeggiation
    chord.forEach((interval, i) => {
      const noteTime = time + (i * 0.08); // Slight spread
      this.playTone(this.baseNote + interval, noteTime, beatDuration * 3.5, 0.08);
    });

    // Occasionally play a walking bass note
    if (Math.random() > 0.3) {
      const bassNote = this.baseNote + chord[0] - 12;
      this.playTone(bassNote, time, beatDuration * 2, 0.12);
    }

    // Occasionally add a melodic upper note
    if (Math.random() > 0.6) {
      const melodyNote = this.baseNote + chord[Math.floor(Math.random() * chord.length)] + 12;
      this.playTone(melodyNote, time + beatDuration, beatDuration * 1.5, 0.05);
    }
  }

  playTone(midiNote, time, duration, volume) {
    if (!this.audioContext || !this.isPlaying) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();

    // Use sine or triangle for smooth jazzy sound
    osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(this.midiToFreq(midiNote), time);

    // Warm low-pass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, time);
    filter.Q.setValueAtTime(1, time);

    // Soft attack and release envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.08);
    gain.gain.linearRampToValueAtTime(volume * 0.7, time + duration * 0.3);
    gain.gain.linearRampToValueAtTime(0, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    gain.connect(this.delayNode);

    osc.start(time);
    osc.stop(time + duration + 0.1);
  }

  advanceNote() {
    const beatDuration = 60 / this.tempo;
    this.nextNoteTime += beatDuration * 4; // Move every 4 beats (one measure)

    this.currentChord++;
    const progression = this.chordProgressions[this.currentProgression];
    if (this.currentChord >= progression.length) {
      this.currentChord = 0;
      // Occasionally switch progressions
      if (Math.random() > 0.7) {
        this.currentProgression = Math.floor(Math.random() * this.chordProgressions.length);
      }
    }
  }
}

// Audio player component for background music
function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const musicGeneratorRef = useRef(null);

  // Initialize the music generator
  useEffect(() => {
    musicGeneratorRef.current = new ProceduralMusicGenerator();
    return () => {
      if (musicGeneratorRef.current) {
        musicGeneratorRef.current.stop();
      }
    };
  }, []);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!musicGeneratorRef.current) return;

    if (isPlaying) {
      musicGeneratorRef.current.stop();
      setIsPlaying(false);
    } else {
      musicGeneratorRef.current.start(volume);
      setIsPlaying(true);
    }
  }, [isPlaying, volume]);

  // Update volume
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (musicGeneratorRef.current) {
      musicGeneratorRef.current.setVolume(newVolume);
    }
  }, []);

  // Audio player UI
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={togglePlay}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          ${isPlaying ? 'bg-accent-gold text-black' : 'bg-gray-700/90 text-white'}
          hover:scale-110 transition-all shadow-lg
        `}
        title={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Volume control on hover/click */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white hover:bg-gray-500"
        title="Volume settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Volume slider popup */}
      {showControls && (
        <div className="absolute bottom-14 right-0 bg-gray-800 rounded-lg p-4 shadow-lg min-w-[180px] border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">Volume</span>
            <span className="text-sm text-accent-gold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f39c12 0%, #f39c12 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
            }}
          />
          <div className="mt-3 text-xs text-gray-500 text-center">
            Ambient Jazz
          </div>
        </div>
      )}
    </div>
  );
}

// Procedural sound effects generator using Web Audio API
class SoundEffectsGenerator {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.enabled = true;
    this.volume = 0.5;
  }

  ensureContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
      this.masterGain.connect(this.audioContext.destination);
    }
    // Resume context if suspended (browsers require user interaction)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  // Card draw sound - swoosh/slide effect
  playDrawCard() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // White noise for swoosh
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.15);
    filter.Q.setValueAtTime(1, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.15);
  }

  // Card discard sound - soft thud
  playDiscardCard() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    // Low frequency thud
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);

    // Add a bit of noise for texture
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.3;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(500, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2 * this.volume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.08);
  }

  // Phase complete sound - triumphant ascending chime
  playPhaseComplete() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.5);
    });
  }

  // Your turn notification - gentle two-note chime
  playYourTurn() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const notes = [659.25, 880]; // E5, A5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + i * 0.15 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.35);
    });
  }

  // Skip notification - descending warning tone
  playSkipped() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.15 * this.volume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Game win sound - fanfare
  playGameWin() {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    const now = ctx.currentTime;

    const notes = [
      { freq: 523.25, time: 0, dur: 0.2 },     // C5
      { freq: 659.25, time: 0.15, dur: 0.2 },  // E5
      { freq: 783.99, time: 0.3, dur: 0.2 },   // G5
      { freq: 1046.50, time: 0.45, dur: 0.5 }, // C6
      { freq: 783.99, time: 0.6, dur: 0.15 },  // G5
      { freq: 1046.50, time: 0.75, dur: 0.6 }, // C6
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.3 * this.volume, now + time + 0.02);
      gain.gain.setValueAtTime(0.25 * this.volume, now + time + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.01, now + time + dur);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + time);
      osc.stop(now + time + dur + 0.1);
    });
  }
}

// Singleton instance for sound effects
let soundEffectsInstance = null;

export function getSoundEffects() {
  if (!soundEffectsInstance) {
    soundEffectsInstance = new SoundEffectsGenerator();
  }
  return soundEffectsInstance;
}

// Hook for game sounds
export function useGameSounds() {
  const [enabled, setEnabled] = useState(() => {
    const saved = localStorage.getItem('phase10_sound_effects');
    return saved !== null ? saved === 'true' : true;
  });
  const [volume, setVolumeState] = useState(() => {
    const saved = localStorage.getItem('phase10_sound_volume');
    return saved !== null ? parseFloat(saved) : 0.5;
  });

  useEffect(() => {
    const sfx = getSoundEffects();
    sfx.setEnabled(enabled);
    sfx.setVolume(volume);
  }, [enabled, volume]);

  const toggleEnabled = useCallback(() => {
    setEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem('phase10_sound_effects', String(newValue));
      return newValue;
    });
  }, []);

  const setVolume = useCallback((vol) => {
    setVolumeState(vol);
    localStorage.setItem('phase10_sound_volume', String(vol));
  }, []);

  const playSound = useCallback((soundName) => {
    const sfx = getSoundEffects();
    switch (soundName) {
      case 'draw':
        sfx.playDrawCard();
        break;
      case 'discard':
        sfx.playDiscardCard();
        break;
      case 'phaseComplete':
        sfx.playPhaseComplete();
        break;
      case 'yourTurn':
        sfx.playYourTurn();
        break;
      case 'skipped':
        sfx.playSkipped();
        break;
      case 'gameWin':
        sfx.playGameWin();
        break;
      default:
        break;
    }
  }, []);

  return { playSound, enabled, toggleEnabled, volume, setVolume };
}

export default AudioPlayer;
