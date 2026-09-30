/**
 * Timeline Module
 * Handles visual timeline tracks, playhead scrubbing, caption block selection,
 * and time markers.
 */

class Timeline {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.options = Object.assign({
      onSeek: () => {},
      onSelectCaption: () => {}
    }, options);

    this.duration = 16.5;
    this.currentTime = 0;
    this.captions = [];
    this.selectedCaptionId = null;
    this.isDragging = false;

    if (this.container) {
      this.initDOM();
      this.bindEvents();
    }
  }

  /**
   * Initializes timeline DOM structures
   */
  initDOM() {
    if (!this.container) return;

    // Check if ruler and blocks already exist or need creation
    let ruler = document.getElementById('mainTimelineRuler') || this.container.querySelector('.timeline-ruler');
    let blocks = document.getElementById('timelineBlocks') || this.container.querySelector('#timelineBlocks');
    let playhead = document.getElementById('timelinePlayhead') || this.container.querySelector('#timelinePlayhead');

    if (!blocks) {
      this.container.innerHTML = `
        <div id="timelineBlocks" class="absolute inset-0"></div>
        <div id="timelinePlayhead" class="timeline-playhead" style="left: 0%;"></div>
      `;
      blocks = this.container.querySelector('#timelineBlocks');
      playhead = this.container.querySelector('#timelinePlayhead');
    }

    this.rulerEl = ruler;
    this.trackEl = this.container;
    this.blocksEl = blocks;
    this.playheadEl = playhead;
  }

  /**
   * Binds mouse and touch scrubbing events
   */
  bindEvents() {
    if (!this.trackEl) return;

    const handleScrub = (e) => {
      const rect = this.trackEl.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const fraction = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const targetTime = fraction * this.duration;
      this.setTime(targetTime);
      this.options.onSeek(targetTime);
    };

    this.trackEl.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      handleScrub(e);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        handleScrub(e);
      }
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch events for mobile
    this.trackEl.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      handleScrub(e);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging) {
        handleScrub(e);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  /**
   * Sets captions data and recalculates ruler
   * @param {Array} captions 
   * @param {number} totalDuration 
   */
  setData(captions, totalDuration) {
    this.captions = captions || [];
    this.duration = Math.max(1.0, totalDuration || 10.0);
    this.renderRuler();
    this.renderBlocks();
    this.updatePlayhead();
  }

  /**
   * Renders second markers on the timeline ruler dynamically
   */
  renderRuler() {
    if (!this.rulerEl) return;
    this.rulerEl.innerHTML = '';
    
    let step = 1;
    if (this.duration > 300) step = 60;
    else if (this.duration > 120) step = 30;
    else if (this.duration > 60) step = 10;
    else if (this.duration > 20) step = 5;
    else if (this.duration > 5) step = 2;
    
    for (let t = 0; t <= this.duration; t += step) {
      const marker = document.createElement('div');
      marker.className = 'text-[10px] font-mono select-none text-slate-500';
      marker.textContent = SubtitleParser.formatTime(t);
      this.rulerEl.appendChild(marker);
    }
  }

  /**
   * Renders visual caption blocks
   */
  renderBlocks() {
    if (!this.blocksEl) return;
    this.blocksEl.innerHTML = '';

    for (const caption of this.captions) {
      const startPct = (caption.start / this.duration) * 100;
      const endPct = (caption.end / this.duration) * 100;
      const widthPct = Math.max(1, endPct - startPct);

      const block = document.createElement('div');
      block.className = `timeline-block ${caption.id === this.selectedCaptionId ? 'selected' : ''}`;
      block.style.left = `${startPct}%`;
      block.style.width = `${widthPct}%`;
      block.setAttribute('data-id', caption.id);
      block.title = `${SubtitleParser.formatTime(caption.start)} → ${SubtitleParser.formatTime(caption.end)}: ${caption.text}`;
      block.textContent = caption.text;

      block.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectCaption(caption.id);
        this.setTime(caption.start);
        this.options.onSeek(caption.start);
        this.options.onSelectCaption(caption);
      });

      this.blocksEl.appendChild(block);
    }
  }

  /**
   * Updates timeline current time and moves playhead
   * @param {number} timeInSeconds 
   */
  setTime(timeInSeconds) {
    this.currentTime = Math.max(0, Math.min(this.duration, timeInSeconds));
    this.updatePlayhead();
  }

  /**
   * Updates playhead needle position
   */
  updatePlayhead() {
    if (!this.playheadEl) return;
    const pct = (this.currentTime / this.duration) * 100;
    this.playheadEl.style.left = `${Math.min(100, Math.max(0, pct))}%`;
  }

  /**
   * Visually highlights a selected caption
   * @param {number} captionId 
   */
  selectCaption(captionId) {
    this.selectedCaptionId = captionId;
    if (!this.blocksEl) return;
    const blocks = this.blocksEl.querySelectorAll('.timeline-block');
    blocks.forEach(b => {
      if (parseInt(b.getAttribute('data-id'), 10) === captionId) {
        b.classList.add('selected');
      } else {
        b.classList.remove('selected');
      }
    });
  }
}

window.Timeline = Timeline;
