/**
 * Subtitle Parser Module
 * Robust SRT, WebVTT, and Timestamped TXT parser.
 * Converts timestamp strings to precise fractional seconds.
 */

class SubtitleParser {
  /**
   * Converts SRT timestamp "00:01:23,456" or VTT "00:01:23.456" / "01:23.456" to seconds (Float)
   * @param {string} timeString 
   * @returns {number}
   */
  static parseTimestamp(timeString) {
    if (!timeString) return 0;
    const cleanStr = timeString.trim().replace(',', '.');
    const parts = cleanStr.split(':');
    
    if (parts.length === 3) {
      const hours = parseFloat(parts[0]) || 0;
      const minutes = parseFloat(parts[1]) || 0;
      const seconds = parseFloat(parts[2]) || 0;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const minutes = parseFloat(parts[0]) || 0;
      const seconds = parseFloat(parts[1]) || 0;
      return minutes * 60 + seconds;
    } else if (parts.length === 1) {
      return parseFloat(parts[0]) || 0;
    }
    return 0;
  }

  /**
   * Converts seconds float into standard timecode format (e.g. 00:02.500 or 00:00:02.500)
   * @param {number} totalSeconds 
   * @param {boolean} fullHours 
   * @returns {string}
   */
  static formatTime(totalSeconds, fullHours = false) {
    if (isNaN(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    const millis = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 1000);

    const pad = (n, width = 2) => String(n).padStart(width, '0');
    const msStr = pad(millis, 3);

    if (fullHours || hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${msStr}`;
    }
    return `${pad(mins)}:${pad(secs)}.${msStr}`;
  }

  /**
   * Strips HTML tags or entities if needed
   * @param {string} str 
   * @returns {string}
   */
  static cleanText(str) {
    if (!str) return '';
    // Strip simple styling tags like <b>, <i>, <font...> while preserving content
    return str
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Parses raw SRT file text into an array of caption objects
   * @param {string} rawContent 
   * @returns {Array<{id: number, start: number, end: number, text: string}>}
   */
  static parseSRT(rawContent) {
    const normalized = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const blocks = normalized.split(/\n\s*\n/);
    const captions = [];
    let idCounter = 1;

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let timeIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timeIndex = i;
          break;
        }
      }

      if (timeIndex === -1) continue;

      const timeLine = lines[timeIndex];
      const [startStr, endStr] = timeLine.split('-->').map(s => s.trim());
      const start = this.parseTimestamp(startStr);
      const end = this.parseTimestamp(endStr);

      const textLines = lines.slice(timeIndex + 1);
      const text = this.cleanText(textLines.join('\n'));

      if (text && end > start) {
        captions.push({
          id: idCounter++,
          start: Math.max(0, start),
          end: Math.max(start + 0.1, end),
          text: text
        });
      }
    }

    return captions;
  }

  /**
   * Parses raw WebVTT file text
   * @param {string} rawContent 
   * @returns {Array<{id: number, start: number, end: number, text: string}>}
   */
  static parseVTT(rawContent) {
    const normalized = rawContent
      .replace(/^WEBVTT[^\n]*\n+/i, '')
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n');
      
    const blocks = normalized.split(/\n\s*\n/);
    const captions = [];
    let idCounter = 1;

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      let timeIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('-->')) {
          timeIndex = i;
          break;
        }
      }

      if (timeIndex === -1) continue;

      const timeLine = lines[timeIndex];
      const [startPart, endPart] = timeLine.split('-->').map(s => s.trim());
      // Handle optional cue settings like "align:start position:10%"
      const cleanEnd = endPart ? endPart.split(/\s+/)[0] : '';
      
      const start = this.parseTimestamp(startPart);
      const end = this.parseTimestamp(cleanEnd);

      const textLines = lines.slice(timeIndex + 1);
      const text = this.cleanText(textLines.join('\n'));

      if (text && end > start) {
        captions.push({
          id: idCounter++,
          start: Math.max(0, start),
          end: Math.max(start + 0.1, end),
          text: text
        });
      }
    }

    return captions;
  }

  /**
   * General Auto-detecting Subtitle Parser
   * @param {string} content 
   * @param {string} filename 
   * @returns {{captions: Array, duration: number, isDevanagari: boolean, error: string|null}}
   */
  static parse(content, filename = '') {
    if (!content || !content.trim()) {
      return { captions: [], duration: 0, isDevanagari: false, error: 'File is empty.' };
    }

    let captions = [];
    const lowerName = filename.toLowerCase();

    if (lowerName.endsWith('.vtt') || content.trim().startsWith('WEBVTT')) {
      captions = this.parseVTT(content);
    } else {
      captions = this.parseSRT(content);
    }

    // Fallback if empty
    if (captions.length === 0) {
      // Try VTT if SRT failed
      captions = this.parseVTT(content);
    }

    if (captions.length === 0) {
      return { captions: [], duration: 0, isDevanagari: false, error: 'No valid caption cues found in subtitle file.' };
    }

    // Sort by start time
    captions.sort((a, b) => a.start - b.start);

    // Calculate total duration dynamically matching subtitle timestamps
    const maxEnd = captions.reduce((max, c) => Math.max(max, c.end), 0);
    const duration = Math.ceil(maxEnd * 10) / 10;

    // Check if any captions contain Hindi / Devanagari text
    const fullText = captions.map(c => c.text).join(' ');
    const isDevanagari = window.FontManager ? window.FontManager.hasDevanagari(fullText) : /[\u0900-\u097F]/.test(fullText);

    return {
      captions,
      duration: Math.max(duration, 1.0),
      rawDuration: maxEnd,
      isDevanagari,
      error: null
    };
  }
}

window.SubtitleParser = SubtitleParser;
