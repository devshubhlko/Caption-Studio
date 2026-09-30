/**
 * Font Manager Module
 * Manages comprehensive Google Fonts catalog for Hindi (Devanagari) and English (Latin).
 * Supports automatic language detection, live Google Fonts loading, visual font previews,
 * and infinite-scroll pagination from built-in and live Google Fonts datasets.
 */

class FontManagerClass {
  constructor() {
    this.loadedFonts = new Set(['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Courier New', 'sans-serif']);
    this.injectedLinks = new Set();
    this.previewInjected = new Set();

    // Comprehensive curated Google Fonts database with 50+ Hindi & 100+ English Fonts
    this.fonts = {
      hindi: [
        { name: 'Noto Sans Devanagari', category: 'Hindi Sans', preview: 'सुंदर कैप्शन' },
        { name: 'Mukta', category: 'Hindi Modern', preview: 'हिंदी सबटाइटल' },
        { name: 'Hind', category: 'Hindi UI', preview: 'आधुनिक डिज़ाइन' },
        { name: 'Poppins', category: 'Hindi & Latin', preview: 'पॉपिन्स / Poppins' },
        { name: 'Baloo 2', category: 'Hindi Rounded', preview: 'मजेदार स्टाइल' },
        { name: 'Kalam', category: 'Hindi Handwriting', preview: 'कलम हैंडराइटिंग' },
        { name: 'Rajdhani', category: 'Hindi Tech Bold', preview: 'राजधानी बोल्ड' },
        { name: 'Khand', category: 'Hindi Condensed', preview: 'खंड हेडलाइन' },
        { name: 'Rozha One', category: 'Hindi Poster', preview: 'रोज़ा बोल्ड' },
        { name: 'Yatra One', category: 'Hindi Vintage', preview: 'यात्रा वन' },
        { name: 'Anek Devanagari', category: 'Hindi Modern Sans', preview: 'अनेक देवनागरी' },
        { name: 'Noto Serif Devanagari', category: 'Hindi Serif', preview: 'क्लासिक हिंदी' },
        { name: 'Tiro Devanagari Hindi', category: 'Hindi Traditional', preview: 'पारंपरिक हिंदी' },
        { name: 'Karma', category: 'Hindi Clean Serif', preview: 'कर्मा सेरिफ़' },
        { name: 'Eczar', category: 'Hindi Editorial', preview: 'एक्ज़ार एडिटोरियल' },
        { name: 'Gotu', category: 'Hindi Contemporary', preview: 'गोटू स्टाइल' },
        { name: 'Sarala', category: 'Hindi Sans', preview: 'सरला फ़ॉन्ट' },
        { name: 'Modak', category: 'Hindi Chunky', preview: 'मोदक डिस्प्ले' },
        { name: 'Ranga', category: 'Hindi Expressive', preview: 'रंगा आर्टिस्टिक' },
        { name: 'Sahitya', category: 'Hindi Literary', preview: 'साहित्य' },
        { name: 'Halant', category: 'Hindi Classic', preview: 'हलंत' },
        { name: 'Biryani', category: 'Hindi Geometric', preview: 'बिरयानी' },
        { name: 'Dekko', category: 'Hindi Casual', preview: 'डेक्को' },
        { name: 'Tillana', category: 'Hindi Decorative', preview: 'तिल्लाना' },
        { name: 'Kurale', category: 'Hindi Novelty', preview: 'कुराले' },
        { name: 'Sura', category: 'Hindi Warm Serif', preview: 'सुरा' },
        { name: 'Jaldi', category: 'Hindi Narrow', preview: 'जल्दी' },
        { name: 'Asar', category: 'Hindi Book', preview: 'असर' },
        { name: 'Arya', category: 'Hindi Stylized', preview: 'आर्य' },
        { name: 'Amita', category: 'Hindi Cursive', preview: 'अमिता' },
        { name: 'Kadwa', category: 'Hindi Distinctive', preview: 'कड़वा' },
        { name: 'Palanquin', category: 'Hindi Clean', preview: 'पालंकीन' },
        { name: 'Palanquin Dark', category: 'Hindi Heavy', preview: 'पालंकीन डार्क' },
        { name: 'Cambay', category: 'Hindi Geometric', preview: 'कैम्बे' },
        { name: 'Laila', category: 'Hindi Friendly Serif', preview: 'लैला' },
        { name: 'Martel', category: 'Hindi Bold Serif', preview: 'मार्टेल' },
        { name: 'Martel Sans', category: 'Hindi Clean Sans', preview: 'मार्टेल सैंस' },
        { name: 'Vesper Libre', category: 'Hindi Classic Serif', preview: 'वेस्पर लिब्रे' },
        { name: 'Pragati Narrow', category: 'Hindi Narrow Sans', preview: 'प्रगति नैरो' },
        { name: 'Sumana', category: 'Hindi Elegant Serif', preview: 'सुमाना' },
        { name: 'Rhodium Libre', category: 'Hindi Heavy Serif', preview: 'रोडियम लिब्रे' },
        { name: 'Jaini', category: 'Hindi Cultural', preview: 'जैनी' },
        { name: 'Jaini Purva', category: 'Hindi Traditional', preview: 'जैनी पूर्वा' },
        { name: 'Shobhika', category: 'Hindi Classical', preview: 'शोभिका' },
        { name: 'Baloo Bhai 2', category: 'Hindi Rounded Heavy', preview: 'बालू भाई २' },
        { name: 'Baloo Bhaina 2', category: 'Hindi Rounded Fun', preview: 'बालू भैना' },
        { name: 'Baloo Chettan 2', category: 'Hindi Bold Rounded', preview: 'बालू चेट्टन' },
        { name: 'Baloo Da 2', category: 'Hindi Display Rounded', preview: 'बालू दा' },
        { name: 'Baloo Paaji 2', category: 'Hindi Playful', preview: 'बालू पाजी' },
        { name: 'Baloo Tamma 2', category: 'Hindi Extra Bold', preview: 'बालू तम्मा' },
        { name: 'Baloo Tammudu 2', category: 'Hindi Chunky', preview: 'बालू तम्मूदु' },
        { name: 'Baloo Thambi 2', category: 'Hindi Friendly', preview: 'बालू थम्बी' }
      ],
      english: [
        // Modern Sans (Clean & Tech)
        { name: 'Inter', category: 'Modern Sans', preview: 'Inter Clean UI' },
        { name: 'Plus Jakarta Sans', category: 'Modern Sans', preview: 'Plus Jakarta Sans' },
        { name: 'Montserrat', category: 'Modern Sans', preview: 'Montserrat Style' },
        { name: 'Roboto', category: 'Modern Sans', preview: 'Roboto Standard' },
        { name: 'Outfit', category: 'Modern Sans', preview: 'Outfit Modern' },
        { name: 'DM Sans', category: 'Modern Sans', preview: 'DM Sans Minimal' },
        { name: 'Manrope', category: 'Modern Sans', preview: 'Manrope Tech' },
        { name: 'Urbanist', category: 'Modern Sans', preview: 'Urbanist Aesthetic' },
        { name: 'Open Sans', category: 'Modern Sans', preview: 'Open Sans Clean' },
        { name: 'Lato', category: 'Modern Sans', preview: 'Lato Balanced' },
        { name: 'Raleway', category: 'Modern Sans', preview: 'Raleway Elegant' },
        { name: 'Nunito', category: 'Modern Sans', preview: 'Nunito Rounded' },
        { name: 'Rubik', category: 'Modern Sans', preview: 'Rubik Soft' },
        { name: 'Quicksand', category: 'Modern Sans', preview: 'Quicksand' },
        { name: 'Work Sans', category: 'Modern Sans', preview: 'Work Sans' },
        { name: 'Lexend', category: 'Modern Sans', preview: 'Lexend High Read' },
        { name: 'Figtree', category: 'Modern Sans', preview: 'Figtree Friendly' },
        { name: 'Sora', category: 'Modern Sans', preview: 'Sora Precision' },
        { name: 'Cabin', category: 'Modern Sans', preview: 'Cabin Sans' },
        { name: 'Fira Sans', category: 'Modern Sans', preview: 'Fira Sans' },
        { name: 'Barlow', category: 'Modern Sans', preview: 'Barlow Clean' },
        { name: 'Barlow Condensed', category: 'Modern Sans', preview: 'Barlow Condensed' },
        { name: 'Heebo', category: 'Modern Sans', preview: 'Heebo UI' },
        { name: 'Karla', category: 'Modern Sans', preview: 'Karla Sans' },
        { name: 'Mulish', category: 'Modern Sans', preview: 'Mulish Clean' },
        { name: 'PT Sans', category: 'Modern Sans', preview: 'PT Sans' },
        { name: 'Ubuntu', category: 'Modern Sans', preview: 'Ubuntu Modern' },
        { name: 'Questrial', category: 'Modern Sans', preview: 'Questrial Minimal' },

        // Bold Headlines & Viral Reels Display
        { name: 'Bebas Neue', category: 'Bold Display', preview: 'BEBAS NEUE IMPACT' },
        { name: 'Oswald', category: 'Bold Display', preview: 'OSWALD VIRAL REELS' },
        { name: 'Anton', category: 'Bold Display', preview: 'ANTON MEGA BOLD' },
        { name: 'Russo One', category: 'Bold Display', preview: 'RUSSO ONE GAMING' },
        { name: 'League Spartan', category: 'Bold Display', preview: 'LEAGUE SPARTAN' },
        { name: 'Righteous', category: 'Bold Display', preview: 'Righteous Retro' },
        { name: 'Bangers', category: 'Bold Display', preview: 'BANGERS COMIC' },
        { name: 'Syne', category: 'Bold Display', preview: 'Syne Trendy Headline' },
        { name: 'Archivo Black', category: 'Bold Display', preview: 'ARCHIVO BLACK' },
        { name: 'Paytone One', category: 'Bold Display', preview: 'PAYTONE ONE' },
        { name: 'Black Han Sans', category: 'Bold Display', preview: 'BLACK HAN SANS' },
        { name: 'Ultra', category: 'Bold Display', preview: 'ULTRA POSTER' },
        { name: 'Abril Fatface', category: 'Bold Display', preview: 'Abril Fatface' },
        { name: 'Titan One', category: 'Bold Display', preview: 'TITAN ONE POP' },
        { name: 'Passion One', category: 'Bold Display', preview: 'PASSION ONE' },
        { name: 'Changa One', category: 'Bold Display', preview: 'CHANGA ONE HEAVY' },
        { name: 'Rowdies', category: 'Bold Display', preview: 'ROWDIES VIRAL' },
        { name: 'Shrikhand', category: 'Bold Display', preview: 'Shrikhand Display' },
        { name: 'Dela Gothic One', category: 'Bold Display', preview: 'DELA GOTHIC' },
        { name: 'Bungee', category: 'Bold Display', preview: 'BUNGEE URBAN' },
        { name: 'Bungee Shade', category: 'Bold Display', preview: 'BUNGEE SHADE' },
        { name: 'Bungee Inline', category: 'Bold Display', preview: 'BUNGEE INLINE' },
        { name: 'Monoton', category: 'Bold Display', preview: 'MONOTON DISCO' },
        { name: 'Faster One', category: 'Bold Display', preview: 'FASTER ONE SPEED' },
        { name: 'Creepster', category: 'Bold Display', preview: 'CREEPSTER HORROR' },
        { name: 'Sancreek', category: 'Bold Display', preview: 'SANCREEK WESTERN' },
        { name: 'Sigmar One', category: 'Bold Display', preview: 'SIGMAR ONE' },
        { name: 'Luckiest Guy', category: 'Bold Display', preview: 'LUCKIEST GUY FUN' },
        { name: 'Squada One', category: 'Bold Display', preview: 'SQUADA ONE' },
        { name: 'Alfa Slab One', category: 'Bold Display', preview: 'ALFA SLAB ONE' },

        // Luxury Serif & Editorial
        { name: 'Playfair Display', category: 'Luxury Serif', preview: 'Playfair Display' },
        { name: 'Cinzel', category: 'Luxury Serif', preview: 'CINZEL CINEMATIC' },
        { name: 'Cinzel Decorative', category: 'Luxury Serif', preview: 'CINZEL DECORATIVE' },
        { name: 'Merriweather', category: 'Luxury Serif', preview: 'Merriweather Editorial' },
        { name: 'Lora', category: 'Luxury Serif', preview: 'Lora Story' },
        { name: 'Cormorant Garamond', category: 'Luxury Serif', preview: 'Cormorant Garamond' },
        { name: 'EB Garamond', category: 'Luxury Serif', preview: 'EB Garamond' },
        { name: 'Bodoni Moda', category: 'Luxury Serif', preview: 'Bodoni Moda Vogue' },
        { name: 'DM Serif Display', category: 'Luxury Serif', preview: 'DM Serif Display' },
        { name: 'Prata', category: 'Luxury Serif', preview: 'Prata Fashion' },
        { name: 'Spectral', category: 'Luxury Serif', preview: 'Spectral Serif' },
        { name: 'Fraunces', category: 'Luxury Serif', preview: 'Fraunces Retro Serif' },
        { name: 'Castoro', category: 'Luxury Serif', preview: 'Castoro Elegant' },
        { name: 'Unna', category: 'Luxury Serif', preview: 'Unna Luxury' },
        { name: 'Cardo', category: 'Luxury Serif', preview: 'Cardo Classic' },
        { name: 'Libre Baskerville', category: 'Luxury Serif', preview: 'Libre Baskerville' },
        { name: 'Marcellus', category: 'Luxury Serif', preview: 'Marcellus Regal' },
        { name: 'Cinzel', category: 'Luxury Serif', preview: 'Cinzel Roman' },
        { name: 'Yeseva One', category: 'Luxury Serif', preview: 'Yeseva One Elegant' },

        // Script, Aesthetic & Handwriting
        { name: 'Dancing Script', category: 'Handwriting', preview: 'Dancing Script Cursive' },
        { name: 'Pacifico', category: 'Handwriting', preview: 'Pacifico Fun' },
        { name: 'Caveat', category: 'Handwriting', preview: 'Caveat Handwritten' },
        { name: 'Great Vibes', category: 'Handwriting', preview: 'Great Vibes Script' },
        { name: 'Satisfy', category: 'Handwriting', preview: 'Satisfy Flowing' },
        { name: 'Lobster', category: 'Handwriting', preview: 'Lobster Retro Script' },
        { name: 'Sacramento', category: 'Handwriting', preview: 'Sacramento Delicate' },
        { name: 'Yellowtail', category: 'Handwriting', preview: 'Yellowtail Vintage' },
        { name: 'Permanent Marker', category: 'Handwriting', preview: 'PERMANENT MARKER' },
        { name: 'Shadows Into Light', category: 'Handwriting', preview: 'Shadows Into Light' },
        { name: 'Kaushan Script', category: 'Handwriting', preview: 'Kaushan Script Brush' },
        { name: 'Marck Script', category: 'Handwriting', preview: 'Marck Script Fluent' },
        { name: 'Allura', category: 'Handwriting', preview: 'Allura Calligraphy' },
        { name: 'Courgette', category: 'Handwriting', preview: 'Courgette Style' },
        { name: 'Tangerine', category: 'Handwriting', preview: 'Tangerine Elegant' },
        { name: 'Alex Brush', category: 'Handwriting', preview: 'Alex Brush' },
        { name: 'Homemade Apple', category: 'Handwriting', preview: 'Homemade Apple' },
        { name: 'Rock Salt', category: 'Handwriting', preview: 'ROCK SALT GRUNGE' },
        { name: 'Covered By Your Grace', category: 'Handwriting', preview: 'Covered By Your Grace' },
        { name: 'Gochi Hand', category: 'Handwriting', preview: 'Gochi Hand Fun' },

        // Tech, Sci-Fi & Monospace
        { name: 'Space Grotesk', category: 'Tech & Sci-Fi', preview: 'Space Grotesk Tech' },
        { name: 'Orbitron', category: 'Tech & Sci-Fi', preview: 'ORBITRON CYBER' },
        { name: 'JetBrains Mono', category: 'Monospace', preview: 'JetBrains Code' },
        { name: 'Fira Code', category: 'Monospace', preview: 'Fira Code Mono' },
        { name: 'Source Code Pro', category: 'Monospace', preview: 'Source Code Pro' },
        { name: 'Space Mono', category: 'Monospace', preview: 'Space Mono' },
        { name: 'Roboto Mono', category: 'Monospace', preview: 'Roboto Mono' },
        { name: 'Press Start 2P', category: 'Retro 8-Bit', preview: 'PRESS START 2P' },
        { name: 'VT323', category: 'Retro Terminal', preview: 'VT323 RETRO' },
        { name: 'Share Tech', category: 'Tech & Sci-Fi', preview: 'Share Tech Cyber' },
        { name: 'Major Mono Display', category: 'Tech & Sci-Fi', preview: 'Major Mono Display' },
        { name: 'Silkscreen', category: 'Retro 8-Bit', preview: 'SILKSCREEN PIXEL' },
        { name: 'Chakra Petch', category: 'Tech & Sci-Fi', preview: 'Chakra Petch Mecha' },
        { name: 'Exo 2', category: 'Tech & Sci-Fi', preview: 'Exo 2 Futuristic' },
        { name: 'Audiowide', category: 'Tech & Sci-Fi', preview: 'AUDIOWIDE NEON' },
        { name: 'Goldman', category: 'Tech & Sci-Fi', preview: 'GOLDMAN CYBER' },
        { name: 'Michroma', category: 'Tech & Sci-Fi', preview: 'MICHROMA FUTURE' },
        { name: 'Oxanium', category: 'Tech & Sci-Fi', preview: 'OXANIUM GAMING' },
        { name: 'Bruno Ace', category: 'Tech & Sci-Fi', preview: 'BRUNO ACE RACING' },
        { name: 'Megrim', category: 'Tech & Sci-Fi', preview: 'MEGRIM ABSTRACT' }
      ]
    };

    // Live background catalog sync
    this.fetchLiveGoogleFonts();
  }

