/**
 * Style Manager Module
 * Maintains the current styling configuration for caption text and canvas.
 * Dispatches update events to trigger instant canvas redraws.
 */

class StyleManagerClass {
  constructor() {
    this.listeners = [];
    
    // Default Style Configuration
    this.defaultStyle = {
      fontFamily: 'Poppins',
      fontSize: 68,
      fontWeight: '700',
      isItalic: false,
      isUppercase: false,
      
      // Text Color & Gradient
      textColor: '#FF0000',
      enableGradient: false,
      gradientColor2: '#FF7A00',
      
      // Canvas Background
      canvasBgColor: '#FFFFFF',
      
      // Caption Box (Background pill/box behind text)
      enableBox: false,
      boxColor: '#000000',
      boxOpacity: 0.7,
      boxPaddingX: 24,
      boxPaddingY: 16,
      boxRadius: 12,
      boxBorderColor: '#ffffff',
      boxBorderWidth: 0,
      
      // Alignment & Positioning
      textAlign: 'center',        // 'left' | 'center' | 'right'
      verticalPosition: 'bottom', // 'top' | 'center' | 'bottom' | 'custom'
      presetPosition: 'bot-center', // 'top-left', 'top-center', 'top-right', 'mid-left', 'center', 'mid-right', 'bot-left', 'bot-center', 'bot-right', 'custom'
      customPosX: 50,             // percentage 0 - 100
      customPosY: 80,             // percentage 0 - 100
      
      // Brand Text / Watermark
      enableWatermark: false,
      watermarkText: '@the hindi diary',
      watermarkPos: 'bottom-right', // 'bottom-right', 'bottom-left', 'top-right', 'top-left', 'bottom-center'
      watermarkOpacity: 0.65,
      watermarkColor: '#ffffff',
      watermarkSize: 26,
      
      // Text Decoration
      letterSpacing: 0,
      lineHeight: 1.25,
      
      // Text Stroke / Outline
      enableStroke: false,
      strokeColor: '#000000',
      strokeWidth: 4,
      
      // Text Shadow
      enableShadow: false,
      shadowColor: '#000000',
      shadowBlur: 12,
      shadowOffsetX: 2,
      shadowOffsetY: 4,
      shadowOpacity: 0.5,
      
      // Animations
      animationStyle: 'fade',     // 'none' | 'fade' | 'pop' | 'slideUp' | 'typewriter'
      animationDuration: 0.35,
      
      // Word Highlight styling
      wordHighlightColor: '#FACC15'
    };

    this.style = { ...this.defaultStyle };
  }

  /**
   * Subscribe to style updates
   * @param {Function} callback 
   */
  onChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.push(callback);
    }
  }

  /**
   * Notify all listeners of style change
   */
  notify() {
    for (const cb of this.listeners) {
      try {
        cb(this.style);
      } catch (e) {
        console.error('Error in style listener:', e);
      }
    }
  }

  /**
   * Update one or more style properties
   * @param {Object} partialStyle 
   * @param {boolean} silent 
   */
  update(partialStyle, silent = false) {
    this.style = { ...this.style, ...partialStyle };
    if (!silent) {
      this.notify();
    }
  }

  /**
   * Get complete current style
   * @returns {Object}
   */
  getStyle() {
    return { ...this.style };
  }

  /**
   * Apply an entire preset style object
   * @param {Object} presetStyle 
   */
  applyPreset(presetStyle) {
    this.style = { ...this.defaultStyle, ...presetStyle };
    this.notify();
  }

  /**
   * Reset to factory default style
   */
  resetToDefault() {
    this.style = { ...this.defaultStyle };
    this.notify();
  }
}

// Global Singleton
window.StyleManager = new StyleManagerClass();
