/**
 * Safe LocalStorage wrapper to prevent DOMException / SecurityError crashes
 * when running inside restricted iframes, private browsing, or third-party cookies disabled environments.
 */
export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Error reading key "${key}":`, err);
    }
    return null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Error setting key "${key}":`, err);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Error removing key "${key}":`, err);
    }
  },
};