  /**
   * Fetches extra live Google Fonts from public directory in background
   */
  async fetchLiveGoogleFonts() {
    try {
      const endpoints = [
        'https://api.fontsource.org/v1/fonts',
        'https://cdn.jsdelivr.net/gh/jonathantneal/google-fonts-complete@master/google-fonts.json'
      ];

      for (const url of endpoints) {
        try {
          const res = await fetch(url, { cache: 'force-cache' });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              data.forEach(item => {
                const fontName = item.family || item.id;
                if (!fontName) return;
                const isDevanagari = item.subsets && item.subsets.includes('devanagari');

                if (isDevanagari) {
                  const exists = this.fonts.hindi.some(h => h.name.toLowerCase() === fontName.toLowerCase());
                  if (!exists) {
                    this.fonts.hindi.push({
                      name: fontName,
                      category: 'Hindi Live',
                      preview: 'सुंदर हिंदी स्टाइल'
                    });
                  }
                } else {
                  const exists = this.fonts.english.some(e => e.name.toLowerCase() === fontName.toLowerCase());
                  if (!exists) {
                    this.fonts.english.push({
                      name: fontName,
                      category: item.category || 'Google Live',
                      preview: fontName
                    });
                  }
                }
              });
              break; // successfully fetched
            } else if (typeof data === 'object' && data !== null) {
              Object.keys(data).forEach(fontName => {
                const item = data[fontName];
                const isDevanagari = item.category === 'devanagari' || (item.variants && item.variants.devanagari);
                if (isDevanagari) {
                  const exists = this.fonts.hindi.some(h => h.name.toLowerCase() === fontName.toLowerCase());
                  if (!exists) {
                    this.fonts.hindi.push({ name: fontName, category: 'Hindi Live', preview: 'सुंदर हिंदी स्टाइल' });
                  }
                } else {
                  const exists = this.fonts.english.some(e => e.name.toLowerCase() === fontName.toLowerCase());
                  if (!exists) {
                    this.fonts.english.push({ name: fontName, category: item.category || 'Google Live', preview: fontName });
                  }
                }
              });
              break;
            }
          }
        } catch (innerErr) {
          // continue to next endpoint
        }
      }

