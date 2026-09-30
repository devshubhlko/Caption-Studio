/**
 * Audio Manager Module
 * Manages optional background music / audio track (MP3, WAV, M4A, AAC).
 * Synchronizes playback with canvas preview and provides audio data for FFmpeg muxing.
 */

class AudioManagerClass {
  constructor() {
    this.enabled = false;
    this.audioFile = null;
    this.audioBlob = null;
    this.audioBuffer = null;
    this.audioDuration = 0;
    this.volume = 1.0;
    this.loop = false;
    
    // HTML5 Audio Element for preview playback
    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    
    this.listeners = [];
  }

  /**
   * Toggle music / audio feature
   * @param {boolean} isEnabled 
   */
  setEnabled(isEnabled) {
    this.enabled = Boolean(isEnabled);
    if (!this.enabled) {
      this.pause();
    }
    this.notify();
  }

  /**
   * Set volume (0.0 to 1.0)
   * @param {number} vol 
   */
  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.audioElement.volume = this.volume;
    this.notify();
  }

  /**
   * Toggle audio loop setting
   * @param {boolean} isLoop 
   */
  setLoop(isLoop) {
    this.loop = Boolean(isLoop);
    this.audioElement.loop = this.loop;
    this.notify();
  }

  /**
   * Loads user-uploaded audio file
   * @param {File} file 
   * @returns {Promise<{name: string, duration: number}>}
   */
  async loadAudioFile(file) {
    if (!file) return null;

    this.audioFile = file;
    this.audioBlob = file;

    // Load into preview audio element
    const objectUrl = URL.createObjectURL(file);
    this.audioElement.src = objectUrl;

    return new Promise((resolve, reject) => {
      this.audioElement.onloadedmetadata = () => {
        this.audioDuration = this.audioElement.duration || 0;
        this.notify();
        resolve({
          name: file.name,
          duration: this.audioDuration
        });
      };

      this.audioElement.onerror = (err) => {
        console.error('Audio load error:', err);
        reject(new Error('Failed to load audio file. Ensure it is a valid MP3, WAV, or AAC file.'));
      };
    });
  }

  /**
   * Synchronized audio play
   * @param {number} startOffsetSeconds 
   */
  play(startOffsetSeconds = 0) {
    if (!this.enabled || !this.audioFile) return;

    try {
      this.audioElement.currentTime = startOffsetSeconds;
      this.audioElement.play().catch(e => console.warn('Audio play prevented:', e));
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  /**
   * Pause audio playback
   */
  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  /**
   * Seek audio position
   * @param {number} timeSeconds 
   */
  seek(timeSeconds) {
    if (!this.enabled || !this.audioFile) return;
    try {
      this.audioElement.currentTime = Math.max(0, timeSeconds);
    } catch (e) {
      // Ignored
    }
  }

  /**
   * Returns ArrayBuffer of audio file for FFmpeg
   * @returns {Promise<Uint8Array>}
   */
  async getAudioBytes() {
    if (!this.enabled || !this.audioFile) return null;
    const arrayBuffer = await this.audioFile.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  /**
   * Listen for state updates
   * @param {Function} cb 
   */
  onChange(cb) {
    if (typeof cb === 'function') {
      this.listeners.push(cb);
    }
  }

  notify() {
    for (const cb of this.listeners) {
      cb({
        enabled: this.enabled,
        hasAudio: Boolean(this.audioFile),
        audioName: this.audioFile ? this.audioFile.name : null,
        duration: this.audioDuration,
        volume: this.volume,
        loop: this.loop
      });
    }
  }
}

// Global Singleton
window.AudioManager = new AudioManagerClass();
