import React, { useRef, useState, useEffect } from 'react';

// Get the base URL from Vite's environment variables
const BASE_URL = import.meta.env.BASE_URL;

// Construct asset URLs relative to the base path
const tracks = [
  `${BASE_URL}music/1.mp3`,
  `${BASE_URL}music/2.mp3`,
  `${BASE_URL}music/3.mp3`,
];

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.src = tracks[currentTrackIndex];
      console.log(`Set audio source to: ${audio.src}`);
    }
  }, [currentTrackIndex]);

  const startMusic = () => {
    if (!audioRef.current) return;

    console.log(`Attempting to play: ${audioRef.current.src}`);
    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Playback started.');
        setIsPlaying(true);
      }).catch(error => {
        console.error('Playback failed:', error);
        if (error.name === 'NotAllowedError') {
          console.error('Autoplay was prevented. User interaction is required.');
        }
      });
    }
  };

  const handleEnded = () => {
    console.log('Track ended, loading next.');
    setIsPlaying(false);
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  return (
    <div>
      <audio 
        ref={audioRef} 
        onEnded={handleEnded} 
        onError={(e) => console.error('Audio Element Error:', e.target.error)}
        preload="auto"
      ></audio>
      <button onClick={startMusic} disabled={isPlaying} style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000 }}>
        {isPlaying ? 'Playing...' : 'Play Music'}
      </button>
    </div>
  );
};

export default MusicPlayer;
