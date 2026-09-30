/**
 * Video Exporter Module
 * Deterministic Frame-by-Frame Canvas rendering + FFmpeg.wasm Video Encoding.
 * Supports Video-Only (Silent) and Video+Audio Muxing.
 */

class VideoExporterClass {
  constructor() {
    this.ffmpeg = null;
    this.isFFmpegLoaded = false;
    this.isExporting = false;
    this.abortController = null;
  }

  /**
   * Initializes FFmpeg.wasm instance dynamically from CDN if not already loaded
   * @param {Function} onLog
   * @returns {Promise<boolean>}
   */
  async initFFmpeg(onLog = () => {}) {
    if (this.isFFmpegLoaded && this.ffmpeg) {
      return true;
    }

    onLog('Initializing FFmpeg.wasm core engine...');

    try {
      // Ensure FFmpeg is available on window or load script
      if (!window.FFmpeg) {
        await this.loadScript('https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js');
      }

      const { createFFmpeg } = window.FFmpeg;
      this.ffmpeg = createFFmpeg({
        log: false,
        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
      });

      this.ffmpeg.setLogger(({ type, message }) => {
        // Optional debug logger
        if (message.includes('frame=') || message.includes('time=')) {
          onLog(`FFmpeg: ${message}`);
        }
      });

      await this.ffmpeg.load();
      this.isFFmpegLoaded = true;
      onLog('FFmpeg engine loaded successfully.');
      return true;
    } catch (err) {
      console.warn('FFmpeg.wasm CDN loading warning:', err);
      // Fallback: If 0.11.6 CDN fails, we can try jsdelivr or fallback
      try {
        if (!this.ffmpeg) {
          const { createFFmpeg } = window.FFmpeg;
          this.ffmpeg = createFFmpeg({
            log: false,
            corePath: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
          });
          await this.ffmpeg.load();
          this.isFFmpegLoaded = true;
          return true;
        }
      } catch (innerErr) {
        console.error('FFmpeg loading failed completely:', innerErr);
        this.isFFmpegLoaded = false;
        return false;
      }
      return false;
    }
  }

