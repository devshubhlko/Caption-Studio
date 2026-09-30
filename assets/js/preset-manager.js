/**
 * Preset Manager Module
 * Manages built-in design presets and user-created custom presets persisted in localStorage.
 */

class PresetManagerClass {
  constructor() {
    this.storageKey = 'caption_studio_presets_v2';
    
    this.builtInPresets = [
      // ==========================================
      // SECTION 0: INSTAGRAM 2026 VIRAL REELS (12)
      // ==========================================
      {
        id: 'ig-aesthetic-serif',
        name: '📸 IG 2026 Aesthetic Serif',
        description: 'Trending aesthetic Instagram Reels style with luxury serif & soft frosted glow',
        category: 'instagram',
        style: {
          fontFamily: 'Cormorant Garamond',
          fontSize: 84,
          fontWeight: '700',
          textColor: '#FFFDF5',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: true,
          boxColor: '#0A0A0E',
          boxOpacity: 0.55,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 82,
          enableStroke: false,
          strokeWidth: 0,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 18,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          animationStyle: 'fade'
        }
      },
      {
        id: 'ig-capcut-viral-pill',
        name: '🔥 CapCut 2026 Viral Pill',
        description: 'Viral yellow font on dark obsidian rounded pill box used by top Instagram creators',
        category: 'instagram',
        style: {
          fontFamily: 'Syne',
          fontSize: 82,
          fontWeight: '800',
          textColor: '#FFE500',
          enableGradient: false,
          canvasBgColor: '#050508',
          enableBox: true,
          boxColor: '#000000',
          boxOpacity: 0.85,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 78,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 4,
          enableShadow: true,
          shadowColor: '#FFE500',
          shadowBlur: 12,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          animationStyle: 'pop'
        }
      },
      {
        id: 'ig-iman-gadzhi-gold',
        name: '💸 Iman Gadzhi Luxury Gold',
        description: 'Cinematic high-status gold typography with dark vignette depth',
        category: 'instagram',
        style: {
          fontFamily: 'Cinzel',
          fontSize: 78,
          fontWeight: '700',
          textColor: '#E6CA65',
          enableGradient: true,
          gradientColor2: '#FFF2B2',
          canvasBgColor: '#020204',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 5,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowOffsetY: 8,
          animationStyle: 'fade'
        }
      },
      {
        id: 'ig-dan-koe-mono',
        name: '🧘 Dan Koe Minimalist Mono',
        description: 'Modern philosophical reel subtitle with ultra-clean monospace & deep focus',
        category: 'instagram',
        style: {
          fontFamily: 'Space Grotesk',
          fontSize: 72,
          fontWeight: '600',
          textColor: '#F8FAFC',
          enableGradient: false,
          canvasBgColor: '#0B0F17',
          enableBox: true,
          boxColor: '#05070B',
          boxOpacity: 0.75,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 82,
          enableStroke: false,
          strokeWidth: 0,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowOffsetY: 3,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'ig-ali-abdaal-clean',
        name: '✨ Ali Abdaal Studio Clean',
        description: 'High readability modern sans with sleek rounded charcoal pill',
        category: 'instagram',
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 76,
          fontWeight: '800',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#090D16',
          enableBox: true,
          boxColor: '#18181B',
          boxOpacity: 0.88,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: false,
          strokeWidth: 0,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 12,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          animationStyle: 'pop'
        }
      },
      {
        id: 'ig-brat-acid-neon',
        name: '💅 Brat Acid Neon 2026',
        description: 'Hyper-trendy neon acid green with punchy pop outline for viral reels',
        category: 'instagram',
        style: {
          fontFamily: 'Outfit',
          fontSize: 86,
          fontWeight: '900',
          textColor: '#8ACE00',
          enableGradient: false,
          canvasBgColor: '#050802',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 78,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 8,
          enableShadow: true,
          shadowColor: '#8ACE00',
          shadowBlur: 20,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          animationStyle: 'pop'
        }
      },
      {
        id: 'ig-b-roll-rose',
        name: '🌸 Soft Aesthetic B-Roll',
        description: 'Warm cream rose typography for aesthetic travel, food and lifestyle reels',
        category: 'instagram',
        style: {
          fontFamily: 'Playfair Display',
          fontSize: 78,
          fontWeight: '700',
          textColor: '#FFF0EB',
          enableGradient: false,
          canvasBgColor: '#120E10',
          enableBox: true,
          boxColor: '#1E1218',
          boxOpacity: 0.5,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 82,
          enableStroke: false,
          strokeWidth: 0,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 16,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          animationStyle: 'fade'
        }
      },
      {
        id: 'ig-podcast-cyan-pop',
        name: '🎙️ Viral Podcast Cyan Glow',
        description: 'Electric cyan punch with double stroke for podcast and interview shorts',
        category: 'instagram',
        style: {
          fontFamily: 'Montserrat',
          fontSize: 84,
          fontWeight: '900',
          textColor: '#00F5FF',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 8,
          enableShadow: true,
          shadowColor: '#00F5FF',
          shadowBlur: 15,
          shadowOffsetX: 0,
          shadowOffsetY: 0,
          animationStyle: 'pop'
        }
      },
      {
        id: 'ig-retro-90s-anime',
        name: '📼 90s Anime Retro Yellow',
        description: 'Classic nostalgic anime subtitle yellow with vintage drop shadow',
        category: 'instagram',
        style: {
          fontFamily: 'Space Mono',
          fontSize: 72,
          fontWeight: '700',
          textColor: '#FFE600',
          enableGradient: false,
          canvasBgColor: '#08080C',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 85,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 0,
          shadowOffsetX: 5,
          shadowOffsetY: 5,
          animationStyle: 'none'
        }
      },
      {
        id: 'ig-hindi-kalam-aesthetic',
        name: '🇮🇳 Instagram Hindi Shayari',
        description: 'Velvet crimson & gold aesthetic handwriting for Hindi poetry reels',
        category: 'instagram',
        style: {
          fontFamily: 'Kalam',
          fontSize: 84,
          fontWeight: '700',
          textColor: '#FFE4E6',
          enableGradient: true,
          gradientColor2: '#FDA4AF',
          canvasBgColor: '#1A0B10',
          enableBox: true,
          boxColor: '#300814',
          boxOpacity: 0.7,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#4C0519',
          strokeWidth: 3,
          enableShadow: true,
          shadowColor: '#E11D48',
          shadowBlur: 16,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          animationStyle: 'fade'
        }
      },
      {
        id: 'ig-hindi-rozha-royal',
        name: '🇮🇳 IG Royal Hindi Headline',
        description: 'Grand Devanagari poster style with luxury warm gold gradient',
        category: 'instagram',
        style: {
          fontFamily: 'Rozha One',
          fontSize: 86,
          fontWeight: '400',
          textColor: '#FFD700',
          enableGradient: true,
          gradientColor2: '#FFA500',
          canvasBgColor: '#080500',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 78,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          enableShadow: true,
          shadowColor: '#FF8C00',
          shadowBlur: 18,
          shadowOffsetX: 0,
          shadowOffsetY: 4,
          animationStyle: 'pop'
        }
      },
      {
        id: 'ig-streetwear-brutalist',
        name: '⚡ Streetwear Brutalism 2026',
        description: 'Heavy bold all-caps with extreme contrast and high voltage drop shadow',
        category: 'instagram',
        style: {
          fontFamily: 'Archivo Black',
          fontSize: 86,
          fontWeight: '400',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#FF0055',
          strokeWidth: 7,
          enableShadow: true,
          shadowColor: '#00FFE5',
          shadowBlur: 14,
          shadowOffsetX: 4,
          shadowOffsetY: 4,
          animationStyle: 'pop'
        }
      },
      // ==========================================
      // SECTION 1: VIRAL REELS & TIKTOK TRENDS (10)
      // ==========================================
      {
        id: 'hormozi-yellow',
        name: '🔥 Hormozi Viral Yellow',
        description: 'Iconic high-energy yellow with ultra-heavy black stroke & pop animation',
        category: 'viral',
        style: {
          fontFamily: 'Montserrat',
          fontSize: 86,
          fontWeight: '800',
          textColor: '#FFDF00',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 8,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 14,
          shadowOffsetX: 3,
          shadowOffsetY: 6,
          animationStyle: 'pop'
        }
      },
      {
        id: 'mrbeast-pop',
        name: '⚡ Beast Bold Impact',
        description: 'Vibrant neon blue with heavy outline and spring pop animation',
        category: 'viral',
        style: {
          fontFamily: 'Bebas Neue',
          fontSize: 90,
          fontWeight: '400',
          textColor: '#00F0FF',
          enableGradient: false,
          canvasBgColor: '#0A0A0C',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 9,
          enableShadow: true,
          shadowColor: '#00F0FF',
          shadowBlur: 16,
          animationStyle: 'pop'
        }
      },
      {
        id: 'tiktok-lime-neon',
        name: '🍏 TikTok Neon Lime',
        description: 'Electric lime green typography tailored for maximum engagement',
        category: 'viral',
        style: {
          fontFamily: 'Outfit',
          fontSize: 82,
          fontWeight: '800',
          textColor: '#22C55E',
          enableGradient: true,
          gradientColor2: '#A3E635',
          canvasBgColor: '#050811',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 7,
          animationStyle: 'pop'
        }
      },
      {
        id: 'viral-red-alert',
        name: '🚨 Red Alert Viral',
        description: 'Striking red on black with bold punchy stroke',
        category: 'viral',
        style: {
          fontFamily: 'Oswald',
          fontSize: 84,
          fontWeight: '700',
          textColor: '#EF4444',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#FFFFFF',
          strokeWidth: 4,
          enableShadow: true,
          shadowColor: '#EF4444',
          shadowBlur: 18,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'gold-sovereign',
        name: '👑 Beast Gold Sovereign',
        description: 'Luxury metallic gold with deep contrast shadow',
        category: 'viral',
        style: {
          fontFamily: 'Cinzel',
          fontSize: 78,
          fontWeight: '700',
          textColor: '#FBBF24',
          enableGradient: true,
          gradientColor2: '#D97706',
          canvasBgColor: '#030712',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          enableShadow: true,
          shadowColor: '#F59E0B',
          shadowBlur: 20,
          animationStyle: 'fade'
        }
      },
      {
        id: 'electric-violet-reels',
        name: '💜 Electric Violet Viral',
        description: 'Vibrant neon purple with crisp white glow',
        category: 'viral',
        style: {
          fontFamily: 'Syne',
          fontSize: 80,
          fontWeight: '800',
          textColor: '#C084FC',
          enableGradient: true,
          gradientColor2: '#E879F9',
          canvasBgColor: '#0B0B14',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 7,
          animationStyle: 'pop'
        }
      },
      {
        id: 'punchy-orange-reels',
        name: '🍊 Sunset Punch Orange',
        description: 'Blazing flame orange with thick black outline',
        category: 'viral',
        style: {
          fontFamily: 'Anton',
          fontSize: 88,
          fontWeight: '400',
          textColor: '#FB923C',
          enableGradient: true,
          gradientColor2: '#F97316',
          canvasBgColor: '#121216',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 8,
          animationStyle: 'pop'
        }
      },
      {
        id: 'white-hot-fire',
        name: '🔥 White-Hot Fire Outline',
        description: 'Pure white text with vivid red stroke and heavy shadow',
        category: 'viral',
        style: {
          fontFamily: 'Poppins',
          fontSize: 80,
          fontWeight: '800',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#DC2626',
          strokeWidth: 7,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 14,
          animationStyle: 'pop'
        }
      },
      {
        id: 'cyan-thunder',
        name: '⚡ Cyan Thunder Shock',
        description: 'High voltage bright cyan with dark cyber glow',
        category: 'viral',
        style: {
          fontFamily: 'Righteous',
          fontSize: 80,
          fontWeight: '400',
          textColor: '#38BDF8',
          enableGradient: true,
          gradientColor2: '#818CF8',
          canvasBgColor: '#020617',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 7,
          animationStyle: 'pop'
        }
      },
      {
        id: 'bangers-comic-pop',
        name: '💥 Comic Bang Pop',
        description: 'Exaggerated playful comic style with thick stroke',
        category: 'viral',
        style: {
          fontFamily: 'Bangers',
          fontSize: 92,
          fontWeight: '400',
          textColor: '#FDE047',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 8,
          animationStyle: 'pop'
        }
      },

      // ==========================================
      // SECTION 2: HINDI & DESI VIRAL / SHAYARI (15)
      // ==========================================
      {
        id: 'hindi-viral-red',
        name: '🇮🇳 Hindi Viral Red (Default)',
        description: 'Striking red on crisp white background for Hindi Reels',
        category: 'hindi',
        style: {
          fontFamily: 'Noto Sans Devanagari',
          fontSize: 68,
          fontWeight: '700',
          textColor: '#FF0000',
          enableGradient: false,
          canvasBgColor: '#FFFFFF',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: false,
          animationStyle: 'fade'
        }
      },
      {
        id: 'hindi-royal-gold',
        name: '👑 Hindi Royal Gold',
        description: 'Majestic golden typography with dark contrast shadow',
        category: 'hindi',
        style: {
          fontFamily: 'Rozha One',
          fontSize: 74,
          fontWeight: '400',
          textColor: '#F59E0B',
          enableGradient: true,
          gradientColor2: '#D97706',
          canvasBgColor: '#09090B',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          animationStyle: 'fade'
        }
      },
      {
        id: 'hindi-kalam-shayari',
        name: '✍️ Hindi Kalam Shayari',
        description: 'Warm soulful handwritten Hindi font for poetry and reels',
        category: 'hindi',
        style: {
          fontFamily: 'Kalam',
          fontSize: 76,
          fontWeight: '700',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#18181B',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 16,
          animationStyle: 'fade'
        }
      },
      {
        id: 'hindi-cyber-neon',
        name: '⚡ Hindi Cyber Neon',
        description: 'Futuristic cyan glow for Hindi tech & gaming creators',
        category: 'hindi',
        style: {
          fontFamily: 'Rajdhani',
          fontSize: 82,
          fontWeight: '700',
          textColor: '#00F0FF',
          enableGradient: true,
          gradientColor2: '#3B82F6',
          canvasBgColor: '#050714',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          animationStyle: 'pop'
        }
      },
      {
        id: 'hindi-mukta-clean-pill',
        name: '💊 Hindi Mukta Clean Pill',
        description: 'Modern glassmorphism subtitle pill with Mukta font',
        category: 'hindi',
        style: {
          fontFamily: 'Mukta',
          fontSize: 58,
          fontWeight: '700',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: true,
          boxColor: '#000000',
          boxOpacity: 0.85,
          boxPaddingX: 30,
          boxPaddingY: 16,
          boxRadius: 14,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 82,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'hindi-baloo-cartoon',
        name: '🎈 Hindi Baloo Playful',
        description: 'Bouncy rounded bubbly Hindi font for comedy & entertainment',
        category: 'hindi',
        style: {
          fontFamily: 'Baloo 2',
          fontSize: 78,
          fontWeight: '800',
          textColor: '#FBBF24',
          enableGradient: false,
          canvasBgColor: '#1E1B4B',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#4338CA',
          strokeWidth: 7,
          animationStyle: 'pop'
        }
      },
      {
        id: 'hindi-khand-news',
        name: '📰 Hindi Khand Headlines',
        description: 'Tall condensed headline font for podcasts and news stories',
        category: 'hindi',
        style: {
          fontFamily: 'Khand',
          fontSize: 84,
          fontWeight: '700',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#7F1D1D',
          enableBox: true,
          boxColor: '#991B1B',
          boxOpacity: 0.9,
          boxPaddingX: 28,
          boxPaddingY: 12,
          boxRadius: 8,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'hindi-yatra-vintage',
        name: '🎬 Hindi Yatra Vintage',
        description: 'Retro cinema poster style for storytelling and cinema',
        category: 'hindi',
        style: {
          fontFamily: 'Yatra One',
          fontSize: 72,
          fontWeight: '400',
          textColor: '#FDE047',
          enableGradient: false,
          canvasBgColor: '#1C1917',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          animationStyle: 'fade'
        }
      },
      {
        id: 'hindi-eczar-editorial',
        name: '📖 Hindi Eczar Editorial',
        description: 'Sophisticated literary serif for documentaries & literature',
        category: 'hindi',
        style: {
          fontFamily: 'Eczar',
          fontSize: 66,
          fontWeight: '700',
          textColor: '#F8FAFC',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 14,
          animationStyle: 'fade'
        }
      },
      {
        id: 'hindi-modak-mega',
        name: '🍔 Hindi Modak Mega Bold',
        description: 'Extra thick chunky bubble font for viral shorts',
        category: 'hindi',
        style: {
          fontFamily: 'Modak',
          fontSize: 82,
          fontWeight: '400',
          textColor: '#EC4899',
          enableGradient: true,
          gradientColor2: '#F43F5E',
          canvasBgColor: '#09090B',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#FFFFFF',
          strokeWidth: 6,
          animationStyle: 'pop'
        }
      },
      {
        id: 'hindi-ranga-artistic',
        name: '🎨 Hindi Ranga Expressive',
        description: 'Calligraphic brush stroke styling for emotional reels',
        category: 'hindi',
        style: {
          fontFamily: 'Ranga',
          fontSize: 88,
          fontWeight: '700',
          textColor: '#38BDF8',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          animationStyle: 'fade'
        }
      },
      {
        id: 'hindi-saffron-pride',
        name: '🧡 Hindi Saffron Pride',
        description: 'Vibrant saffron orange with deep shadow',
        category: 'hindi',
        style: {
          fontFamily: 'Noto Sans Devanagari',
          fontSize: 70,
          fontWeight: '800',
          textColor: '#EA580C',
          enableGradient: true,
          gradientColor2: '#F97316',
          canvasBgColor: '#090D1A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#FFFFFF',
          strokeWidth: 4,
          animationStyle: 'pop'
        }
      },
      {
        id: 'hindi-violet-dream',
        name: '🌸 Hindi Violet Dream',
        description: 'Soft pastel purple & pink gradient for lifestyle',
        category: 'hindi',
        style: {
          fontFamily: 'Gotu',
          fontSize: 66,
          fontWeight: '400',
          textColor: '#E879F9',
          enableGradient: true,
          gradientColor2: '#F472B6',
          canvasBgColor: '#180D2A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'fade'
        }
      },
      {
        id: 'hindi-emerald-nature',
        name: '🌿 Hindi Emerald Clean',
        description: 'Crisp emerald green with dark backdrop',
        category: 'hindi',
        style: {
          fontFamily: 'Hind',
          fontSize: 68,
          fontWeight: '700',
          textColor: '#10B981',
          enableGradient: true,
          gradientColor2: '#34D399',
          canvasBgColor: '#022C22',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 5,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'hindi-sarala-modern',
        name: '✨ Hindi Sarala Minimalist',
        description: 'Ultra-clean modern geometric Devanagari',
        category: 'hindi',
        style: {
          fontFamily: 'Sarala',
          fontSize: 64,
          fontWeight: '700',
          textColor: '#F8FAFC',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: true,
          boxColor: '#1E293B',
          boxOpacity: 0.8,
          boxPaddingX: 24,
          boxPaddingY: 14,
          boxRadius: 10,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 82,
          animationStyle: 'fade'
        }
      },

      // ==========================================
      // SECTION 3: GEN-Z AESTHETIC & STREETWEAR (12)
      // ==========================================
      {
        id: 'cyberpunk-2077',
        name: '🤖 Cyberpunk Y2K',
        description: 'Neon cyan text with magenta neon glow backdrop',
        category: 'genz',
        style: {
          fontFamily: 'Orbitron',
          fontSize: 76,
          fontWeight: '800',
          textColor: '#00F0FF',
          enableGradient: true,
          gradientColor2: '#FF007F',
          canvasBgColor: '#040209',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          enableShadow: true,
          shadowColor: '#00F0FF',
          shadowBlur: 20,
          animationStyle: 'pop'
        }
      },
      {
        id: 'barbie-pink-glow',
        name: '💖 Barbiecore Neon Pink',
        description: 'Glossy vibrant pink with glowing aura',
        category: 'genz',
        style: {
          fontFamily: 'Pacifico',
          fontSize: 78,
          fontWeight: '400',
          textColor: '#FF2E93',
          enableGradient: true,
          gradientColor2: '#FFA6D5',
          canvasBgColor: '#1A0011',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableShadow: true,
          shadowColor: '#FF2E93',
          shadowBlur: 22,
          animationStyle: 'fade'
        }
      },
      {
        id: 'acid-green-glitch',
        name: '🧪 Acid Green Glitch',
        description: 'High saturation radioactive green street vibe',
        category: 'genz',
        style: {
          fontFamily: 'Syne',
          fontSize: 82,
          fontWeight: '800',
          textColor: '#CCFF00',
          enableGradient: false,
          canvasBgColor: '#0A0E06',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 8,
          animationStyle: 'pop'
        }
      },
      {
        id: 'sunset-vaporwave',
        name: '🌴 Sunset Vaporwave 80s',
        description: 'Tropical sunset pink-to-yellow gradient on deep violet',
        category: 'genz',
        style: {
          fontFamily: 'Righteous',
          fontSize: 80,
          fontWeight: '400',
          textColor: '#FF6B6B',
          enableGradient: true,
          gradientColor2: '#FFE66D',
          canvasBgColor: '#1A0B2E',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableShadow: true,
          shadowColor: '#FF6B6B',
          shadowBlur: 16,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'euphoria-violet',
        name: '✨ Euphoria Purple Haze',
        description: 'Moody indie purple glow aesthetic',
        category: 'genz',
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 72,
          fontWeight: '800',
          textColor: '#E0AAFF',
          enableGradient: true,
          gradientColor2: '#C77DFF',
          canvasBgColor: '#10002B',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableShadow: true,
          shadowColor: '#9D4EDD',
          shadowBlur: 24,
          animationStyle: 'fade'
        }
      },
      {
        id: 'matrix-terminal',
        name: '💻 Matrix Code Terminal',
        description: 'Monospace hacker green with black pill box',
        category: 'genz',
        style: {
          fontFamily: 'JetBrains Mono',
          fontSize: 64,
          fontWeight: '700',
          textColor: '#00FF66',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: true,
          boxColor: '#031709',
          boxOpacity: 0.95,
          boxPaddingX: 28,
          boxPaddingY: 14,
          boxRadius: 8,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'typewriter'
        }
      },
      {
        id: 'pastel-peach-cozy',
        name: '🍑 Pastel Peach Cozy',
        description: 'Warm soft aesthetic for vlogs and day-in-the-life videos',
        category: 'genz',
        style: {
          fontFamily: 'Caveat',
          fontSize: 82,
          fontWeight: '700',
          textColor: '#FFD166',
          enableGradient: true,
          gradientColor2: '#F4978E',
          canvasBgColor: '#2B1E1E',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'fade'
        }
      },
      {
        id: 'tokyo-night-glitch',
        name: '🗼 Tokyo Midnight Glitch',
        description: 'Electric crimson with dark cityscape vibe',
        category: 'genz',
        style: {
          fontFamily: 'Chakra Petch',
          fontSize: 76,
          fontWeight: '700',
          textColor: '#FF0055',
          enableGradient: true,
          gradientColor2: '#7928CA',
          canvasBgColor: '#080112',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          animationStyle: 'pop'
        }
      },
      {
        id: 'retro-arcade-8bit',
        name: '🕹️ 8-Bit Retro Arcade',
        description: 'Pixel art gaming typography for gaming clips',
        category: 'genz',
        style: {
          fontFamily: 'Press Start 2P',
          fontSize: 48,
          fontWeight: '400',
          textColor: '#FBBF24',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: true,
          boxColor: '#000000',
          boxOpacity: 0.9,
          boxPaddingX: 24,
          boxPaddingY: 16,
          boxRadius: 4,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'pop'
        }
      },
      {
        id: 'lavender-aesthetic',
        name: '🪻 Clean Lavender Haze',
        description: 'Muted pastel lavender on slate for calm visual aesthetic',
        category: 'genz',
        style: {
          fontFamily: 'Urbanist',
          fontSize: 70,
          fontWeight: '700',
          textColor: '#DDD6FE',
          enableGradient: false,
          canvasBgColor: '#1E1B4B',
          enableBox: true,
          boxColor: '#0F0E2A',
          boxOpacity: 0.8,
          boxPaddingX: 28,
          boxPaddingY: 14,
          boxRadius: 14,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'fade'
        }
      },
      {
        id: 'velvet-underground',
        name: '🍷 Dark Velvet Indie',
        description: 'Deep maroon & burgundy luxury aesthetic',
        category: 'genz',
        style: {
          fontFamily: 'Playfair Display',
          fontSize: 72,
          fontWeight: '700',
          textColor: '#FDA4AF',
          enableGradient: true,
          gradientColor2: '#FB7185',
          canvasBgColor: '#270811',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'fade'
        }
      },
      {
        id: 'mint-fresh-genz',
        name: '🍃 Mint Fresh Chill',
        description: 'Cool refreshing cyan-mint on charcoal',
        category: 'genz',
        style: {
          fontFamily: 'Outfit',
          fontSize: 72,
          fontWeight: '700',
          textColor: '#6EE7B7',
          enableGradient: true,
          gradientColor2: '#38BDF8',
          canvasBgColor: '#0F172A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 5,
          animationStyle: 'slideUp'
        }
      },

      // ==========================================
      // SECTION 4: CINEMATIC & NETFLIX DOCUMENTARY (8)
      // ==========================================
      {
        id: 'netflix-original',
        name: '🍿 Netflix Original Subtitle',
        description: 'Industry-standard ultra-clean yellow on dark translucent pill',
        category: 'cinematic',
        style: {
          fontFamily: 'Roboto',
          fontSize: 56,
          fontWeight: '500',
          textColor: '#FFE600',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: true,
          boxColor: '#000000',
          boxOpacity: 0.8,
          boxPaddingX: 26,
          boxPaddingY: 12,
          boxRadius: 8,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 84,
          animationStyle: 'fade'
        }
      },
      {
        id: 'vox-explainer',
        name: '💡 Vox Explainer Video',
        description: 'Crisp modern grotesque typography for educational & explainer content',
        category: 'cinematic',
        style: {
          fontFamily: 'Inter',
          fontSize: 66,
          fontWeight: '800',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#09090B',
          enableBox: true,
          boxColor: '#F59E0B',
          boxOpacity: 1.0,
          boxPaddingX: 24,
          boxPaddingY: 10,
          boxRadius: 6,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'pop'
        }
      },
      {
        id: 'imax-cinema-yellow',
        name: '🎬 IMAX Cinema Yellow',
        description: 'High contrast blockbuster movie subtitle format',
        category: 'cinematic',
        style: {
          fontFamily: 'Open Sans',
          fontSize: 60,
          fontWeight: '700',
          textColor: '#FFEA00',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 84,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 10,
          animationStyle: 'fade'
        }
      },
      {
        id: 'a24-indie-film',
        name: '🎞️ A24 Indie Aesthetic',
        description: 'Arthouse serif aesthetic with minimalist spacing',
        category: 'cinematic',
        style: {
          fontFamily: 'Cormorant Garamond',
          fontSize: 70,
          fontWeight: '700',
          textColor: '#F8FAFC',
          enableGradient: false,
          canvasBgColor: '#121214',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 18,
          animationStyle: 'fade'
        }
      },
      {
        id: 'bbc-documentary',
        name: '🌍 BBC Documentary White',
        description: 'Clean pure white typography with subtle drop shadow',
        category: 'cinematic',
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 58,
          fontWeight: '600',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 84,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 12,
          animationStyle: 'fade'
        }
      },
      {
        id: 'true-crime-dark',
        name: '🔍 True Crime Mystery',
        description: 'Eerie typewriter font with stark dark aura',
        category: 'cinematic',
        style: {
          fontFamily: 'Space Mono',
          fontSize: 60,
          fontWeight: '700',
          textColor: '#E2E8F0',
          enableGradient: false,
          canvasBgColor: '#050505',
          enableBox: true,
          boxColor: '#171717',
          boxOpacity: 0.9,
          boxPaddingX: 24,
          boxPaddingY: 12,
          boxRadius: 4,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'typewriter'
        }
      },
      {
        id: 'hollywood-blockbuster',
        name: '📽️ Hollywood Blockbuster Gold',
        description: 'Epic cinematic title style with golden shine',
        category: 'cinematic',
        style: {
          fontFamily: 'Cinzel',
          fontSize: 74,
          fontWeight: '700',
          textColor: '#FDE047',
          enableGradient: true,
          gradientColor2: '#F59E0B',
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 6,
          animationStyle: 'fade'
        }
      },
      {
        id: 'golden-hour-cinema',
        name: '🌅 Golden Hour Sunset Cinema',
        description: 'Warm sunset amber on deep espresso background',
        category: 'cinematic',
        style: {
          fontFamily: 'Fraunces',
          fontSize: 68,
          fontWeight: '700',
          textColor: '#FED7AA',
          enableGradient: true,
          gradientColor2: '#FB923C',
          canvasBgColor: '#1C130D',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'fade'
        }
      },

      // ==========================================
      // SECTION 5: MODERN MINIMAL & TECH UI (8)
      // ==========================================
      {
        id: 'apple-keynote-clean',
        name: '🍏 Apple Keynote Clean',
        description: 'Sleek ultra-crisp typography on deep obsidian',
        category: 'minimal',
        style: {
          fontFamily: 'Inter',
          fontSize: 66,
          fontWeight: '700',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'fade'
        }
      },
      {
        id: 'glass-pill-minimal',
        name: '🧊 Frosted Glass Pill',
        description: 'Semi-transparent frosted pill box overlay for any video',
        category: 'minimal',
        style: {
          fontFamily: 'DM Sans',
          fontSize: 56,
          fontWeight: '600',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: true,
          boxColor: '#000000',
          boxOpacity: 0.75,
          boxPaddingX: 32,
          boxPaddingY: 16,
          boxRadius: 24,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 82,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'spotify-canvas-ui',
        name: '🎵 Spotify Canvas Minimal',
        description: 'Bold rounded white typography on charcoal backdrop',
        category: 'minimal',
        style: {
          fontFamily: 'Montserrat',
          fontSize: 70,
          fontWeight: '800',
          textColor: '#1ED760',
          enableGradient: false,
          canvasBgColor: '#121212',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'pop'
        }
      },
      {
        id: 'notion-minimalist',
        name: '📝 Notion Minimalist Mono',
        description: 'Clean monochrome aesthetic for productivity creators',
        category: 'minimal',
        style: {
          fontFamily: 'Space Grotesk',
          fontSize: 64,
          fontWeight: '700',
          textColor: '#262626',
          enableGradient: false,
          canvasBgColor: '#FAFAFA',
          enableBox: true,
          boxColor: '#E5E5E5',
          boxOpacity: 0.9,
          boxPaddingX: 24,
          boxPaddingY: 12,
          boxRadius: 8,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'fade'
        }
      },
      {
        id: 'silicon-valley-tech',
        name: '🚀 Silicon Valley Tech',
        description: 'Modern blue-indigo gradient for tech reviews & AI reels',
        category: 'minimal',
        style: {
          fontFamily: 'Manrope',
          fontSize: 68,
          fontWeight: '800',
          textColor: '#60A5FA',
          enableGradient: true,
          gradientColor2: '#818CF8',
          canvasBgColor: '#080E1A',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableStroke: true,
          strokeColor: '#000000',
          strokeWidth: 5,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'pure-dark-obsidian',
        name: '🖤 Pure Dark Obsidian',
        description: 'Pure black background with crisp white typography and soft glow',
        category: 'minimal',
        style: {
          fontFamily: 'Figtree',
          fontSize: 64,
          fontWeight: '700',
          textColor: '#F8FAFC',
          enableGradient: false,
          canvasBgColor: '#000000',
          enableBox: false,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          enableShadow: true,
          shadowColor: '#000000',
          shadowBlur: 14,
          animationStyle: 'fade'
        }
      },
      {
        id: 'clean-slate-pill',
        name: '🪨 Clean Slate Pill Box',
        description: 'Navy slate pill box with bright white text',
        category: 'minimal',
        style: {
          fontFamily: 'Plus Jakarta Sans',
          fontSize: 54,
          fontWeight: '600',
          textColor: '#FFFFFF',
          enableGradient: false,
          canvasBgColor: '#0B0F19',
          enableBox: true,
          boxColor: '#1E293B',
          boxOpacity: 0.9,
          boxPaddingX: 26,
          boxPaddingY: 14,
          boxRadius: 12,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 82,
          animationStyle: 'slideUp'
        }
      },
      {
        id: 'fira-code-developer',
        name: '👨‍💻 Developer Code Mono',
        description: 'Clean coding monospace font with syntax highlight pill',
        category: 'minimal',
        style: {
          fontFamily: 'Fira Code',
          fontSize: 56,
          fontWeight: '600',
          textColor: '#38BDF8',
          enableGradient: false,
          canvasBgColor: '#0F172A',
          enableBox: true,
          boxColor: '#020617',
          boxOpacity: 0.92,
          boxPaddingX: 24,
          boxPaddingY: 12,
          boxRadius: 8,
          presetPosition: 'bot-center',
          customPosX: 50,
          customPosY: 80,
          animationStyle: 'typewriter'
        }
      }
    ];

    this.customPresets = this.loadCustomPresets();
  }

  /**
   * Loads custom presets from localStorage
   * @returns {Array}
   */
  loadCustomPresets() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Could not read presets from localStorage:', e);
      return [];
    }
  }

  /**
   * Saves custom presets to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.customPresets));
    } catch (e) {
      console.error('Could not save preset to localStorage:', e);
    }
  }

  /**
   * Returns all available presets (built-in + custom)
   * @returns {Array}
   */
  getAllPresets() {
    return [
      ...this.builtInPresets.map(p => ({ ...p, isCustom: false })),
      ...this.customPresets.map(p => ({ ...p, isCustom: true }))
    ];
  }

  /**
   * Saves current style as a new custom preset
   * @param {string} name 
   * @param {Object} styleObj 
   * @returns {Object}
   */
  saveCustomPreset(name, styleObj) {
    const newPreset = {
      id: 'custom-' + Date.now(),
      name: name || 'Custom Style ' + (this.customPresets.length + 1),
      description: 'User saved caption style',
      category: 'custom',
      isCustom: true,
      style: { ...styleObj }
    };

    this.customPresets.push(newPreset);
    this.saveToStorage();
    return newPreset;
  }

  /**
   * Deletes a custom preset by ID
   * @param {string} id 
   */
  deleteCustomPreset(id) {
    this.customPresets = this.customPresets.filter(p => p.id !== id);
    this.saveToStorage();
  }

  /**
   * Duplicates a preset into custom list
   * @param {string} id 
   */
  duplicatePreset(id) {
    const all = this.getAllPresets();
    const target = all.find(p => p.id === id);
    if (!target) return null;

    return this.saveCustomPreset(`${target.name} (Copy)`, target.style);
  }

  /**
   * Renames a custom preset
   * @param {string} id 
   * @param {string} newName 
   */
  renameCustomPreset(id, newName) {
    const item = this.customPresets.find(p => p.id === id);
    if (item) {
      item.name = newName;
      this.saveToStorage();
    }
  }
}

// Global Singleton
window.PresetManager = new PresetManagerClass();
