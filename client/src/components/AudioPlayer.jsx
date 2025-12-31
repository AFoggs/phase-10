import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

// Audio player component for background music
function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3);
  const [showControls, setShowControls] = useState(false);
  const [audioStatus, setAudioStatus] = useState('checking'); // 'checking', 'available', 'unavailable'
  const soundRef = useRef(null);

  // Check for audio availability on mount
  useEffect(() => {
    // Try to fetch the audio file to see if it exists
    fetch('/audio/jazz-background.mp3', { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          setAudioStatus('available');
        } else {
          setAudioStatus('unavailable');
        }
      })
      .catch(() => {
        setAudioStatus('unavailable');
      });
  }, []);

  // Initialize audio
  const initAudio = useCallback(() => {
    if (soundRef.current || audioStatus !== 'available') return;

    try {
      soundRef.current = new Howl({
        src: ['/audio/jazz-background.mp3'],
        loop: true,
        volume: volume,
        html5: true,
        onload: () => {
          setAudioStatus('available');
        },
        onloaderror: () => {
          setAudioStatus('unavailable');
          console.log('Background music not found - music is optional');
        },
        onplayerror: () => {
          soundRef.current?.once('unlock', () => {
            soundRef.current?.play();
          });
        }
      });
    } catch (err) {
      setAudioStatus('unavailable');
      console.log('Audio initialization error - music is optional');
    }
  }, [volume, audioStatus]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (audioStatus !== 'available') return;

    if (!soundRef.current) {
      initAudio();
      // Give it a moment to initialize then play
      setTimeout(() => {
        if (soundRef.current) {
          soundRef.current.play();
          setIsPlaying(true);
        }
      }, 100);
      return;
    }

    if (isPlaying) {
      soundRef.current.pause();
      setIsPlaying(false);
    } else {
      soundRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying, initAudio, audioStatus]);

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

  // Still checking for audio availability
  if (audioStatus === 'checking') {
    return null;
  }

  // Audio not available - show info button
  if (audioStatus === 'unavailable') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-600/80 transition-colors"
          title="Music unavailable - click for info"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </button>
        {showControls && (
          <div className="absolute bottom-12 right-0 bg-gray-800 rounded-lg p-4 shadow-lg min-w-[280px] border border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-white">Background Music</span>
              <button
                onClick={() => setShowControls(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Background music is optional. To enable it:
            </p>
            <ol className="text-xs text-gray-400 space-y-2 list-decimal list-inside">
              <li>Download a royalty-free jazz MP3</li>
              <li>Save it as <code className="bg-gray-700 px-1 rounded">jazz-background.mp3</code></li>
              <li>Place it in <code className="bg-gray-700 px-1 rounded">client/public/audio/</code></li>
              <li>Refresh the page</li>
            </ol>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Suggested sources: Bensound, Free Music Archive, Incompetech
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Audio available - show full player
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
            Smooth Jazz
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