  /**
   * Helper to dynamically inject external script
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = (e) => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(s);
    });
  }

  /**
   * Converts Canvas frame to Uint8Array lossless PNG
   */
  async canvasToBlobBytes(canvas, format = 'image/png') {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(new Uint8Array(reader.result));
        };
        reader.readAsArrayBuffer(blob);
      }, format);
    });
  }

  /**
   * Core Video Export Function
   * @param {Object} options 
   * @param {Array} options.captions
   * @param {Object} options.style
   * @param {number} options.duration (in seconds)
   * @param {number} options.fps (24, 30, or 60)
   * @param {number} options.width
   * @param {number} options.height
   * @param {string} options.aspectRatio
   * @param {string} options.quality ('standard', 'high', 'very-high')
   * @param {boolean} options.addAudio
   * @param {Object} options.audioManager
   * @param {Function} options.onProgress (percent, statusText)
   * @returns {Promise<{blob: Blob, url: string, filename: string}>}
   */
  async exportVideo(options) {
    if (window.AuthManager && !window.AuthManager.isAuthenticated()) {
      throw new Error('Authentication required. Access denied.');
    }

    if (this.isExporting) {
      throw new Error('An export is already in progress.');
    }

    this.isExporting = true;
    const {
      captions = [],
      style = {},
      duration = 10.0,
      fps = 30,
      width = 1920,
      height = 1080,
      aspectRatio = '16:9',
      quality = 'high',
      addAudio = false,
      audioManager = null,
      bgVideoElement = null,
      bgVideoFile = null,
      onProgress = () => {}
    } = options;

    const safeDuration = Math.max(0.5, duration);
    const totalFrames = Math.ceil(safeDuration * fps);

    // Create offscreen high-res canvas
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    const renderer = new CanvasRenderer(offscreenCanvas);
    renderer.setResolution(width, height, aspectRatio);

    try {
      // 1. Ensure fonts are loaded before starting
      onProgress(5, 'Loading fonts & styles...');
      if (window.FontManager) {
        await window.FontManager.ensureFontReady(style.fontFamily, style.fontWeight, style.fontSize);
      }

      // 2. Initialize FFmpeg
      onProgress(10, 'Preparing video encoding engine...');
      const ffmpegReady = await this.initFFmpeg((msg) => onProgress(12, msg));

      if (ffmpegReady && this.ffmpeg) {
        // === PRIMARY PATH: FFmpeg.wasm Engine ===
        return await this.exportWithFFmpeg({
          renderer,
          offscreenCanvas,
          captions,
          style,
          safeDuration,
          fps,
          totalFrames,
          width,
          height,
          quality,
          addAudio,
          audioManager,
          bgVideoElement,
          bgVideoFile,
          onProgress
        });
      } else {
        // === HIGH PERFORMANCE CLIENT FALLBACK: MediaRecorder Frame Engine ===
        onProgress(15, 'Using high-speed WebMedia Engine...');
        return await this.exportWithMediaRecorder({
          renderer,
          offscreenCanvas,
          captions,
          style,
          safeDuration,
          fps,
          totalFrames,
          quality,
          addAudio,
          audioManager,
          bgVideoElement,
          onProgress
        });
      }
    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Helper to accurately seek HTML5 Video to specific timestamp
   */
  async seekVideoToTime(video, targetTime) {
    if (!video || !video.duration || isNaN(targetTime)) return;
    const clampedTime = targetTime % video.duration;
    if (Math.abs(video.currentTime - clampedTime) < 0.001) return;

    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (!settled) {
          settled = true;
          video.removeEventListener('seeked', finish);
          resolve();
        }
      };

      video.addEventListener('seeked', finish, { once: true });
      try {
        video.currentTime = clampedTime;
      } catch (e) {
        finish();
      }
      setTimeout(finish, 80);
    });
  }

  /**
   * Deterministic FFmpeg.wasm Export Pipeline
   */
  async exportWithFFmpeg({
    renderer,
    offscreenCanvas,
    captions,
    style,
    safeDuration,
    fps,
    totalFrames,
    width,
    height,
    quality = 'high',
    addAudio,
    audioManager,
    bgVideoElement = null,
    bgVideoFile = null,
    onProgress
  }) {
    const { ffmpeg } = this;
    const frameFiles = [];

    if (bgVideoElement) {
      try { bgVideoElement.pause(); } catch (e) {}
    }

    // Quality Profiles for razor-sharp HD crisp text & crystal clear visuals
    const qualityProfiles = {
      'standard': { crf: '12', bitrate: '20M', maxrate: '30M', bufsize: '40M', preset: 'medium' },
      'high': { crf: '6', bitrate: '35M', maxrate: '50M', bufsize: '65M', preset: 'medium' },
      'very-high': { crf: '2', bitrate: '60M', maxrate: '80M', bufsize: '100M', preset: 'medium' }
    };
    const qConf = qualityProfiles[quality] || qualityProfiles['high'];

    // Step 1: Render All Frames Deterministically in Lossless PNG
    onProgress(15, 'Rendering HD frames...');
    
    for (let i = 0; i < totalFrames; i++) {
      const currentTime = i / fps;

      // If background video element is active, seek deterministically to frame
      if (bgVideoElement) {
        await this.seekVideoToTime(bgVideoElement, currentTime);
      }

      renderer.renderFrame(currentTime, captions, style, bgVideoElement);

      // Lossless PNG frame extraction avoids JPEG compression blur
      const frameData = await this.canvasToBlobBytes(offscreenCanvas, 'image/png');
      const filename = `frame_${String(i).padStart(5, '0')}.png`;
      ffmpeg.FS('writeFile', filename, frameData);
      frameFiles.push(filename);

      if (i % 4 === 0 || i === totalFrames - 1) {
        const renderPct = Math.round(15 + (i / totalFrames) * 50); // 15% -> 65%
        onProgress(renderPct, `Rendering HD frames: ${i + 1}/${totalFrames} (${Math.round((i / totalFrames) * 100)}%)`);
      }
    }

    // Step 2: Handle Audio logic
    let hasAudioStream = false;
    let audioFileName = null;
    let isVideoInbuiltAudio = false;

    if (addAudio && audioManager && audioManager.enabled && audioManager.audioFile) {
      onProgress(68, 'Processing uploaded audio track...');
      try {
        const audioBytes = await audioManager.getAudioBytes();
        if (audioBytes) {
          ffmpeg.FS('writeFile', 'input_audio.mp3', audioBytes);
          hasAudioStream = true;
          audioFileName = 'input_audio.mp3';
        }
      } catch (err) {
        console.warn('Could not read audio bytes:', err);
      }
    } else if (bgVideoFile) {
      onProgress(68, 'Checking background video audio...');
      try {
        const videoBuffer = await bgVideoFile.arrayBuffer();
        ffmpeg.FS('writeFile', 'input_bg_video.mp4', new Uint8Array(videoBuffer));
        hasAudioStream = true;
        audioFileName = 'input_bg_video.mp4';
        isVideoInbuiltAudio = true;
      } catch (err) {
        console.warn('Could not load background video file for audio:', err);
      }
    }

    // Step 3: Run FFmpeg Command
    onProgress(72, hasAudioStream ? 'Combining HD video and audio...' : 'Finalizing HD MP4...');

    const outputName = 'output.mp4';
    let ffmpegArgs = [];

    if (hasAudioStream && audioFileName) {
      const vol = (isVideoInbuiltAudio || !audioManager) ? 1.0 : audioManager.volume;
      const isLoop = (!isVideoInbuiltAudio && audioManager && audioManager.loop);
      
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', 'frame_%05d.png',
        ...(isLoop ? ['-stream_loop', '-1'] : []),
        '-i', audioFileName,
        '-map', '0:v:0',
        '-map', '1:a:0?',
        '-c:v', 'libx264',
        '-profile:v', 'high',
        '-level:v', '4.2',
        '-preset', qConf.preset,
        '-tune', 'animation', // Preserves sharp edges in typography
        '-crf', qConf.crf,
        '-b:v', qConf.bitrate,
        '-maxrate', qConf.maxrate,
        '-bufsize', qConf.bufsize,
        '-pix_fmt', 'yuv420p',
        '-colorspace', 'bt709',
        '-color_primaries', 'bt709',
        '-color_trc', 'bt709',
        '-color_range', 'tv',
        '-c:a', 'aac',
        '-b:a', '320k',
        '-af', `volume=${vol}`,
        '-t', String(safeDuration),
        '-movflags', '+faststart',
        outputName
      ];
    } else {
      ffmpegArgs = [
        '-framerate', String(fps),
        '-i', 'frame_%05d.png',
        '-c:v', 'libx264',
        '-profile:v', 'high',
        '-level:v', '4.2',
        '-preset', qConf.preset,
        '-tune', 'animation', // Preserves sharp edges in typography
        '-crf', qConf.crf,
        '-b:v', qConf.bitrate,
        '-maxrate', qConf.maxrate,
        '-bufsize', qConf.bufsize,
        '-pix_fmt', 'yuv420p',
        '-colorspace', 'bt709',
        '-color_primaries', 'bt709',
        '-color_trc', 'bt709',
        '-color_range', 'tv',
        '-an',
        '-t', String(safeDuration),
        '-movflags', '+faststart',
        outputName
      ];
    }

    onProgress(78, hasAudioStream ? 'Encoding Ultra-HD video and audio...' : 'Encoding crisp 1080p Ultra-HD MP4...');
    try {
      await ffmpeg.run(...ffmpegArgs);
    } catch (ffmpegErr) {
      console.warn('FFmpeg run with audio attempt failed, trying fallback without audio map:', ffmpegErr);
      if (hasAudioStream && isVideoInbuiltAudio) {
        // If video had no audio track, fallback to silent export
        ffmpegArgs = [
          '-framerate', String(fps),
          '-i', 'frame_%05d.png',
          '-c:v', 'libx264',
          '-profile:v', 'high',
          '-level:v', '4.2',
          '-preset', qConf.preset,
          '-tune', 'animation',
          '-crf', qConf.crf,
          '-b:v', qConf.bitrate,
          '-maxrate', qConf.maxrate,
          '-bufsize', qConf.bufsize,
          '-pix_fmt', 'yuv420p',
          '-an',
          '-t', String(safeDuration),
          '-movflags', '+faststart',
          outputName
        ];
        await ffmpeg.run(...ffmpegArgs);
      } else {
        throw ffmpegErr;
      }
    }

    onProgress(95, 'Finalizing video file...');
    const data = ffmpeg.FS('readFile', outputName);
    const videoBlob = new Blob([data.buffer], { type: 'video/mp4' });
    const videoUrl = URL.createObjectURL(videoBlob);

    // Step 4: Cleanup virtual FS
    try {
      for (const file of frameFiles) {
        ffmpeg.FS('unlink', file);
      }
      ffmpeg.FS('unlink', outputName);
      if (audioFileName) {
        ffmpeg.FS('unlink', audioFileName);
      }
    } catch (e) {
      console.warn('FFmpeg FS cleanup warning:', e);
    }

    onProgress(100, 'Export complete.');

    return {
      blob: videoBlob,
      url: videoUrl,
      filename: 'caption-video.mp4',
      hasAudio: hasAudioStream
    };
  }

  /**
   * High-Performance MediaRecorder Fallback Pipeline
   */
  async exportWithMediaRecorder({
    renderer,
    offscreenCanvas,
    captions,
    style,
    safeDuration,
    fps,
    totalFrames,
    quality = 'high',
    addAudio,
    audioManager,
    bgVideoElement = null,
    onProgress
  }) {
    const stream = offscreenCanvas.captureStream(fps);
    let audioTrack = null;

    if (bgVideoElement) {
      try { bgVideoElement.pause(); } catch (e) {}
    }

    if (addAudio && audioManager && audioManager.enabled && audioManager.audioElement) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        const source = audioCtx.createMediaElementSource(audioManager.audioElement);
        const gain = audioCtx.createGain();
        gain.gain.value = audioManager.volume;
        source.connect(gain);
        gain.connect(dest);
        gain.connect(audioCtx.destination);
        if (dest.stream.getAudioTracks().length > 0) {
          stream.addTrack(dest.stream.getAudioTracks()[0]);
        }
      } catch (e) {
        console.warn('MediaRecorder audio mux warning:', e);
      }
    }

    const mimeTypes = ['video/mp4;codecs=h264', 'video/webm;codecs=vp9', 'video/webm'];
    let selectedMime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || 'video/webm';

    const recorder = new MediaRecorder(stream, {
      mimeType: selectedMime,
      videoBitsPerSecond: 28000000 // 28 Mbps Ultra-HD crisp bitrate
    });

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    return new Promise((resolve, reject) => {
      recorder.onstop = () => {
        const ext = selectedMime.includes('mp4') ? 'mp4' : 'webm';
        const blob = new Blob(chunks, { type: selectedMime });
        const url = URL.createObjectURL(blob);
        onProgress(100, 'Video export ready!');
        resolve({
          blob,
          url,
          filename: `caption-video.${ext}`,
          hasAudio: Boolean(addAudio)
        });
      };

      recorder.onerror = (err) => reject(err);
      recorder.start();

      let currentFrame = 0;
      const intervalMs = 1000 / fps;

      const renderInterval = setInterval(async () => {
        if (currentFrame >= totalFrames) {
          clearInterval(renderInterval);
          recorder.stop();
          return;
        }

        const currentTime = currentFrame / fps;
        if (bgVideoElement) {
          await this.seekVideoToTime(bgVideoElement, currentTime);
        }
        renderer.renderFrame(currentTime, captions, style, bgVideoElement);
        currentFrame++;

        const pct = Math.round(20 + (currentFrame / totalFrames) * 75);
        onProgress(pct, `Encoding frame ${currentFrame}/${totalFrames}...`);
      }, intervalMs);
    });
  }
}

window.VideoExporter = new VideoExporterClass();
