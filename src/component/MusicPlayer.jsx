import React, { useRef, useState, useEffect } from 'react';

const CACHE_BUSTER = '20251104-130000-SIMPLIFIED'; // A unique string to force cache clearing

const tracks = [
  `https://raw.githubusercontent.com/Shahnab/poetryinmotion/main/music/1.mp3?v=${CACHE_BUSTER}`,
  `https://raw.githubusercontent.com/Shahnab/poetryinmotion/main/music/2.mp3?v=${CACHE_BUSTER}`,
  `https://raw.githubusercontent.com/Shahnab/poetryinmotion/main/music/3.mp3?v=${CACHE_BUSTER}`,
];

const MusicPlayer = () => {
  const audioRef = useRef(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReadyToPlay, setIsReadyToPlay] = useState(false);

  // Simplified loadTrack function
  const loadTrack = (index) => {
    console.log(`SIMPLIFIED LOAD LOGIC. CACHE BUSTER: ${CACHE_BUSTER}`);
    const trackUrl = tracks[index];
    console.log(`Directly setting audio src to: ${trackUrl}`);
    if (audioRef.current) {
        audioRef.current.src = trackUrl;
    } else {
        console.error("Audio ref is null!");
    }
  };

  useEffect(() => {
    const audio = audioRef.current;

    const handleCanPlay = () => {
      console.log('Audio can play through.');
      setIsReadyToPlay(true);
    };

    const handleError = (e) => {
      console.error('Audio element error:', e);
      console.error('Error details:', audio.error);
    };
    
    if (audio) {
      audio.addEventListener('canplaythrough', handleCanPlay);
      audio.addEventListener('error', handleError);
    }

    // Initial load
    loadTrack(currentTrackIndex);

    return () => {
      if (audio) {
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('error', handleError);
      }
    };
  }, [currentTrackIndex]);

  const startMusic = () => {
    if (!audioRef.current) {
      console.error('Cannot start music, audio ref is not set.');
      return;
    }

    console.log('startMusic called. isReadyToPlay:', isReadyToPlay);
    console.log('Audio src before play:', audioRef.current.src);

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('Playback started successfully.');
        setIsPlaying(true);
      }).catch(error => {
        console.error('Playback failed:', error);
        // This is often due to browser autoplay policies
        if (error.name === 'NotAllowedError') {
            console.error('Autoplay was prevented. User interaction is required.');
        }
      });
    }
  };

  const handleEnded = () => {
    console.log('Track ended, loading next track.');
    setIsPlaying(false);
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px' }}>
        v{CACHE_BUSTER}
      </div>
      <audio ref={audioRef} onEnded={handleEnded} crossOrigin="anonymous" preload="auto"></audio>
      <button onClick={startMusic} disabled={isPlaying} style={{ position: 'absolute', top: '50px', left: '10px', zIndex: 1000 }}>
        {isPlaying ? 'Playing...' : 'Play Music'}
      </button>
    </div>
  );
};

export default MusicPlayer;
