import landlineSound from '../assets/Landline.mp3';

/**
 * Bell Ring Sound Player using HTML5 Audio
 * Plays Landline.mp3 audio file that loops until stopped
 * Works on both desktop and mobile devices
 */
class BellRingSound {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isInitialized = false;
  }

  /**
   * Initialize audio element
   */
  async init() {
    // Stop any existing audio first
    this.stop();

    if (!this.audio) {
      try {
        // Log the imported path to verify
        console.log('Loading Landline.mp3 from:', landlineSound);
        console.log('Import type:', typeof landlineSound);

        // Stop any other audio elements that might be playing
        const allAudioElements = document.querySelectorAll('audio');
        allAudioElements.forEach(audio => {
          if (!audio.paused) {
            console.log('Stopping existing audio before initialization:', audio.src);
            audio.pause();
            audio.currentTime = 0;
          }
        });

        // Create audio element with the imported file
        // Ensure we use the correct file path
        const audioSrc = landlineSound && typeof landlineSound === 'string'
          ? landlineSound
          : (landlineSound?.default || landlineSound);

        console.log('Creating audio with src:', audioSrc);
        this.audio = new Audio(audioSrc);
        this.audio.loop = true; // Loop the sound
        this.audio.volume = 0.7; // Set volume (0.0 to 1.0)

        // Preload the audio
        this.audio.preload = 'auto';

        // Log the actual src being used
        this.audio.addEventListener('loadstart', () => {
          console.log('Audio loading started, src:', this.audio.src);
          console.log('Full URL:', this.audio.src);
        });

        // Handle audio loading
        this.audio.addEventListener('canplaythrough', () => {
          console.log('Landline.mp3 loaded and ready to play');
          console.log('Audio src:', this.audio.src);
          console.log('Audio duration:', this.audio.duration);
          this.isInitialized = true;
        });

        // Handle audio errors with detailed info
        this.audio.addEventListener('error', (e) => {
          console.error('Audio loading error:', e);
          console.error('Audio error details:', {
            error: this.audio.error,
            errorCode: this.audio.error?.code,
            errorMessage: this.audio.error?.message,
            networkState: this.audio.networkState,
            readyState: this.audio.readyState,
            src: this.audio.src,
            currentSrc: this.audio.currentSrc
          });
          this.isInitialized = false;
        });

        // Load the audio
        this.audio.load();

        // Verify the src after load
        console.log('Audio element created');
        console.log('Audio src:', this.audio.src);
        console.log('Audio currentSrc:', this.audio.currentSrc);

        this.isInitialized = true;
        console.log('Audio initialized successfully');
      } catch (error) {
        console.error('Error initializing audio:', error);
        throw error;
      }
    }

    return Promise.resolve();
  }

  /**
   * Start playing bell ring sound
   * Handles mobile audio context properly
   */
  async play() {
    if (this.isPlaying) {
      return; // Already playing
    }

    try {
      // Initialize audio if not already done
      if (!this.audio) {
        await this.init();
      }

      // Wait a bit for audio to be ready
      if (this.audio.readyState < 2) {
        // Wait for audio to be ready (HAVE_CURRENT_DATA or better)
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Audio loading timeout'));
          }, 3000);

          const checkReady = () => {
            if (this.audio.readyState >= 2) {
              clearTimeout(timeout);
              this.audio.removeEventListener('canplay', checkReady);
              this.audio.removeEventListener('canplaythrough', checkReady);
              resolve();
            }
          };

          this.audio.addEventListener('canplay', checkReady);
          this.audio.addEventListener('canplaythrough', checkReady);

          // If already ready, resolve immediately
          if (this.audio.readyState >= 2) {
            clearTimeout(timeout);
            resolve();
          }
        });
      }

      // Verify audio src before playing
      console.log('Playing audio from src:', this.audio.src);
      console.log('Audio readyState:', this.audio.readyState);

      // Play the audio
      const playPromise = this.audio.play();

      if (playPromise !== undefined) {
        await playPromise;
        this.isPlaying = true;
        console.log('Landline.mp3 sound started successfully');
        console.log('Audio duration:', this.audio.duration, 'seconds');
      } else {
        // Fallback for older browsers
        this.audio.play();
        this.isPlaying = true;
        console.log('Landline.mp3 sound started (fallback)');
      }

    } catch (error) {
      console.error('Error playing bell ring sound:', error);
      this.isPlaying = false;

      // If autoplay was prevented, we'll try again on user interaction
      if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
        console.warn('Audio autoplay prevented. User interaction required.');
      }
    }
  }

  /**
   * Stop playing bell ring sound
   */
  stop() {
    try {
      // Stop any currently playing audio
      if (this.audio) {
        if (!this.audio.paused) {
          console.log('Stopping Landline.mp3 audio, src:', this.audio.src);
        }
        this.audio.pause();
        this.audio.currentTime = 0; // Reset to beginning
      }

      // Also stop any other audio elements that might be playing (safety measure)
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(audio => {
        if (audio !== this.audio && !audio.paused) {
          console.log('Stopping other audio element found:', audio.src);
          audio.pause();
          audio.currentTime = 0;
        }
      });

      this.isPlaying = false;
    } catch (error) {
      console.error('Error stopping bell ring sound:', error);
    }
  }

  /**
   * Cleanup audio element
   */
  cleanup() {
    this.stop();
    if (this.audio) {
      this.audio.removeEventListener('canplaythrough', () => { });
      this.audio.removeEventListener('error', () => { });
      this.audio = null;
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
const bellRingSound = new BellRingSound();

export default bellRingSound;
