import { useEffect, useRef, useState } from 'react'

export default function MusicPlayer({ isPaused, restartKey }) {
  // Cache buster - Nov 3, 2025 - Force deployment update
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(() => {
    // Load saved track from localStorage
    const saved = localStorage.getItem('musicTrack')
    return saved ? parseInt(saved, 10) : 0
  })
  const audioRef = useRef(null)
  const hasRestoredTime = useRef(false) // Track if we've already restored the saved time
  
  // Use GitHub raw files for reliable access - Nov 3, 2025
  const tracks = [
    'https://raw.githubusercontent.com/Shahnab/poetryinmotion/main/music/1.mp3',
    'https://raw.githubusercontent.com/Shahnab/poetryinmotion/main/music/2.mp3',
    'https://raw.githubusercontent.com/Shahnab/poetryinmotion/main/music/3.mp3'
  ]
  console.log('🎵 MusicPlayer using GitHub raw files') // Debug log
  console.log('🎵 MusicPlayer loaded with tracks:', tracks) // Debug log

  // Test function to manually check URL accessibility
  const testUrl = async (url) => {
    try {
      console.log('🧪 Manual URL test for:', url)
      const response = await fetch(url, { method: 'HEAD' })
      console.log('🧪 Manual test result:', response.status, response.statusText, response.headers.get('content-type'))
      return response.ok
    } catch (error) {
      console.error('🧪 Manual test error:', error)
      return false
    }
  }

  // Test all URLs on component mount
  useEffect(() => {
    console.log('🧪 Testing all track URLs...')
    tracks.forEach(async (url, index) => {
      const result = await testUrl(url)
      console.log(`🧪 Track ${index + 1} (${url}): ${result ? '✅ OK' : '❌ FAILED'}`)
    })
  }, [])

  // Save music state to localStorage whenever it changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !hasInteracted) return

    const saveState = () => {
      localStorage.setItem('musicTrack', currentTrack.toString())
      localStorage.setItem('musicTime', audio.currentTime.toString())
    }

    // Save state periodically
    const interval = setInterval(saveState, 500)
    
    return () => clearInterval(interval)
  }, [currentTrack, hasInteracted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      // Move to next track
      setCurrentTrack((prev) => (prev + 1) % tracks.length)
    }

    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const loadTrack = async () => {
      try {
        // First test if the file exists using fetch
        console.log('🔍 Testing URL:', tracks[currentTrack])
        const testResponse = await fetch(tracks[currentTrack], { method: 'HEAD' })
        console.log('📊 Fetch test result:', testResponse.status, testResponse.statusText)
        
        if (!testResponse.ok) {
          throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`)
        }

        // Set volume to 100%
        audio.volume = 1.0
        
        // Load and play new track
        audio.src = tracks[currentTrack]
        audio.load()
        
        // Restore saved time ONLY ONCE on first load
        const savedTime = localStorage.getItem('musicTime')
        if (savedTime && hasInteracted && !hasRestoredTime.current) {
          audio.currentTime = parseFloat(savedTime)
          hasRestoredTime.current = true // Mark as restored
          // Clear it after restoring
          localStorage.removeItem('musicTime')
        }
        
        // Only auto-play if user has interacted
        if (hasInteracted) {
          const playPromise = audio.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Playing track:', currentTrack + 1, tracks[currentTrack])
              })
              .catch(err => {
                console.log('Audio play error:', err)
              })
          }
        }
      } catch (error) {
        console.error('Failed to load track:', tracks[currentTrack], error)
        // Try GitHub raw URL as fallback
        const fallbackUrl = `https://raw.githubusercontent.com/Shahnab/poetryinmotion/main/music/${currentTrack + 1}.mp3`
        console.log('Trying fallback URL:', fallbackUrl)
        audio.src = fallbackUrl
        audio.load()
      }
    }

    loadTrack()
  }, [currentTrack, tracks, hasInteracted])

  // Handle pause/resume from parent component
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !hasInteracted) return

    if (isPaused) {
      audio.pause()
      console.log('Music paused')
    } else {
      audio.play().catch(err => console.log('Play error:', err))
      console.log('Music resumed')
    }
  }, [isPaused, hasInteracted])

  // Handle restart from beginning
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !hasInteracted || restartKey === 0) return

    // Reset to first track and restart from beginning
    audio.currentTime = 0
    setCurrentTrack(0)
    
    audio.play().catch(err => console.log('Play error on restart:', err))
    console.log('Music restarted from beginning')
  }, [restartKey, hasInteracted])

  const startMusic = () => {
    console.log('🎵 User clicked to start music')
    console.log('🎵 Current track index:', currentTrack)
    console.log('🎵 Track URL:', tracks[currentTrack])
    
    setHasInteracted(true)
    
    const audio = audioRef.current
    if (audio) {
      console.log('🎵 Audio element found, setting up...')
      
      // Add detailed event listeners for debugging
      const onCanPlay = () => {
        console.log('✅ Audio can play - file loaded successfully')
        audio.removeEventListener('canplay', onCanPlay)
      }
      
      const onError = (e) => {
        console.error('❌ Audio error:', e)
        console.error('❌ Audio error details:', audio.error)
        audio.removeEventListener('error', onError)
      }
      
      const onLoadStart = () => {
        console.log('🔄 Audio load started')
        audio.removeEventListener('loadstart', onLoadStart)
      }
      
      audio.addEventListener('canplay', onCanPlay)
      audio.addEventListener('error', onError)
      audio.addEventListener('loadstart', onLoadStart)
      
      // Force load the audio and start playing
      audio.src = tracks[currentTrack]
      console.log('🎵 Audio src set to:', audio.src)
      audio.load()
      console.log('🎵 Audio load() called')
      
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('✅ Music started successfully:', tracks[currentTrack])
          })
          .catch(err => {
            console.error('❌ Play error on start:', err)
          })
      }
    } else {
      console.error('❌ No audio element found!')
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    setIsMuted(prev => {
      const newMuted = !prev
      console.log('Toggling mute:', newMuted ? 'MUTED' : 'UNMUTED')
      if (audio) {
        audio.muted = newMuted
        audio.volume = 1.0 // Ensure volume is at max
        // Ensure it's playing when unmuting
        if (!newMuted && audio.paused) {
          console.log('Resuming playback...')
          audio.play().catch(err => console.log('Play error:', err))
        }
      }
      return newMuted
    })
  }

  return (
    <>
      <audio 
        ref={audioRef} 
        preload="auto"
        muted={isMuted}
        style={{ display: 'none' }}
      />
      
      {/* Click to start overlay */}
      {!hasInteracted && (
        <div
          onClick={startMusic}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 9999,
            transition: 'opacity 0.5s ease'
          }}
        >
          {/* Title */}
          <h1 style={{
            color: 'white',
            fontSize: '64px',
            fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
            fontWeight: '300',
            letterSpacing: '8px',
            marginBottom: '60px',
            textTransform: 'uppercase',
            opacity: 0.95,
            textAlign: 'center',
            lineHeight: 1.2
          }}>
            Poise in Motion
          </h1>
          
          {/* Click to start button */}
          <div style={{
            color: 'white',
            fontSize: '14px',
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            fontWeight: '300',
            letterSpacing: '3px',
            textAlign: 'center',
            padding: '24px 48px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            background: 'rgba(255, 255, 255, 0.03)',
            transition: 'all 0.4s ease',
            textTransform: 'uppercase'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
          >
            <div style={{ 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Minimalistic music note icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </div>
            Click to Start
          </div>
        </div>
      )}
      
      <button
        onClick={toggleMute}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'
          e.currentTarget.style.transform = 'scale(1.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)'
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          // Muted icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          // Unmuted icon
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        )}
      </button>
    </>
  )
}