      if (window.onFontListUpdated) {
        window.onFontListUpdated();
      }
    } catch (e) {
      // Offline fallback
    }
  }

  /**
   * Detects if given text contains Hindi / Devanagari script
   * @param {string} text 
   * @returns {boolean}
   */
  hasDevanagari(text) {
    if (!text) return false;
    return /[\u0900-\u097F]/.test(text);
  }

  /**
   * Returns a paginated slice of fonts for infinite scrolling
   * @param {'hindi'|'english'} language 
   * @param {number} page 
   * @param {number} pageSize 
   * @param {string} search 
   */
  getPaginatedFonts(language = 'english', page = 1, pageSize = 12, search = '') {
    const list = this.fonts[language] || this.fonts.english;
    const term = (search || '').trim();
    const lowerTerm = term.toLowerCase();

    let filtered = list;
    if (lowerTerm) {
      filtered = list.filter(f => f.name.toLowerCase().includes(lowerTerm) || f.category.toLowerCase().includes(lowerTerm));

      // If user typed a custom font name not exactly in the top results, offer custom font card at top
      const hasExactMatch = filtered.some(f => f.name.toLowerCase() === lowerTerm);
      if (!hasExactMatch && term.length >= 2 && page === 1) {
        filtered = [
          {
            name: term.charAt(0).toUpperCase() + term.slice(1),
            category: '⚡ Live Google Font',
            preview: term,
            isCustomDirect: true
          },
          ...filtered
        ];
      }
    }

    const total = filtered.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const items = filtered.slice(startIndex, endIndex);
    const hasMore = endIndex < total;

    return {
      items,
      page,
      total,
      hasMore
    };
  }

  /**
   * Preloads a batch of fonts for preview rendering in cards
   * @param {Array<string>} fontNames 
   */
  loadPreviewFonts(fontNames) {
    if (!fontNames || fontNames.length === 0) return;
    const toLoad = fontNames.filter(name => !this.previewInjected.has(name));
    if (toLoad.length === 0) return;

    toLoad.forEach(name => this.previewInjected.add(name));
    const fontParams = toLoad.map(name => `family=${name.replace(/\s+/g, '+')}:wght@400;700`).join('&');
    const href = `https://fonts.googleapis.com/css2?${fontParams}&display=swap`;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  /**
   * Loads full weights for a selected Google Font
   * @param {string} fontName 
   * @param {Array<string>} weights 
   * @returns {Promise<boolean>}
   */
  async loadGoogleFont(fontName, weights = ['400', '600', '700', '800']) {
    if (!fontName) return false;
    if (this.loadedFonts.has(fontName)) return true;

    const formattedFont = fontName.replace(/\s+/g, '+');
    const weightsParam = weights.join(';');
    const fontHref = `https://fonts.googleapis.com/css2?family=${formattedFont}:wght@${weightsParam}&display=swap`;

    if (!this.injectedLinks.has(fontHref)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontHref;
      document.head.appendChild(link);
      this.injectedLinks.add(fontHref);
    }

    try {
      if (document.fonts && document.fonts.load) {
        await Promise.all(
          weights.map(w => document.fonts.load(`${w} 16px "${fontName}"`))
        );
        await document.fonts.ready;
      }
      this.loadedFonts.add(fontName);
      return true;
    } catch (err) {
      console.warn(`Font load warning for "${fontName}":`, err);
      this.loadedFonts.add(fontName);
      return true;
    }
  }

  /**
   * Builds the font fallback CSS string
   * @param {string} primaryFont 
   * @param {boolean} isDevanagari 
   * @returns {string}
   */
  getFontFamilyString(primaryFont, isDevanagari = false) {
    if (isDevanagari) {
      return `"${primaryFont}", "Noto Sans Devanagari", "Mangal", "Poppins", sans-serif`;
    }
    return `"${primaryFont}", "Poppins", Arial, sans-serif`;
  }

  /**
   * Prepares font before canvas render or export
   * @param {string} fontName 
   * @param {number|string} weight 
   * @param {number} size 
   */
  async ensureFontReady(fontName, weight = 700, size = 64) {
    await this.loadGoogleFont(fontName);
    if (document.fonts && document.fonts.load) {
      try {
        await document.fonts.load(`${weight} ${size}px "${fontName}"`);
        await document.fonts.ready;
      } catch (e) {
        console.warn('ensureFontReady error:', e);
      }
    }
  }
}

// Global singleton instance
window.FontManager = new FontManagerClass();
