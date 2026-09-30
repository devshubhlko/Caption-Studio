/**
 * Canvas Renderer Module
 * High-performance 2D Canvas rendering engine for live preview and deterministic video frame exports.
 * Supports multi-line wrapped text, Google Fonts, Devanagari script, animations, box pills, strokes, and shadows.
 */

class CanvasRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { alpha: false });

    // Default 1920x1080 Landscape
    this.aspectRatio = '16:9';
    this.width = 1920;
    this.height = 1080;

    this.setResolution(1920, 1080, '16:9');
  }

  /**
   * Set internal canvas dimensions and aspect ratio
   * @param {number} width 
   * @param {number} height 
   * @param {string} aspect 
   */
  setResolution(width, height, aspect = '16:9') {
    this.width = width;
    this.height = height;
    this.aspectRatio = aspect;
    this.canvas.width = width;
    this.canvas.height = height;

    // Ultra-sharp crisp graphics & typography rendering
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    if ('textRendering' in this.ctx) {
      this.ctx.textRendering = 'geometricPrecision';
    }
  }

  /**
   * Helper to draw a rounded rectangle
   */
  drawRoundedRect(ctx, x, y, width, height, radius) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      return;
    }
    // Fallback if roundRect is unsupported
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Calculates wrapped lines of text based on canvas max width
   * @param {CanvasRenderingContext2D} ctx 
   * @param {string} text 
   * @param {number} maxWidth 
   * @returns {Array<string>}
   */
  getWrappedLines(ctx, text, maxWidth) {
    if (!text) return [];

    // Split by hard newlines first
    const paragraphs = text.split('\n');
    const lines = [];

    for (const para of paragraphs) {
      const words = para.split(/\s+/).filter(Boolean);
      if (words.length === 0) continue;

      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + ' ' + word;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Main frame rendering method
   * @param {number} currentTime Current timestamp in seconds
   * @param {Array} captions Array of caption cues
   * @param {Object} style Styling parameters
   * @param {HTMLVideoElement|null} bgVideoElement Optional background video element
   */
  renderFrame(currentTime, captions, style, bgVideoElement = null) {
    const { ctx, width, height } = this;

    // Security Gate Check
    if (window.AuthManager && !window.AuthManager.isAuthenticated()) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    // 1. Draw Canvas Background (Video Frame or Solid Color)
    ctx.save();
    let videoRendered = false;
    if (bgVideoElement) {
      try {
        const vW = bgVideoElement.videoWidth || bgVideoElement.naturalWidth || width;
        const vH = bgVideoElement.videoHeight || bgVideoElement.naturalHeight || height;
        if (vW > 0 && vH > 0) {
          const videoRatio = vW / vH;
          const canvasRatio = width / height;
          let renderW, renderH, offsetX, offsetY;

          if (videoRatio > canvasRatio) {
            renderH = height;
            renderW = height * videoRatio;
            offsetX = (width - renderW) / 2;
            offsetY = 0;
          } else {
            renderW = width;
            renderH = width / videoRatio;
            offsetX = 0;
            offsetY = (height - renderH) / 2;
          }
          ctx.drawImage(bgVideoElement, offsetX, offsetY, renderW, renderH);
          videoRendered = true;
        }
      } catch (err) {
        videoRendered = false;
      }
    }

    if (!videoRendered) {
      ctx.fillStyle = style.canvasBgColor || '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    // Render Watermark (even if no active caption cue)
    this.renderWatermark(ctx, width, height, style);

    if (!captions || captions.length === 0) {
      return;
    }

    // 2. Find active caption at currentTime
    const activeCaption = captions.find(c => currentTime >= c.start && currentTime < c.end);
    if (!activeCaption || !activeCaption.text) {
      return; // Blank background + watermark
    }

    // 3. Compute Animation Progress
    const captionDuration = Math.max(0.1, activeCaption.end - activeCaption.start);
    const timeInCaption = Math.max(0, currentTime - activeCaption.start);
    const progress = Math.min(1, timeInCaption / style.animationDuration);

    let opacity = 1.0;
    let scale = 1.0;
    let translateY = 0;
    let displayedText = activeCaption.text;

    // Apply animation style
    switch (style.animationStyle) {
      case 'fade':
        opacity = Math.min(1, progress);
        break;
      case 'pop':
        opacity = Math.min(1, progress * 1.5);
        scale = 0.8 + 0.2 * Math.min(1, Math.sin(progress * Math.PI / 2));
        break;
      case 'slideUp':
        opacity = Math.min(1, progress);
        translateY = (1 - Math.min(1, progress)) * 40;
        break;
      case 'typewriter':
        const charCount = Math.floor(activeCaption.text.length * Math.min(1, timeInCaption / (captionDuration * 0.8)));
        displayedText = activeCaption.text.substring(0, Math.max(1, charCount));
        break;
      default:
        opacity = 1.0;
        break;
    }

    ctx.save();
    ctx.globalAlpha = opacity;

    // Setup Font
    const isDevanagari = window.FontManager ? window.FontManager.hasDevanagari(displayedText) : false;
    const fontFamStr = window.FontManager ? window.FontManager.getFontFamilyString(style.fontFamily, isDevanagari) : style.fontFamily;
    const fontStyleStr = style.isItalic ? 'italic ' : '';
    const fontWeightStr = style.fontWeight || '700';
    const fontSize = style.fontSize || 68;

    ctx.font = `${fontStyleStr}${fontWeightStr} ${fontSize}px ${fontFamStr}`;
    if ('letterSpacing' in ctx) {
      ctx.letterSpacing = `${style.letterSpacing || 0}px`;
    }
    ctx.textBaseline = 'middle';

    const maxTextWidth = width * 0.85; // Leave 15% margin
    const rawLines = this.getWrappedLines(ctx, style.isUppercase ? displayedText.toUpperCase() : displayedText, maxTextWidth);
    const lines = rawLines.length > 0 ? rawLines : [displayedText];

    const lineHeight = fontSize * (style.lineHeight || 1.25);
    const totalBlockHeight = lines.length * lineHeight;

    // 4. Calculate Anchor Position (X, Y)
    let anchorX = width / 2;
    let anchorY = height * 0.80;
    let textAlignVal = style.textAlign || 'center';

    const preset = style.presetPosition || 'bot-center';

    if (preset === 'top-left') {
      anchorX = width * 0.15;
      anchorY = height * 0.18;
      textAlignVal = 'left';
    } else if (preset === 'top-center') {
      anchorX = width * 0.50;
      anchorY = height * 0.18;
      textAlignVal = 'center';
    } else if (preset === 'top-right') {
      anchorX = width * 0.85;
      anchorY = height * 0.18;
      textAlignVal = 'right';
    } else if (preset === 'mid-left') {
      anchorX = width * 0.15;
      anchorY = height * 0.50;
      textAlignVal = 'left';
    } else if (preset === 'center') {
      anchorX = width * 0.50;
      anchorY = height * 0.50;
      textAlignVal = 'center';
    } else if (preset === 'mid-right') {
      anchorX = width * 0.85;
      anchorY = height * 0.50;
      textAlignVal = 'right';
    } else if (preset === 'bot-left') {
      anchorX = width * 0.15;
      anchorY = height * 0.80;
      textAlignVal = 'left';
    } else if (preset === 'bot-center') {
      anchorX = width * 0.50;
      anchorY = height * 0.80;
      textAlignVal = 'center';
    } else if (preset === 'bot-right') {
      anchorX = width * 0.85;
      anchorY = height * 0.80;
      textAlignVal = 'right';
    } else if (preset === 'custom' || style.verticalPosition === 'custom') {
      const posX = typeof style.customPosX === 'number' ? style.customPosX : 50;
      const posY = typeof style.customPosY === 'number' ? style.customPosY : 80;
      anchorX = (posX / 100) * width;
      anchorY = (posY / 100) * height;
      textAlignVal = style.textAlign || 'center';
    }
    ctx.textAlign = textAlignVal;

    // Transform for pop / slide animations
    ctx.translate(anchorX, anchorY + translateY);
    if (scale !== 1.0) {
      ctx.scale(scale, scale);
    }

    // 5. Draw Caption Box / Pill (if enabled)
    if (style.enableBox) {
      let maxLineWidth = 0;
      for (const line of lines) {
        const w = ctx.measureText(line).width;
        if (w > maxLineWidth) maxLineWidth = w;
      }

      const padX = style.boxPaddingX || 24;
      const padY = style.boxPaddingY || 16;
      const boxW = maxLineWidth + padX * 2;
      const boxH = totalBlockHeight + padY * 2;
      const radius = style.boxRadius || 12;

      let boxLeft = -boxW / 2;
      if (textAlignVal === 'left') boxLeft = -padX;
      if (textAlignVal === 'right') boxLeft = -boxW + padX;

      const boxTop = -totalBlockHeight / 2 - padY;

      ctx.save();
      ctx.globalAlpha = opacity * (style.boxOpacity !== undefined ? style.boxOpacity : 0.8);
      ctx.fillStyle = style.boxColor || '#000000';
      this.drawRoundedRect(ctx, boxLeft, boxTop, boxW, boxH, radius);
      ctx.fill();

      if (style.boxBorderWidth > 0) {
        ctx.lineWidth = style.boxBorderWidth;
        ctx.strokeStyle = style.boxBorderColor || '#ffffff';
        ctx.stroke();
      }
      ctx.restore();
    }

    // 6. Setup Text Fill / Gradient
    let fillStyle = style.textColor || '#FF0000';
    if (style.enableGradient && style.gradientColor2) {
      const grad = ctx.createLinearGradient(-width / 4, -totalBlockHeight / 2, width / 4, totalBlockHeight / 2);
      grad.addColorStop(0, style.textColor || '#FF0000');
      grad.addColorStop(1, style.gradientColor2);
      fillStyle = grad;
    }

    // 7. Render Each Line
    const startY = -((lines.length - 1) * lineHeight) / 2;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineY = startY + i * lineHeight;
      const lineX = 0; // Relative to translate(anchorX, anchorY)

      // Draw Shadow (if enabled)
      if (style.enableShadow) {
        ctx.save();
        ctx.shadowColor = style.shadowColor || '#000000';
        ctx.shadowBlur = style.shadowBlur || 12;
        ctx.shadowOffsetX = style.shadowOffsetX || 2;
        ctx.shadowOffsetY = style.shadowOffsetY || 4;
        ctx.fillStyle = fillStyle;
        ctx.fillText(line, lineX, lineY);
        ctx.restore();
      }

      // Draw Stroke / Outline (if enabled)
      if (style.enableStroke && style.strokeWidth > 0) {
        ctx.save();
        ctx.strokeStyle = style.strokeColor || '#000000';
        ctx.lineWidth = style.strokeWidth;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(line, lineX, lineY);
        ctx.restore();
      }

      // Main Text Fill
      ctx.fillStyle = fillStyle;
      ctx.fillText(line, lineX, lineY);
    }

    ctx.restore();
  }

  /**
   * Helper to draw stylish Brand Watermark
   */
  renderWatermark(ctx, width, height, style) {
    if (!style.enableWatermark || !style.watermarkText) return;

    ctx.save();
    ctx.globalAlpha = style.watermarkOpacity !== undefined ? style.watermarkOpacity : 0.65;
    const fontSize = style.watermarkSize || 26;
    ctx.font = `700 ${fontSize}px "Plus Jakarta Sans", "Poppins", sans-serif`;
    ctx.fillStyle = style.watermarkColor || '#ffffff';
    ctx.textBaseline = 'middle';

    const pos = style.watermarkPos || 'bottom-right';
    let wmX, wmY, align;

    const marginX = width * 0.04;
    const marginY = height * 0.05;

    if (pos === 'top-left') {
      wmX = marginX;
      wmY = marginY;
      align = 'left';
    } else if (pos === 'top-right') {
      wmX = width - marginX;
      wmY = marginY;
      align = 'right';
    } else if (pos === 'bottom-left') {
      wmX = marginX;
      wmY = height - marginY;
      align = 'left';
    } else if (pos === 'bottom-center') {
      wmX = width / 2;
      wmY = height - marginY;
      align = 'center';
    } else {
      // bottom-right default
      wmX = width - marginX;
      wmY = height - marginY;
      align = 'right';
    }

    ctx.textAlign = align;

    // Drop shadow for clear readability on all backgrounds & videos
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.fillText(style.watermarkText, wmX, wmY);
    ctx.restore();
  }
}

window.CanvasRenderer = CanvasRenderer;
