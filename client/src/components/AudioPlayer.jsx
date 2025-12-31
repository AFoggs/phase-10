import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

// Audio player component for background music
function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const soundRef = useRef(null);

  // Initialize audio on first user interaction
  const initAudio = useCallback(() => {
    if (soundRef.current) return;

    try {
      soundRef.current = new Howl({
        src: ['/audio/jazz-background.mp3'],
        loop: true,
        volume: volume,
        html5: true, // Use HTML5 Audio for better streaming
        onload: () => {
          setAudioLoaded(true);
          setAudioError(false);
        },
        onloaderror: () => {
          setAudioError(true);
          console.log('Background music not found - music is optional');
        },
        onplayerror: () => {
          // Unlock and try again
          soundRef.current?.once('unlock', () => {
            soundRef.current?.play();
          });
        }
      });
    } catch (err) {
      setAudioError(true);
      console.log('Audio initialization error - music is optional');
    }
  }, [volume]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (!soundRef.current) {
      initAudio();
    }

    if (soundRef.current) {
      if (isPlaying) {
        soundRef.current.pause();
      } else {
        soundRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, initAudio]);

  // Update volume
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (soundRef.current) {
      soundRef.current.volume(newVolume);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  // If there's an error loading audio, show minimal UI
  if (audioError) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-600/80 transition-colors"
          title="Music unavailable"
        >
          🔇
        </button>
        {showControls && (
          <div className="absolute bottom-12 right-0 bg-gray-800 rounded-lg p-4 shadow-lg min-w-[200px]">
            <p className="text-sm text-gray-400">
              Background music is not available.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Add jazz-background.mp3 to public/audio/ folder
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className={`
          w-10 h-10 rounded-full flex items-center justify-center
          ${isPlaying ? 'bg-accent-gold/80 text-black' : 'bg-gray-700/80 text-white'}
          hover:scale-110 transition-all shadow-lg
        `}
        title={isPlaying ? 'Music playing' : 'Music paused'}
      >
        {isPlaying ? '🎵' : '🔇'}
      </button>

      {/* Expanded controls */}
      {showControls && (
        <div className="absolute bottom-12 right-0 bg-gray-800 rounded-lg p-4 shadow-lg min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Background Music</span>
            <button
              onClick={() => setShowControls(false)}
              className="text-gray-400 hover:text-white"
            >
              ×
            </button>
          </div>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className={`
              w-full py-2 rounded-lg mb-3 flex items-center justify-center gap-2
              ${isPlaying ? 'bg-red-600 hover:bg-red-500' : 'bg-green-600 hover:bg-green-500'}
              transition-colors
            `}
          >
            {isPlaying ? (
              <>
                <span>⏸</span>
                <span>Pause</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span>Play</span>
              </>
            )}
          </button>

          {/* Volume slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Volume</span>
              <span className="text-sm text-gray-400">{Math.round(volume * 100)}%</span>
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
          </div>

          {/* Status */}
          <div className="mt-3 text-xs text-gray-500">
            {audioLoaded ? 'Smooth Jazz' : 'Loading...'}
          </div>
        </div>
      )}
    </div>
  );
}

// Sound effects for game actions (optional enhancement)
export function useGameSounds() {
  const sounds = useRef({});

  useEffect(() => {
    // Initialize sound effects if needed
    // sounds.current.cardDraw = new Howl({ src: ['/audio/card-draw.mp3'] });
    // sounds.current.cardPlace = new Howl({ src: ['/audio/card-place.mp3'] });
    // sounds.current.phaseComplete = new Howl({ src: ['/audio/phase-complete.mp3'] });
    // sounds.current.roundEnd = new Howl({ src: ['/audio/round-end.mp3'] });
    // sounds.current.win = new Howl({ src: ['/audio/win.mp3'] });

    return () => {
      Object.values(sounds.current).forEach(sound => sound?.unload());
    };
  }, []);

  const playSound = useCallback((soundName) => {
    sounds.current[soundName]?.play();
  }, []);

  return { playSound };
}

export default AudioPlayer;
