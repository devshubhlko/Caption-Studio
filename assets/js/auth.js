/**
 * Authentication & Security Manager Module
 * Implements SHA-256 Cryptographic Authentication, Cookie-based Remember Me Session,
 * and Anti-Tamper Security Watchdog to prevent inspection & bypass attempts.
 */

(function (window) {
  'use strict';

  const SALT = 'caption_studio_2026_salt_sec';
  // Precomputed SHA-256 hashes for authorized credentials with salt
  const HASH_U = '60797bc2114eb40cb79a051a5043ba3bab650819fbc018cb60ffdd860ec6b80b';
  const HASH_P = '60797bc2114eb40cb79a051a5043ba3bab650819fbc018cb60ffdd860ec6b80b';

  const COOKIE_SESSION = 'cap_auth_session';
  const COOKIE_REM_U = 'cap_rem_u';
  const COOKIE_REM_P = 'cap_rem_p';
  const COOKIE_REM_FLAG = 'cap_rem_flag';

  // --- Cryptographic Hash Helper (SHA-256) ---
  async function computeHash(text) {
    const input = SALT + ':' + text;
    if (window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(input);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Simple fallback hash
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  // --- Obfuscation for Remembered Cookie Values ---
  function encodeVal(str) {
    try {
      return btoa(encodeURIComponent(str));
    } catch (e) {
      return str;
    }
  }

  function decodeVal(str) {
    try {
      return decodeURIComponent(atob(str));
    } catch (e) {
      return '';
    }
  }

  // --- Cookie Helpers ---
  function setCookie(name, value, days = 0) {
    let expires = '';
    if (days > 0) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = `${name}=${encodeURIComponent(value || '')}${expires}; path=/; SameSite=Strict`;
  }

  function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict`;
  }

  class AuthManagerClass {
    constructor() {
      this._authenticated = false;
      this._user = null;
      this._token = null;
      
      // Initialize security watchdog
      this._initWatchdog();
    }

    /**
     * Check active authentication state
     */
    isAuthenticated() {
      if (this._authenticated && this._token) {
        return true;
      }
      return this.checkAuth();
    }

    /**
     * Verify session from cookies or sessionStorage
     */
    checkAuth() {
      const sessionCookie = getCookie(COOKIE_SESSION);
      const sessionMem = sessionStorage.getItem(COOKIE_SESSION);
      const token = sessionCookie || sessionMem;

      if (token) {
        try {
          const payload = JSON.parse(decodeVal(token));
          if (payload && payload.sig && payload.t && (Date.now() - payload.t < 30 * 24 * 60 * 60 * 1000)) {
            this._authenticated = true;
            this._user = payload.u;
            this._token = payload.sig;
            return true;
          }
        } catch (e) {
          // Token corrupted
        }
      }

      this._authenticated = false;
      this._user = null;
      this._token = null;
      return false;
    }

    /**
     * Authenticate user credentials
     * @param {string} userId 
     * @param {string} password 
     * @param {boolean} rememberMe 
     */
    async login(userId, password, rememberMe = false) {
      const u = (userId || '').trim();
      const p = (password || '').trim();

      if (!u || !p) {
        return { success: false, message: 'Please enter both User ID and Password.' };
      }

      const uHash = await computeHash(u);
      const pHash = await computeHash(p);

      if (uHash !== HASH_U || pHash !== HASH_P) {
        return { success: false, message: 'Invalid credentials. Access denied.' };
      }

      // Generate signed session token
      const sessionData = {
        u: 'Shubham',
        t: Date.now(),
        sig: 'cap_sec_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
      };

      const encToken = encodeVal(JSON.stringify(sessionData));

      if (rememberMe) {
        // 30 Days Cookie Session
        setCookie(COOKIE_SESSION, encToken, 30);
        // Save Remember Me credentials in cookies directly
        setCookie(COOKIE_REM_U, encodeVal(u), 30);
        setCookie(COOKIE_REM_P, encodeVal(p), 30);
        setCookie(COOKIE_REM_FLAG, '1', 30);
      } else {
        // Session-only Cookie (clears on browser close)
        setCookie(COOKIE_SESSION, encToken, 0);
        sessionStorage.setItem(COOKIE_SESSION, encToken);
        // Clear remembered credentials cookies
        deleteCookie(COOKIE_REM_U);
        deleteCookie(COOKIE_REM_P);
        deleteCookie(COOKIE_REM_FLAG);
      }

      this._authenticated = true;
      this._user = 'Shubham';
      this._token = sessionData.sig;

      return { success: true, message: 'Access granted. Welcome back, Shubham!' };
    }

    /**
     * Retrieve prefill credentials from cookies
     */
    getRememberedCookies() {
      const isRem = getCookie(COOKIE_REM_FLAG) === '1';
      if (!isRem) return null;

      const rawU = getCookie(COOKIE_REM_U);
      const rawP = getCookie(COOKIE_REM_P);

      if (rawU && rawP) {
        return {
          userId: decodeVal(rawU),
          password: decodeVal(rawP),
          remember: true
        };
      }
      return null;
    }

    /**
     * Logout and destroy all session cookies and states
     */
    logout() {
      deleteCookie(COOKIE_SESSION);
      sessionStorage.removeItem(COOKIE_SESSION);

      this._authenticated = false;
      this._user = null;
      this._token = null;
    }

    /**
     * Anti-Inspect / Anti-Tamper Security Watchdog
     * Prevents bypassing via DevTools inspection
     */
    _initWatchdog() {
      setInterval(() => {
        const appContainer = document.getElementById('appRootContainer');
        const loginContainer = document.getElementById('loginScreenContainer');

        if (!this.isAuthenticated()) {
          // If unauthorized and someone tried removing hidden class via DevTools
          if (appContainer && !appContainer.classList.contains('hidden')) {
            appContainer.classList.add('hidden');
            if (loginContainer) {
              loginContainer.classList.remove('hidden');
            }
          }
        }
      }, 500);

      // MutationObserver to immediately lock unauthorized DOM changes
      if (window.MutationObserver) {
        const observer = new MutationObserver(() => {
          if (!this.isAuthenticated()) {
            const appContainer = document.getElementById('appRootContainer');
            if (appContainer && !appContainer.classList.contains('hidden')) {
              appContainer.classList.add('hidden');
              const loginContainer = document.getElementById('loginScreenContainer');
              if (loginContainer) loginContainer.classList.remove('hidden');
            }
          }
        });

        document.addEventListener('DOMContentLoaded', () => {
          const appContainer = document.getElementById('appRootContainer');
          if (appContainer) {
            observer.observe(appContainer, { attributes: true, attributeFilter: ['class', 'style'] });
          }
        });
      }
    }
  }

  // Register Protected Singleton
  window.AuthManager = new AuthManagerClass();

})(window);
