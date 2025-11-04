import React, { useRef, useState, useEffect } from 'react';

// Get the base URL from Vite's environment variables
const BASE_URL = import.meta.env.BASE_URL;

// Construct asset URLs relative to the base path
const tracks = [
  `${BASE_URL}music/1.mp3`,
  `${BASE_URL}music/2.mp3`,
  `${BASE_URL}music/3.mp3`,
];

const MusicPlayer = ({ isPaused, restartKey }) => {
  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = tracks[currentTrackIndex];
      console.log(`Set audio source to: ${audio.src}`);
    }
  }, [currentTrackIndex]);

  // Handle pause state
  useEffect(() => {
    if (!audioRef.current || !hasStarted) return;

    if (isPaused) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Resume playback failed:', error);
      });
      setIsPlaying(true);
    }
  }, [isPaused, hasStarted]);

  // Handle restart
  useEffect(() => {
    if (restartKey > 0 && hasStarted) {
      setCurrentTrackIndex(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        if (!isPaused) {
          audioRef.current.play().catch(error => {
            console.error('Restart playback failed:', error);
          });
        }
      }
    }
  }, [restartKey, hasStarted, isPaused]);

  const handleStart = () => {
    if (!audioRef.current) return;

    console.log(`Starting music: ${audioRef.current.src}`);
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Playback started.');
        setIsPlaying(true);
        setHasStarted(true);
      }).catch(error => {
        console.error('Playback failed:', error);
      });
    }
  };

  const handleEnded = () => {
    console.log('Track ended, loading next.');
    setIsPlaying(false);
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  // Show landing page if not started
  if (!hasStarted) {
    return (
      <div
        onClick={handleStart}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          fontSize: '2rem',
          cursor: 'pointer',
          zIndex: 9999,
        }}
      >
        Click to Start
      </div>
    );
  }

  return (
    <div>
      <audio 
        ref={audioRef} 
        onEnded={handleEnded} 
        onError={(e) => console.error('Audio Element Error:', e.target.error)}
        preload="auto"
      ></audio>
    </div>
  );
};

export default MusicPlayer;
