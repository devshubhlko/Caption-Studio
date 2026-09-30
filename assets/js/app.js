/**
 * CaptionStudio — Main Application Controller
 * High-performance state management, multi-step navigation, canvas rendering,
 * real-time timeline editing, audio sync, and FFmpeg.wasm video export.
 */

$(document).ready(function () {
  // Global Studio State
  const state = {
    currentStep: 1, // 1: Upload, 2: Style, 3: Edit & Timeline, 4: Export
    captions: [],
    duration: 0.0,
    currentTime: 0.0,
    isPlaying: false,
    aspectRatio: '16:9',
    width: 1920,
    height: 1080,
    fps: 30,
    quality: 'high',
    selectedCaptionId: null,
    animationFrameId: null,
    lastPlaybackTimestamp: 0,
    mediaMode: 'canvas', // 'canvas' or 'video'
    bgVideoFile: null,
    bgVideoElement: document.createElement('video')
  };

  state.bgVideoElement.crossOrigin = 'anonymous';
  state.bgVideoElement.playsInline = true;
  state.bgVideoElement.preload = 'auto';
  state.bgVideoElement.muted = true;

  // Canvas Renderers
  const previewCanvas = document.getElementById('previewCanvas');
  const mainRenderer = new CanvasRenderer(previewCanvas);
  
  const step1MiniCanvas = document.getElementById('step1MiniCanvas');
  const step1Renderer = step1MiniCanvas ? new CanvasRenderer(step1MiniCanvas) : null;

  const exportPreviewCanvas = document.getElementById('exportPreviewCanvas');
  const exportRenderer = exportPreviewCanvas ? new CanvasRenderer(exportPreviewCanvas) : null;

  const modalBigCanvas = document.getElementById('modalBigPreviewCanvas');
  const modalRenderer = modalBigCanvas ? new CanvasRenderer(modalBigCanvas) : null;

  // Timeline Setup
  const timeline = new Timeline(document.getElementById('timelineTrack'), {
    onSeek: (time) => {
      seekTo(time);
    },
    onSelectCaption: (caption) => {
      highlightCaptionCard(caption.id);
    }
  });

  // ==========================================================
  // VIEW NAVIGATION & STEPPER
  // ==========================================================
  
  function navigateToStep(stepNumber) {
    if (stepNumber > 1) {
      if (!state.captions || state.captions.length === 0) {
        showToast('Please upload an SRT or VTT subtitle file first.', 'warning');
        return;
      }
      if (state.mediaMode === 'video' && !state.bgVideoFile) {
        showToast('Background Video is selected. Please upload a video file.', 'warning');
        return;
      }
      if (AudioManager.enabled && !AudioManager.audioFile) {
        showToast('Audio toggle is ON. Please upload an audio file or switch off Audio.', 'warning');
        return;
      }
    }

    state.currentStep = stepNumber;

    // Toggle views
    $('#viewUpload').toggleClass('hidden', stepNumber !== 1);
    $('#viewEditor').toggleClass('hidden', stepNumber !== 2 && stepNumber !== 3);
    $('#viewExport').toggleClass('hidden', stepNumber !== 4);

    // Update Stepper Badges
    $('.step-item').removeClass('active completed');
    for (let i = 1; i <= 4; i++) {
      const stepEl = $(`#stepIndicator${i}`);
      if (i < stepNumber) {
        stepEl.addClass('completed');
      } else if (i === stepNumber || (stepNumber === 3 && i === 3) || (stepNumber === 2 && i === 2)) {
        stepEl.addClass('active');
      }
    }

    // Render Canvas in current view
    renderCurrentFrame();
    drawWaveform();
  }

  // Stepper clicks
  $('.step-item').on('click', function () {
    const step = parseInt($(this).data('step'), 10);
    navigateToStep(step);
  });

  // Brand click -> Step 1
  $('#navLogoBtn, #navBrandBtn').on('click', () => navigateToStep(1));

  // Forward / Backward navigation buttons
  $('#btnNextToStyle').on('click', () => navigateToStep(2));
  $('#btnBackToUpload').on('click', () => navigateToStep(1));
  $('#btnNextToExport').on('click', () => navigateToStep(4));
  $('#btnExportBackToEdit').on('click', () => navigateToStep(3));

  // ==========================================================
  // LIGHT / DARK MODE THEME MANAGEMENT
  // ==========================================================
  
  function getPreferredTheme() {
    const saved = localStorage.getItem('caption_studio_theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      $('html').removeClass('dark').addClass('light');
      $('#themeIconSun, .login-theme-icon-sun').addClass('hidden');
      $('#themeIconMoon, .login-theme-icon-moon').removeClass('hidden');
    } else {
      $('html').removeClass('light').addClass('dark');
      $('#themeIconSun, .login-theme-icon-sun').removeClass('hidden');
      $('#themeIconMoon, .login-theme-icon-moon').addClass('hidden');
    }
    localStorage.setItem('caption_studio_theme', theme);
    if (typeof drawWaveform === 'function') {
      drawWaveform();
    }
  }

  // Bind both Navbar and Lockscreen theme toggles
  $(document).on('click', '#themeToggleBtn, #loginThemeToggleBtn', function () {
    const current = $('html').hasClass('light') ? 'light' : 'dark';
    const nextTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode`, 'info');
  });

  // Apply saved theme immediately on load
  applyTheme(getPreferredTheme());

  // ==========================================================
  // AUTHENTICATION & LOGIN GATEKEEPER
  // ==========================================================
  let isAppInitialized = false;

  function checkAndEnforceAuth() {
    const isAuthed = window.AuthManager && window.AuthManager.checkAuth();

    if (isAuthed) {
      $('#loginScreenContainer').addClass('hidden');
      $('#appRootContainer').removeClass('hidden');

      if (!isAppInitialized) {
        initApp();
        isAppInitialized = true;
      }
    } else {
      $('#loginScreenContainer').removeClass('hidden');
      $('#appRootContainer').addClass('hidden');

      // Check for remembered credentials stored in cookies
      const cookieCreds = window.AuthManager ? window.AuthManager.getRememberedCookies() : null;
      if (cookieCreds && cookieCreds.remember) {
        $('#loginUserIdInput').val(cookieCreds.userId || '');
        $('#loginPasswordInput').val(cookieCreds.password || '');
        $('#rememberMeCheckbox').prop('checked', true);
      }
    }
  }

  // Handle Login Form Submission
  $('#loginForm').on('submit', async function (e) {
    e.preventDefault();
    const userId = $('#loginUserIdInput').val();
    const password = $('#loginPasswordInput').val();
    const rememberMe = $('#rememberMeCheckbox').is(':checked');

    const btn = $('#btnLoginSubmit');
    const btnText = $('#loginBtnText');
    const btnSpinner = $('#loginBtnSpinner');
    const errBox = $('#loginErrorMessage');
    const errText = $('#loginErrorText');

    // UI Loading state
    btn.prop('disabled', true).addClass('opacity-80');
    btnText.text('Authenticating...');
    btnSpinner.removeClass('hidden');
    errBox.addClass('hidden');

    try {
      const result = await window.AuthManager.login(userId, password, rememberMe);

      if (result.success) {
        errBox.addClass('hidden');
        showToast(result.message, 'success');

        // Smooth transition to studio
        $('#loginScreenContainer').fadeOut(250, function() {
          $('#appRootContainer').removeClass('hidden');
          if (!isAppInitialized) {
            initApp();
            isAppInitialized = true;
          }
        });
      } else {
        errText.text(result.message);
        errBox.removeClass('hidden').removeClass('animate-shake');
        void errBox[0].offsetWidth; // trigger reflow for animation
        errBox.addClass('animate-shake');
      }
    } catch (err) {
      errText.text('An unexpected authentication error occurred.');
      errBox.removeClass('hidden');
    } finally {
      btn.prop('disabled', false).removeClass('opacity-80');
      btnText.text('Sign In & Unlock Studio');
      btnSpinner.addClass('hidden');
    }
  });

  // Password Visibility Toggle
  $('#togglePasswordVisibilityBtn').on('click', function () {
    const input = $('#loginPasswordInput');
    const type = input.attr('type') === 'password' ? 'text' : 'password';
    input.attr('type', type);
    $('#eyeIconOpen').toggleClass('hidden', type === 'text');
    $('#eyeIconClosed').toggleClass('hidden', type !== 'text');
  });

  // Handle Logout
  $('#btnLogoutBtn').on('click', function () {
    if (confirm('Are you sure you want to log out of CaptionStudio?')) {
      // Pause playback if active
      if (state.isPlaying) {
        pausePlayback();
      }

      window.AuthManager.logout();
      showToast('Logged out successfully.', 'info');

      $('#appRootContainer').addClass('hidden');
      $('#loginScreenContainer').fadeIn(200);

      // Reset password input
      $('#loginPasswordInput').val('');
    }
  });

  // ==========================================================
  // STUDIO APP CORE INITIALIZATION
  // ==========================================================
  
  function initApp() {
    applyTheme(getPreferredTheme());
    initPresetCards();
    switchFontLanguage('english', true);
    syncUIWithStyle(StyleManager.getStyle());

    // Listen to style updates
    StyleManager.onChange((newStyle) => {
      syncUIWithStyle(newStyle);
      renderCurrentFrame();
    });

    // Default Resolution
    updateCanvasResolution('16:9');

    // Draw initial empty/simulated waveform
    drawWaveform();

    // Start on Step 1 (Upload)
    navigateToStep(1);
  }

  function init() {
    checkAndEnforceAuth();
  }

  // ==========================================================
  // PLAYBACK & CANVAS PREVIEW LOOP
  // ==========================================================
  
  function renderCurrentFrame() {
    const style = StyleManager.getStyle();
    const bgVid = state.mediaMode === 'video' ? state.bgVideoElement : null;

    // Render on active view canvas
    if (state.currentStep === 2 || state.currentStep === 3) {
      mainRenderer.renderFrame(state.currentTime, state.captions, style, bgVid);
      timeline.setTime(state.currentTime);
      $('#currentTimeDisplay').text(SubtitleParser.formatTime(state.currentTime));
      $('#totalDurationDisplay').text(SubtitleParser.formatTime(state.duration));
    } else if (state.currentStep === 1 && step1Renderer) {
      step1Renderer.renderFrame(state.currentTime, state.captions, style, bgVid);
      $('#step1CurrentTimeDisplay').text(SubtitleParser.formatTime(state.currentTime));
      $('#step1TotalDurationDisplay').text(SubtitleParser.formatTime(state.duration));
      const pct = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
      $('#step1SeekSlider').val(pct);
    } else if (state.currentStep === 4 && exportRenderer) {
      exportRenderer.renderFrame(state.currentTime, state.captions, style, bgVid);
      $('#exportCurrentTimeDisplay').text(SubtitleParser.formatTime(state.currentTime));
      $('#exportTotalDurationDisplay').text(SubtitleParser.formatTime(state.duration));
      const pct = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
      $('#exportSeekSlider').val(pct);
    }

    // Render on Theater Modal if open
    if (!$('#bigPreviewModal').hasClass('hidden') && modalRenderer) {
      modalRenderer.renderFrame(state.currentTime, state.captions, style, bgVid);
      $('#modalCurrentTimeDisplay').text(SubtitleParser.formatTime(state.currentTime));
      $('#modalTotalDurationDisplay').text(SubtitleParser.formatTime(state.duration));
      const pct = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
      $('#modalSeekSlider').val(pct);
    }

    // Highlight active cue in list
    const active = state.captions.find(c => state.currentTime >= c.start && state.currentTime < c.end);
    if (active) {
      $('.caption-item').removeClass('border-purple-500 bg-purple-950/30');
      $(`.caption-item[data-id="${active.id}"]`).addClass('border-purple-500 bg-purple-950/30');
    }
  }

  function animationLoop(timestamp) {
    if (!state.isPlaying) return;

    if (!state.lastPlaybackTimestamp) {
      state.lastPlaybackTimestamp = timestamp;
    }

    const delta = (timestamp - state.lastPlaybackTimestamp) / 1000;
    state.lastPlaybackTimestamp = timestamp;

    state.currentTime += delta;

    if (state.currentTime >= state.duration) {
      state.currentTime = state.duration;
      pause();
      state.currentTime = 0;
      renderCurrentFrame();
      return;
    }

    renderCurrentFrame();
    state.animationFrameId = requestAnimationFrame(animationLoop);
  }

  function play() {
    if (state.captions.length === 0) {
      showToast('Please upload an SRT or VTT subtitle file first.', 'warning');
      return;
    }

    if (state.currentTime >= state.duration) {
      state.currentTime = 0;
    }
    state.isPlaying = true;
    state.lastPlaybackTimestamp = 0;

    const pauseIcon = `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    const pauseIconSmall = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
    $('#btnPlayPause').html(pauseIcon);
    $('#btnStep1PlayPause, #btnExportPlayPause, #btnModalPlayPause').html(pauseIconSmall);

    if (AudioManager.enabled && AudioManager.audioFile) {
      AudioManager.play(state.currentTime);
      if (state.bgVideoElement && state.mediaMode === 'video') {
        state.bgVideoElement.muted = true;
      }
    } else if (state.mediaMode === 'video' && state.bgVideoFile) {
      // Inbuilt video audio is used if separate audio track is off
      const vol = parseFloat($('#previewVolumeSlider').val() || 100) / 100;
      state.bgVideoElement.muted = false;
      state.bgVideoElement.volume = vol;
    }

    if (state.mediaMode === 'video' && state.bgVideoElement && state.bgVideoElement.duration) {
      state.bgVideoElement.currentTime = state.currentTime % state.bgVideoElement.duration;
      state.bgVideoElement.play().catch(() => {});
    }

    state.animationFrameId = requestAnimationFrame(animationLoop);
  }

  function pause() {
    state.isPlaying = false;
    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = null;
    }

    const playIcon = `<svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    const playIconSmall = `<svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    $('#btnPlayPause').html(playIcon);
    $('#btnStep1PlayPause, #btnExportPlayPause, #btnModalPlayPause').html(playIconSmall);

    if (AudioManager.enabled) {
      AudioManager.pause();
    }
    if (state.bgVideoElement) {
      state.bgVideoElement.pause();
    }
  }

  function togglePlay() {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  }

  function seekTo(time) {
    state.currentTime = Math.max(0, Math.min(state.duration, time));
    if (AudioManager.enabled && AudioManager.audioFile) {
      AudioManager.seek(state.currentTime);
    }
    if (state.mediaMode === 'video' && state.bgVideoElement && state.bgVideoElement.duration) {
      state.bgVideoElement.currentTime = state.currentTime % state.bgVideoElement.duration;
    }
    renderCurrentFrame();
  }

  // ==========================================================
  // RESOLUTION & ASPECT RATIO
  // ==========================================================
  
  function updateCanvasResolution(aspect) {
    state.aspectRatio = aspect;
    const wrapper = document.getElementById('canvasWrapper');

    if (aspect === '16:9') {
      state.width = 1920;
      state.height = 1080;
      if (wrapper) wrapper.setAttribute('data-aspect', '16-9');
      $('#exportResolutionLabel').text('1920 × 1080 (1080p)');
    } else if (aspect === '9:16') {
      state.width = 1080;
      state.height = 1920;
      if (wrapper) wrapper.setAttribute('data-aspect', '9-16');
      $('#exportResolutionLabel').text('1080 × 1920 (Shorts)');
    } else if (aspect === '1:1') {
      state.width = 1080;
      state.height = 1080;
      if (wrapper) wrapper.setAttribute('data-aspect', '1-1');
      $('#exportResolutionLabel').text('1080 × 1080 (Square)');
    }

    mainRenderer.setResolution(state.width, state.height, aspect);
    if (step1Renderer) step1Renderer.setResolution(state.width, state.height, aspect);
    if (exportRenderer) exportRenderer.setResolution(state.width, state.height, aspect);
    if (modalRenderer) modalRenderer.setResolution(state.width, state.height, aspect);
    
    const modalWrapper = document.getElementById('modalCanvasWrapper');
    if (modalWrapper) {
      modalWrapper.style.aspectRatio = aspect === '16:9' ? '16/9' : (aspect === '9:16' ? '9/16' : '1/1');
    }
    $('#modalAspectSelect').val(aspect);

    renderCurrentFrame();
  }

  $('#canvasAspectSelect, #step1ResolutionSelect, #modalAspectSelect').on('change', function () {
    const val = $(this).val();
    $('#canvasAspectSelect').val(val);
    $('#step1ResolutionSelect').val(val);
    $('#modalAspectSelect').val(val);
    updateCanvasResolution(val);
  });

  // ==========================================================
  // SUBTITLE PARSING & PREVIEW TABLE
  // ==========================================================
  
  function processSubtitleContent(content, filename) {
    const result = SubtitleParser.parse(content, filename);

    if (result.error) {
      showToast(result.error, 'error');
      return;
    }

    state.captions = result.captions;
    state.duration = Math.max(1.0, result.duration);
    state.currentTime = 0;

    // Badges update
    $('#loadedSubtitleBadge').removeClass('hidden');
    $('#loadedSubtitleName').text(filename || 'custom_subtitles.srt');
    $('#loadedSubtitleMeta').text(`${state.captions.length} captions • ${SubtitleParser.formatTime(state.duration)}`);
    $('#previewTotalCount').text(`Total: ${state.captions.length} captions`);
    $('#captionsCountLabel').text(state.captions.length);

    // Auto-detect Hindi vs English subtitle language and switch font tab
    if (result.isDevanagari) {
      switchFontLanguage('hindi', false);
      showToast('🇮🇳 Hindi Subtitles: Switched to Hindi Google Fonts', 'info');
    } else {
      switchFontLanguage('english', false);
    }

    // Render Subtitle Table & List
    renderSubtitlePreviewTable();
    renderCaptionList();
    timeline.setData(state.captions, state.duration);
    renderCurrentFrame();
  }

  function renderSubtitlePreviewTable(filterText = '') {
    const tbody = $('#subtitleTableBody');
    tbody.empty();

    const filtered = filterText
      ? state.captions.filter(c => c.text.toLowerCase().includes(filterText.toLowerCase()))
      : state.captions;

    if (filtered.length === 0) {
      tbody.append(`
        <tr>
          <td colspan="4" class="p-8 text-center text-slate-400 font-sans text-xs">
            ${state.captions.length === 0 ? 'No subtitle file uploaded yet. Upload an SRT or VTT file above to get started.' : 'No matching captions found.'}
          </td>
        </tr>
      `);
      return;
    }

    filtered.forEach((cap, idx) => {
      tbody.append(`
        <tr class="hover:bg-purple-50/60 dark:hover:bg-slate-800/40 transition">
          <td class="p-2 text-slate-400 dark:text-slate-500 font-bold">${idx + 1}</td>
          <td class="p-2 text-indigo-600 dark:text-indigo-300">${SubtitleParser.formatTime(cap.start)}</td>
          <td class="p-2 text-indigo-600 dark:text-indigo-300">${SubtitleParser.formatTime(cap.end)}</td>
          <td class="p-2 text-slate-800 dark:text-slate-200 font-sans truncate max-w-xs">${cap.text}</td>
        </tr>
      `);
    });
  }

  $('#filterSubtitleInput').on('input', function () {
    renderSubtitlePreviewTable($(this).val().trim());
  });

  // Media Mode Switcher (Solid Canvas vs Background Video)
  $('#mediaModeCanvasBtn').on('click', function () {
    state.mediaMode = 'canvas';
    $('.media-mode-btn').removeClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow').addClass('text-slate-600 dark:text-slate-400');
    $(this).addClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow').removeClass('text-slate-600 dark:text-slate-400');
    $('#videoDropZoneCard').addClass('hidden');
    renderCurrentFrame();
    showToast('Switched to Solid Canvas Background', 'info');
  });

  $('#mediaModeVideoBtn').on('click', function () {
    state.mediaMode = 'video';
    $('.media-mode-btn').removeClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow').addClass('text-slate-600 dark:text-slate-400');
    $(this).addClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow').removeClass('text-slate-600 dark:text-slate-400');
    $('#videoDropZoneCard').removeClass('hidden');
    renderCurrentFrame();
    if (!state.bgVideoFile) {
      showToast('Background Video selected: Please choose or drop a video file.', 'info');
    }
  });

  // Drag and Drop Subtitles
  const dropZone = document.getElementById('subtitleDropZone');
  if (dropZone) {
    ['dragenter', 'dragover'].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.add('border-purple-500');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      dropZone.addEventListener(name, (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-purple-500');
      });
    });
    dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) handleSubtitleFile(file);
    });
  }

  $('#step1SubtitleInput').on('change', function (e) {
    const file = e.target.files[0];
    if (file) handleSubtitleFile(file);
  });

  function handleSubtitleFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      processSubtitleContent(ev.target.result, file.name);
      showToast(`Loaded ${file.name}`, 'success');
    };
    reader.onerror = () => showToast('Failed to read subtitle file.', 'error');
    reader.readAsText(file);
  }

  // Background Video Upload Handling
  const videoDropZone = document.getElementById('videoDropZone');
  if (videoDropZone) {
    ['dragenter', 'dragover'].forEach(name => {
      videoDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        videoDropZone.classList.add('border-pink-500');
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      videoDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        videoDropZone.classList.remove('border-pink-500');
      });
    });
    videoDropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file) handleVideoFile(file);
    });
  }

  $('#step1VideoInput').on('change', function (e) {
    const file = e.target.files[0];
    if (file) handleVideoFile(file);
  });

  function handleVideoFile(file) {
    state.bgVideoFile = file;
    state.mediaMode = 'video';

    // Update UI Switcher
    $('.media-mode-btn').removeClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow').addClass('text-slate-600 dark:text-slate-400');
    $('#mediaModeVideoBtn').addClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow').removeClass('text-slate-600 dark:text-slate-400');
    $('#videoDropZoneCard').removeClass('hidden');

    const url = URL.createObjectURL(file);
    state.bgVideoElement.src = url;
    state.bgVideoElement.load();

    const onMeta = () => {
      if (state.bgVideoElement.duration && (state.bgVideoElement.duration > state.duration || state.duration <= 1.0)) {
        state.duration = state.bgVideoElement.duration;
        timeline.setData(state.captions, state.duration);
      }
      $('#loadedVideoBadge').removeClass('hidden');
      $('#loadedVideoName').text(file.name);
      $('#loadedVideoMeta').text(`${SubtitleParser.formatTime(state.bgVideoElement.duration || 0)} • ${state.bgVideoElement.videoWidth || 0}x${state.bgVideoElement.videoHeight || 0}`);
      renderCurrentFrame();
      showToast(`Loaded background video: ${file.name}`, 'success');
    };

    state.bgVideoElement.onloadedmetadata = onMeta;
    state.bgVideoElement.onloadeddata = () => {
      renderCurrentFrame();
    };
  }

  // ==========================================================
  // CAPTIONS IN-PLACE EDITOR (Step 2/3)
  // ==========================================================
  
  function renderCaptionList() {
    const listEl = $('#captionListContainer');
    listEl.empty();

    state.captions.forEach((caption, index) => {
      const card = $(`
        <div class="caption-item p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-purple-400 dark:hover:border-slate-700 transition" data-id="${caption.id}">
          <div class="flex items-center justify-between mb-1.5 text-[11px]">
            <span class="font-bold text-purple-600 dark:text-purple-400 font-mono">#${index + 1}</span>
            <div class="flex items-center gap-1">
              <input type="text" class="input-start-time bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] rounded px-1 w-16 text-center font-mono" value="${SubtitleParser.formatTime(caption.start)}">
              <span class="text-slate-400 dark:text-slate-500 text-[10px]">→</span>
              <input type="text" class="input-end-time bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] rounded px-1 w-16 text-center font-mono" value="${SubtitleParser.formatTime(caption.end)}">
              <button class="btn-delete-caption text-slate-400 hover:text-red-500 p-0.5" title="Delete">✕</button>
            </div>
          </div>
          <textarea class="input-caption-text w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none" rows="2">${caption.text}</textarea>
        </div>
      `);

      card.find('.input-caption-text').on('input', function () {
        caption.text = $(this).val();
        timeline.renderBlocks();
        renderSubtitlePreviewTable();
        renderCurrentFrame();
      });

      card.find('.input-start-time').on('change', function () {
        const val = SubtitleParser.parseTimestamp($(this).val());
        if (!isNaN(val) && val >= 0 && val < caption.end) {
          caption.start = val;
          recalculateDuration();
        } else {
          $(this).val(SubtitleParser.formatTime(caption.start));
        }
      });

      card.find('.input-end-time').on('change', function () {
        const val = SubtitleParser.parseTimestamp($(this).val());
        if (!isNaN(val) && val > caption.start) {
          caption.end = val;
          recalculateDuration();
        } else {
          $(this).val(SubtitleParser.formatTime(caption.end));
        }
      });

      card.find('.btn-delete-caption').on('click', function () {
        state.captions = state.captions.filter(c => c.id !== caption.id);
        recalculateDuration();
        renderCaptionList();
      });

      card.on('click', function (e) {
        if (!$(e.target).is('input, textarea, button')) {
          seekTo(caption.start);
          timeline.selectCaption(caption.id);
        }
      });

      listEl.append(card);
    });
  }

  function recalculateDuration() {
    state.captions.sort((a, b) => a.start - b.start);
    const maxEnd = state.captions.reduce((m, c) => Math.max(m, c.end), 0);
    state.duration = Math.max(1.0, Math.ceil(maxEnd * 10) / 10);
    timeline.setData(state.captions, state.duration);
    renderSubtitlePreviewTable();
    renderCurrentFrame();
  }

  function highlightCaptionCard(captionId) {
    $('.caption-item').removeClass('border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30');
    const target = $(`.caption-item[data-id="${captionId}"]`);
    if (target.length) {
      target.addClass('border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30');
      target[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  $('#btnAddCaption, #tlAddCaptionBtn').on('click', function () {
    const last = state.captions[state.captions.length - 1];
    const newStart = last ? last.end : 0.0;
    const newEnd = newStart + 2.5;
    const newId = (state.captions.reduce((m, c) => Math.max(m, c.id), 0) || 0) + 1;

    state.captions.push({
      id: newId,
      start: newStart,
      end: newEnd,
      text: 'New caption text'
    });

    recalculateDuration();
    renderCaptionList();
    seekTo(newStart);
  });

  // ==========================================================
  // AUDIO & WAVEFORM RENDERING (Plan 2)
  // ==========================================================
  
  function drawWaveform() {
    const canvas = document.getElementById('audioWaveformCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.clientWidth || 600;
    canvas.height = 38;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const isDark = $('html').hasClass('dark');
    const hasAudio = AudioManager.enabled && AudioManager.audioFile;
    const barWidth = 3;
    const gap = 2;
    const totalBars = Math.floor(canvas.width / (barWidth + gap));

    for (let i = 0; i < totalBars; i++) {
      const x = i * (barWidth + gap);
      const randH = hasAudio 
        ? Math.sin(i * 0.15) * 12 + Math.cos(i * 0.3) * 8 + 14 
        : Math.sin(i * 0.2) * 4 + 8;
      
      ctx.fillStyle = hasAudio ? '#8b5cf6' : (isDark ? '#334155' : '#cbd5e1');
      ctx.fillRect(x, (canvas.height - randH) / 2, barWidth, randH);
    }
  }

  $('#step1AudioToggle, #exportAudioToggle').on('change', function () {
    const isChecked = $(this).is(':checked');
    $('#step1AudioToggle').prop('checked', isChecked);
    $('#exportAudioToggle').prop('checked', isChecked);

    AudioManager.setEnabled(isChecked);
    $('#step1AudioControls').toggleClass('opacity-50 pointer-events-none', !isChecked);
    
    if (isChecked) {
      $('#audioOptionalBadge').text('(Required - On)').removeClass('text-slate-500 font-normal').addClass('text-amber-500 dark:text-amber-400 font-semibold');
      $('#exportAudioSummaryText').text('AAC • 128 kbps • Stereo');
      $('#chkAudioReady').removeClass('opacity-50');
      if (!AudioManager.audioFile) {
        showToast('Audio toggle is ON. Please choose or drop your audio file.', 'info');
      }
    } else {
      $('#audioOptionalBadge').text('(Optional - Off)').removeClass('text-amber-500 dark:text-amber-400 font-semibold').addClass('text-slate-500 font-normal');
      $('#exportAudioSummaryText').text('Silent (No Audio Track)');
      $('#chkAudioReady').addClass('opacity-50');
    }

    drawWaveform();
  });

  // Drag and drop Audio File
  const audioDropZone = document.getElementById('audioDropZone');
  if (audioDropZone) {
    ['dragenter', 'dragover'].forEach(name => {
      audioDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        if (AudioManager.enabled) {
          audioDropZone.classList.add('border-blue-500');
        }
      });
    });
    ['dragleave', 'drop'].forEach(name => {
      audioDropZone.addEventListener(name, (e) => {
        e.preventDefault();
        audioDropZone.classList.remove('border-blue-500');
      });
    });
    audioDropZone.addEventListener('drop', async (e) => {
      if (!AudioManager.enabled) return;
      const file = e.dataTransfer.files[0];
      if (file) {
        try {
          const info = await AudioManager.loadAudioFile(file);
          $('#step1AudioName').text(`✓ ${info.name}`);
          $('#step1AudioDur').text(SubtitleParser.formatTime(info.duration));
          $('#step1LoadedAudioBadge').removeClass('hidden');
          drawWaveform();
          showToast(`Audio loaded: ${info.name}`, 'success');
        } catch (err) {
          showToast(err.message || 'Could not load audio file', 'error');
        }
      }
    });
  }

  $('#step1AudioFileInput').on('change', async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const info = await AudioManager.loadAudioFile(file);
      $('#step1AudioName').text(`✓ ${info.name}`);
      $('#step1AudioDur').text(SubtitleParser.formatTime(info.duration));
      $('#step1LoadedAudioBadge').removeClass('hidden');
      drawWaveform();
      showToast(`Audio loaded: ${info.name}`, 'success');
    } catch (err) {
      showToast(err.message || 'Could not load audio file', 'error');
    }
  });

  $('#step1VolumeSlider, #exportVolumeSlider, #previewVolumeSlider').on('input', function () {
    const val = parseFloat($(this).val()) / 100;
    AudioManager.setVolume(val);
    $('#step1VolumeText').text(`${Math.round(val * 100)}%`);
  });

  $('#step1AudioLoop').on('change', function () {
    AudioManager.setLoop($(this).is(':checked'));
  });

  // ==========================================================
  // STYLE INSPECTOR & PRESETS (Plan 3)
  // ==========================================================
  
  // Inspector Tab Toggles
  $('#inspectorTabStyle').on('click', function () {
    switchInspectorTab('style', $(this));
  });
  $('#inspectorTabPos').on('click', function () {
    switchInspectorTab('pos', $(this));
  });
  $('#inspectorTabBrand').on('click', function () {
    switchInspectorTab('brand', $(this));
  });
  $('#inspectorTabAnim').on('click', function () {
    switchInspectorTab('anim', $(this));
  });
  $('#inspectorTabPresets').on('click', function () {
    switchInspectorTab('presets', $(this));
  });

  function switchInspectorTab(tab, btn) {
    $('#inspectorTabStyle, #inspectorTabPos, #inspectorTabBrand, #inspectorTabAnim, #inspectorTabPresets')
      .removeClass('bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold')
      .addClass('text-slate-400');
    btn.addClass('bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold').removeClass('text-slate-400');

    $('#inspectorStylePanel').toggleClass('hidden', tab !== 'style');
    $('#inspectorPosPanel').toggleClass('hidden', tab !== 'pos');
    $('#inspectorBrandPanel').toggleClass('hidden', tab !== 'brand');
    $('#inspectorAnimPanel').toggleClass('hidden', tab !== 'anim');
    $('#inspectorPresetsPanel').toggleClass('hidden', tab !== 'presets');
  }

  // ==========================================================
  // PRESET GALLERY WITH CATEGORY FILTERING & SEARCH
  // ==========================================================
  let activePresetCategory = 'all';
  let presetSearchQuery = '';

  function initPresetCards() {
    const container = $('#presetCardsContainer');
    container.empty();

    let presets = PresetManager.getAllPresets();

    // Category filter
    if (activePresetCategory === 'custom') {
      presets = presets.filter(p => p.isCustom);
    } else if (activePresetCategory !== 'all') {
      presets = presets.filter(p => p.category === activePresetCategory);
    }

    // Search filter
    if (presetSearchQuery) {
      const q = presetSearchQuery.toLowerCase();
      presets = presets.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.style && p.style.fontFamily && p.style.fontFamily.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (presets.length === 0) {
      container.append(`
        <div class="p-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
          No presets found for this category or search.
        </div>
      `);
      return;
    }

    const currentStyle = StyleManager.getStyle();

    presets.forEach(p => {
      const isSelected = currentStyle.fontFamily === p.style.fontFamily && currentStyle.textColor === p.style.textColor;
      const isHindi = p.category === 'hindi' || (p.style.fontFamily && /Noto|Mukta|Hind|Baloo|Kalam|Rajdhani|Khand|Rozha|Yatra|Anek|Tiro|Karma|Eczar|Gotu|Sarala|Modak|Ranga/i.test(p.style.fontFamily));
      const categoryLabel = p.category ? p.category.toUpperCase() : 'PRESET';

      const card = $(`
        <div class="preset-card p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border ${isSelected ? 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20' : 'border-slate-200 dark:border-slate-800'} flex items-center justify-between cursor-pointer hover:border-purple-500 transition group shadow-sm" data-id="${p.id}">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-7 h-7 rounded-lg border border-slate-300 dark:border-white/20 shadow-sm flex items-center justify-center shrink-0" style="background: ${p.style.canvasBgColor || '#111'};">
              <span class="text-xs font-bold" style="color: ${p.style.textColor || '#FFF'}; font-family: '${p.style.fontFamily}', sans-serif;">${isHindi ? 'अ' : 'Aa'}</span>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">${p.name}</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded font-semibold ${isHindi ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'} shrink-0">${categoryLabel}</span>
              </div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">${p.style.fontFamily} • ${p.style.animationStyle || 'pop'}</span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            ${p.isCustom ? `<button class="btn-del-preset text-slate-400 hover:text-red-500 text-xs p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/30 transition" data-id="${p.id}" title="Delete Custom Preset">✕</button>` : ''}
          </div>
        </div>
      `);

      card.on('click', async function (e) {
        if ($(e.target).closest('button').length) return;
        $('.preset-card').removeClass('border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20');
        card.addClass('border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/20');
        
        if (p.style.fontFamily) {
          await window.FontManager.loadGoogleFont(p.style.fontFamily);
        }
        StyleManager.applyPreset(p.style);
        showToast(`Applied preset: ${p.name}`, 'success');
      });

      card.find('.btn-del-preset').on('click', function (e) {
        e.stopPropagation();
        PresetManager.deleteCustomPreset(p.id);
        initPresetCards();
      });

      container.append(card);
    });
  }

  // Preset Filter Pill & Search Listeners
  $(document).on('click', '.preset-filter-btn', function() {
    $('.preset-filter-btn')
      .removeClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-sm')
      .addClass('bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium');
    
    $(this)
      .addClass('active bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-sm')
      .removeClass('bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium');

    activePresetCategory = $(this).data('category') || 'all';
    initPresetCards();
  });

  $('#presetSearchInput').on('input', function() {
    presetSearchQuery = ($(this).val() || '').trim();
    initPresetCards();
  });

  // ==========================================================
  // GOOGLE FONTS VISUAL GALLERY & INFINITE SCROLL CONTROLLER
  // ==========================================================
  
  const fontGalleryState = {
    language: 'english', // 'hindi' or 'english'
    page: 1,
    pageSize: 10,
    searchTerm: '',
    hasMore: true,
    isLoading: false
  };

  function switchFontLanguage(lang, preserveSelection = false) {
    fontGalleryState.language = lang;
    fontGalleryState.page = 1;
    fontGalleryState.hasMore = true;
    fontGalleryState.searchTerm = ($('#fontSearchInput').val() || '').trim();

    // Toggle button active visual states
    if (lang === 'hindi') {
      $('#fontTabHindi')
        .addClass('bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow active')
        .removeClass('text-slate-600 dark:text-slate-400');
      $('#fontTabEnglish')
        .removeClass('bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow active')
        .addClass('text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');
      $('#fontCountBadge').text('🇮🇳 Hindi Active');
    } else {
      $('#fontTabEnglish')
        .addClass('bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow active')
        .removeClass('text-slate-600 dark:text-slate-400');
      $('#fontTabHindi')
        .removeClass('bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow active')
        .addClass('text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');
      $('#fontCountBadge').text('🔤 English Active');
    }

    // Default font selection if not preserving
    if (!preserveSelection) {
      const current = StyleManager.getStyle().fontFamily;
      if (lang === 'hindi') {
        const isAlreadyHindi = window.FontManager.fonts.hindi.some(f => f.name.toLowerCase() === current.toLowerCase());
        if (!isAlreadyHindi) {
          selectAndApplyFont('Noto Sans Devanagari');
        }
      } else {
        const isAlreadyEng = window.FontManager.fonts.english.some(f => f.name.toLowerCase() === current.toLowerCase());
        if (!isAlreadyEng) {
          selectAndApplyFont('Poppins');
        }
      }
    }

    renderFontGallery(true);
  }

  function renderFontGallery(isReset = false) {
    const container = $('#fontCardGallery');
    if (isReset) {
      container.empty();
      fontGalleryState.page = 1;
      fontGalleryState.hasMore = true;
    }

    if (fontGalleryState.isLoading || (!fontGalleryState.hasMore && !isReset)) return;

    fontGalleryState.isLoading = true;
    $('#fontLoadingSpinner').removeClass('hidden');

    const batch = window.FontManager.getPaginatedFonts(
      fontGalleryState.language,
      fontGalleryState.page,
      fontGalleryState.pageSize,
      fontGalleryState.searchTerm
    );

    fontGalleryState.hasMore = batch.hasMore;

    // Inject preview styles
    window.FontManager.loadPreviewFonts(batch.items.map(f => f.name));

    const currentFont = StyleManager.getStyle().fontFamily;

    if (batch.items.length === 0 && isReset) {
      container.html(`
        <div class="p-4 text-center text-xs text-slate-400">
          No fonts found matching "${fontGalleryState.searchTerm}".
        </div>
      `);
    } else {
      batch.items.forEach(font => {
        const isSelected = font.name.toLowerCase() === currentFont.toLowerCase();
        const sampleText = font.preview;

        const isCustomDirect = !!font.isCustomDirect;

        const card = $(`
          <div class="font-preview-card p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
            isCustomDirect
              ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/60 ring-1 ring-purple-500'
              : isSelected
                ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500'
                : 'border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-purple-400 dark:hover:border-slate-700'
          }" data-font="${font.name}">
            <div class="flex flex-col gap-0.5 overflow-hidden">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold ${isCustomDirect ? 'text-purple-700 dark:text-purple-300' : 'text-slate-800 dark:text-slate-100'}">${font.name}</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded ${isCustomDirect ? 'bg-purple-600 text-white font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'} font-medium">${font.category}</span>
              </div>
              <div class="text-[13px] font-medium text-slate-600 dark:text-slate-300 truncate" style="font-family: '${font.name}', sans-serif;">
                ${isCustomDirect ? '✨ Click to load & use this Google Font' : sampleText}
              </div>
            </div>
            <div class="font-check-icon ${isSelected ? 'text-purple-600 dark:text-purple-400 font-bold' : isCustomDirect ? 'text-purple-600 dark:text-purple-400 font-bold' : 'opacity-0'} text-xs shrink-0 pl-2">
              ${isCustomDirect ? '➕ Use' : '✓'}
            </div>
          </div>
        `);

        card.on('click', () => {
          selectAndApplyFont(font.name);
        });

        container.append(card);
      });
    }

    fontGalleryState.isLoading = false;
    $('#fontLoadingSpinner').addClass('hidden');
  }

  async function selectAndApplyFont(fontName) {
    // Checkmark animation
    $('.font-preview-card').removeClass('border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500')
      .addClass('border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60');
    $('.font-check-icon').addClass('opacity-0').removeClass('text-purple-600 dark:text-purple-400 font-bold');

    const targetCard = $(`.font-preview-card[data-font="${fontName}"]`);
    if (targetCard.length) {
      targetCard.addClass('border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500');
      targetCard.find('.font-check-icon').removeClass('opacity-0').addClass('text-purple-600 dark:text-purple-400 font-bold');
    }

    $('#activeFontNameDisplay').text(fontName);
    $('#fontPreviewSample').css('font-family', `"${fontName}", "Noto Sans Devanagari", sans-serif`);
    $('#fontPreviewSample').text(`Aa / ${fontName}`);

    await window.FontManager.loadGoogleFont(fontName);
    StyleManager.update({ fontFamily: fontName });
    renderCurrentFrame();
  }

  // Infinite Scroll Trigger
  $('#fontCardGallery').on('scroll', function () {
    const el = this;
    const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (scrollBottom < 50 && fontGalleryState.hasMore && !fontGalleryState.isLoading) {
      fontGalleryState.page++;
      renderFontGallery(false);
    }
  });

  // Tab click bindings
  $('#fontTabHindi').on('click', () => switchFontLanguage('hindi', false));
  $('#fontTabEnglish').on('click', () => switchFontLanguage('english', false));

  // Search filter typing
  $('#fontSearchInput').on('input', function () {
    fontGalleryState.searchTerm = $(this).val().trim();
    renderFontGallery(true);
  });

  // Background catalog update handler
  window.onFontListUpdated = () => {
    renderFontGallery(true);
  };

  function updateFontPreview(fontName) {
    $('#activeFontNameDisplay').text(fontName);
    $('#fontPreviewSample').css('font-family', `"${fontName}", "Noto Sans Devanagari", sans-serif`);
    $('#fontPreviewSample').text(`Aa / ${fontName}`);
  }

  function syncUIWithStyle(style) {
    updateFontPreview(style.fontFamily);
    $('.font-preview-card').removeClass('border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500')
      .addClass('border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/60');
    $('.font-check-icon').addClass('opacity-0').removeClass('text-purple-600 dark:text-purple-400 font-bold');

    const targetCard = $(`.font-preview-card[data-font="${style.fontFamily}"]`);
    if (targetCard.length) {
      targetCard.addClass('border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 ring-1 ring-purple-500');
      targetCard.find('.font-check-icon').removeClass('opacity-0').addClass('text-purple-600 dark:text-purple-400 font-bold');
    }

    $('#fontSizeInput').val(style.fontSize);
    $('#fontSizeValue').text(`${style.fontSize}px`);
    $('#fontWeightSelect').val(style.fontWeight);

    $('#textColorInput').val(style.textColor);
    $('#canvasBgColorInput').val(style.canvasBgColor);

    // Box Pill
    $('#enableBoxToggle').prop('checked', style.enableBox);
    $('#boxControlsSection').toggleClass('hidden', !style.enableBox);
    $('#boxColorInput').val(style.boxColor);
    $('#boxOpacityInput').val(Math.round(style.boxOpacity * 100));
    $('#boxOpacityValue').text(`${Math.round(style.boxOpacity * 100)}%`);

    // Stroke
    $('#enableStrokeToggle').prop('checked', style.enableStroke);
    $('#strokeControlsSection').toggleClass('hidden', !style.enableStroke);
    $('#strokeColorInput').val(style.strokeColor);
    $('#strokeWidthInput').val(style.strokeWidth);
    $('#strokeWidthValue').text(`${style.strokeWidth}px`);

    // Alignment
    $('.btn-align').removeClass('bg-purple-600 text-white');
    $(`.btn-align[data-align="${style.textAlign}"]`).addClass('bg-purple-600 text-white');
    $('#verticalPosSelect').val(style.verticalPosition);

    // Position 9-Grid & Custom Sliders
    if (style.presetPosition && style.presetPosition !== 'custom') {
      $('.btn-pos-preset').removeClass('active bg-purple-600 text-white shadow').addClass('bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300');
      $(`.btn-pos-preset[data-pos="${style.presetPosition}"]`).addClass('active bg-purple-600 text-white shadow').removeClass('bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300');
    } 

    if (typeof style.customPosX === 'number') {
      $('#customPosXInput').val(style.customPosX);
      $('#customPosXValue').text(`${style.customPosX}%`);
    }
    
    if (typeof style.customPosY === 'number') {
      $('#customPosYInput').val(style.customPosY);
      $('#customPosYValue').text(`${style.customPosY}%`);
    }

    // Brand Watermark
    $('#enableWatermarkToggle').prop('checked', !!style.enableWatermark);
    $('#watermarkControlsSection').toggleClass('hidden', !style.enableWatermark);
    $('#watermarkTextInput').val(style.watermarkText || '@the hindi diary');
    $('#watermarkPosSelect').val(style.watermarkPos || 'bottom-right');
    $('#watermarkColorInput').val(style.watermarkColor || '#FFFFFF');
    if (style.watermarkSize) {
      $('#watermarkSizeInput').val(style.watermarkSize);
      $('#watermarkSizeValue').text(`${style.watermarkSize}px`);
    }
    if (typeof style.watermarkOpacity === 'number') {
      const pct = Math.round(style.watermarkOpacity * 100);
      $('#watermarkOpacityInput').val(pct);
      $('#watermarkOpacityValue').text(`${pct}%`);
    }

    // Animation
    $('#animationSelect').val(style.animationStyle);
  }

  // Style inputs
  $('#fontFamilySelect').on('change', async function () {
    const font = $(this).val();
    await window.FontManager.loadGoogleFont(font);
    StyleManager.update({ fontFamily: font });
  });

  $('#fontSizeInput').on('input', function () {
    const size = parseInt($(this).val(), 10);
    $('#fontSizeValue').text(`${size}px`);
    StyleManager.update({ fontSize: size });
  });

  $('#fontWeightSelect').on('change', function () {
    StyleManager.update({ fontWeight: $(this).val() });
  });

  $('#textColorInput').on('input', function () {
    StyleManager.update({ textColor: $(this).val() });
  });

  $('#canvasBgColorInput').on('input', function () {
    StyleManager.update({ canvasBgColor: $(this).val() });
  });

  $('#enableStrokeToggle').on('change', function () {
    StyleManager.update({ enableStroke: $(this).is(':checked') });
  });

  $('#strokeColorInput').on('input', function () {
    StyleManager.update({ strokeColor: $(this).val() });
  });

  $('#strokeWidthInput').on('input', function () {
    const val = parseInt($(this).val(), 10);
    $('#strokeWidthValue').text(`${val}px`);
    StyleManager.update({ strokeWidth: val });
  });

  $('#enableBoxToggle').on('change', function () {
    StyleManager.update({ enableBox: $(this).is(':checked') });
  });

  $('#boxColorInput').on('input', function () {
    StyleManager.update({ boxColor: $(this).val() });
  });

  $('#boxOpacityInput').on('input', function () {
    const pct = parseInt($(this).val(), 10);
    $('#boxOpacityValue').text(`${pct}%`);
    StyleManager.update({ boxOpacity: pct / 100 });
  });

  $('.btn-align').on('click', function () {
    $('.btn-align').removeClass('bg-purple-600 text-white');
    $(this).addClass('bg-purple-600 text-white');
    StyleManager.update({ textAlign: $(this).data('align') });
  });

  $('#verticalPosSelect').on('change', function () {
    StyleManager.update({ verticalPosition: $(this).val() });
  });

  // Position 9-Grid Preset Buttons
  $('.btn-pos-preset').on('click', function () {
    const pos = $(this).data('pos');
    $('.btn-pos-preset').removeClass('active bg-purple-600 text-white shadow').addClass('bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300');
    $(this).addClass('active bg-purple-600 text-white shadow').removeClass('bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300');

    StyleManager.update({ presetPosition: pos });
    renderCurrentFrame();
  });

  // Custom Position Coordinate Sliders
  $('#customPosXInput').on('input', function () {
    const val = parseInt($(this).val(), 10);
    $('#customPosXValue').text(`${val}%`);
    $('.btn-pos-preset').removeClass('active bg-purple-600 text-white shadow').addClass('bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300');
    StyleManager.update({ presetPosition: 'custom', customPosX: val });
    renderCurrentFrame();
  });

  $('#customPosYInput').on('input', function () {
    const val = parseInt($(this).val(), 10);
    $('#customPosYValue').text(`${val}%`);
    $('.btn-pos-preset').removeClass('active bg-purple-600 text-white shadow').addClass('bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300');
    StyleManager.update({ presetPosition: 'custom', customPosY: val });
    renderCurrentFrame();
  });

  // Interactive Drag-to-Position directly on Canvas
  function setupCanvasDragInteraction(canvasEl) {
    if (!canvasEl) return;
    let isDragging = false;

    function handleDrag(e) {
      const rect = canvasEl.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : null);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : null);
      if (clientX === null || clientY === null) return;

      const xPct = Math.round(Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100)));
      const yPct = Math.round(Math.max(5, Math.min(95, ((clientY - rect.top) / rect.height) * 100)));

      $('#customPosXInput').val(xPct);
      $('#customPosXValue').text(`${xPct}%`);
      $('#customPosYInput').val(yPct);
      $('#customPosYValue').text(`${yPct}%`);

      $('.btn-pos-preset').removeClass('active bg-purple-600 text-white shadow').addClass('bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300');
      StyleManager.update({ presetPosition: 'custom', customPosX: xPct, customPosY: yPct });
      renderCurrentFrame();
    }

    canvasEl.addEventListener('mousedown', (e) => {
      isDragging = true;
      handleDrag(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (isDragging) handleDrag(e);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvasEl.addEventListener('touchstart', (e) => {
      isDragging = true;
      handleDrag(e);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging) handleDrag(e);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  setupCanvasDragInteraction(previewCanvas);
  setupCanvasDragInteraction(modalBigCanvas);

  // Brand Watermark Controls
  $('#enableWatermarkToggle').on('change', function () {
    const isChecked = $(this).is(':checked');
    $('#watermarkControlsSection').toggleClass('hidden', !isChecked);
    StyleManager.update({ enableWatermark: isChecked });
    renderCurrentFrame();
  });

  $('#watermarkTextInput').on('input', function () {
    StyleManager.update({ watermarkText: $(this).val() });
    renderCurrentFrame();
  });

  $('#watermarkPosSelect').on('change', function () {
    StyleManager.update({ watermarkPos: $(this).val() });
    renderCurrentFrame();
  });

  $('#watermarkColorInput').on('input', function () {
    StyleManager.update({ watermarkColor: $(this).val() });
    renderCurrentFrame();
  });

  $('#watermarkSizeInput').on('input', function () {
    const size = parseInt($(this).val(), 10);
    $('#watermarkSizeValue').text(`${size}px`);
    StyleManager.update({ watermarkSize: size });
    renderCurrentFrame();
  });

  $('#watermarkOpacityInput').on('input', function () {
    const pct = parseInt($(this).val(), 10);
    $('#watermarkOpacityValue').text(`${pct}%`);
    StyleManager.update({ watermarkOpacity: pct / 100 });
    renderCurrentFrame();
  });

  $('#animationSelect').on('change', function () {
    StyleManager.update({ animationStyle: $(this).val() });
  });

  $('#btnSavePreset').on('click', function () {
    const name = prompt('Preset Name:', 'My Custom Preset');
    if (name && name.trim()) {
      PresetManager.saveCustomPreset(name.trim(), StyleManager.getStyle());
      initPresetCards();
      showToast(`Saved preset "${name}"`, 'success');
    }
  });

  // Quality Cards in Step 4
  $('.quality-card').on('click', function () {
    $('.quality-card').removeClass('active');
    $(this).addClass('active');
    state.quality = $(this).data('quality');
  });

  // ==========================================================
  // VIDEO EXPORT ACTION (Step 4)
  // ==========================================================
  
  $('#btnExportVideoAction').on('click', async function () {
    if (state.captions.length === 0) {
      showToast('Please upload or create subtitles before exporting.', 'error');
      return;
    }

    if (state.mediaMode === 'video' && !state.bgVideoFile) {
      showToast('Background Video is selected. Please upload a video file before exporting.', 'warning');
      return;
    }

    if (AudioManager.enabled && !AudioManager.audioFile) {
      showToast('Please upload an audio file or turn off Add Music / Audio.', 'warning');
      return;
    }

    pause();

    // Show Progress Modal
    $('#exportModal').removeClass('hidden');
    $('#exportProgressContainer').removeClass('hidden');
    $('#exportResultContainer').addClass('hidden');
    $('#btnExportVideoAction').prop('disabled', true).addClass('opacity-50 cursor-not-allowed');

    try {
      const fileName = $('#exportFileNameInput').val() || 'caption-video.mp4';

      const result = await VideoExporter.exportVideo({
        captions: state.captions,
        style: StyleManager.getStyle(),
        duration: state.duration,
        fps: state.fps,
        width: state.width,
        height: state.height,
        aspectRatio: state.aspectRatio,
        quality: state.quality || 'high',
        addAudio: AudioManager.enabled,
        audioManager: AudioManager,
        bgVideoElement: state.mediaMode === 'video' ? state.bgVideoElement : null,
        bgVideoFile: state.mediaMode === 'video' ? state.bgVideoFile : null,
        onProgress: (percent, statusText) => {
          $('#exportProgressBar').css('width', `${percent}%`);
          $('#exportPercentText').text(`${percent}%`);
          $('#exportStatusText').text(statusText);
        }
      });

      // Complete
      $('#exportProgressContainer').addClass('hidden');
      $('#exportResultContainer').removeClass('hidden');

      const videoPreviewEl = document.getElementById('exportResultVideo');
      videoPreviewEl.src = result.url;
      
      $('#btnDownloadExport').off('click').on('click', function () {
        const a = document.createElement('a');
        a.href = result.url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });

    } catch (err) {
      console.error('Export error:', err);
      showToast(err.message || 'Export failed. Please try again.', 'error');
      $('#exportModal').addClass('hidden');
    } finally {
      $('#btnExportVideoAction').prop('disabled', false).removeClass('opacity-50 cursor-not-allowed');
    }
  });

  $('#btnCloseExportModal').on('click', function () {
    $('#exportModal').addClass('hidden');
  });

  // Play / Pause Buttons across all steps & Modal
  $('#btnPlayPause, #btnStep1PlayPause, #btnExportPlayPause, #btnModalPlayPause').on('click', togglePlay);
  $('#btnJumpStart, #btnStep1JumpStart, #btnExportJumpStart, #btnModalJumpStart').on('click', () => seekTo(0));

  $('#step1SeekSlider, #exportSeekSlider, #modalSeekSlider').on('input', function () {
    if (state.duration > 0) {
      const pct = parseFloat($(this).val()) / 100;
      seekTo(pct * state.duration);
    }
  });

  $('#step1PreviewVolumeSlider, #exportPreviewVolumeSlider, #modalPreviewVolumeSlider').on('input', function () {
    const val = parseFloat($(this).val()) / 100;
    AudioManager.setVolume(val);
    $('#previewVolumeSlider, #step1VolumeSlider, #step1PreviewVolumeSlider, #exportPreviewVolumeSlider, #modalPreviewVolumeSlider').val($(this).val());
    $('#step1VolumeText').text(`${Math.round(val * 100)}%`);
  });

  // Open / Close Theater HD Preview Popup
  $('.btn-open-big-preview').on('click', function () {
    if (state.captions.length === 0) {
      showToast('Please upload an SRT or VTT subtitle file first to preview.', 'warning');
      return;
    }
    $('#modalAspectSelect').val(state.aspectRatio);
    $('#bigPreviewModal').removeClass('hidden');
    renderCurrentFrame();
  });

  $('#btnCloseBigPreviewModal').on('click', function () {
    $('#bigPreviewModal').addClass('hidden');
  });

  $('#bigPreviewModal').on('click', function (e) {
    if ($(e.target).is('#bigPreviewModal')) {
      $('#bigPreviewModal').addClass('hidden');
    }
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      $('#bigPreviewModal').addClass('hidden');
      $('#exportModal').addClass('hidden');
    }
  });

  // Toast System
  function showToast(message, type = 'info') {
    const toast = $('#toastNotification');
    const colors = {
      success: 'bg-emerald-600 border-emerald-400 text-white',
      error: 'bg-red-600 border-red-400 text-white',
      warning: 'bg-amber-600 border-amber-300 text-white',
      info: 'bg-purple-600 border-purple-400 text-white'
    };

    toast.removeClass('hidden bg-emerald-600 bg-red-600 bg-amber-600 bg-purple-600 text-white border-emerald-400 border-red-400 border-amber-300 border-purple-400')
      .addClass(`border ${colors[type] || colors.info}`)
      .text(message);

    setTimeout(() => {
      toast.addClass('hidden');
    }, 4000);
  }

  // Kickoff
  init();
});
