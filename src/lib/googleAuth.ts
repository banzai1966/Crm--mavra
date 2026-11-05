import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { safeStorage } from '../utils/safeStorage';

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

let appInstance: any = null;
let authInstance: any = null;
let providerInstance: GoogleAuthProvider | null = null;

export const getFirebaseApp = () => {
  if (!appInstance) {
    appInstance = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  }
  return appInstance;
};

export const getFirebaseAuth = () => {
  if (!authInstance) {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
  }
  return authInstance;
};

export const getGoogleProvider = () => {
  if (!providerInstance) {
    providerInstance = new GoogleAuthProvider();
    CALENDAR_SCOPES.forEach((scope) => providerInstance!.addScope(scope));
    providerInstance.setCustomParameters({
      prompt: 'select_account',
      access_type: 'offline',
    });
  }
  return providerInstance;
};

// Safe auth accessor proxy so existing code referencing auth still works
export const auth = new Proxy({} as any, {
  get(target, prop) {
    try {
      const actualAuth = getFirebaseAuth();
      const val = (actualAuth as any)[prop];
      return typeof val === 'function' ? val.bind(actualAuth) : val;
    } catch (e) {
      console.warn('[GoogleAuth] Auth not ready yet for property:', prop);
      return undefined;
    }
  },
});

// Cache in-memory e no safeStorage do access token para persistência permanente
const TOKEN_KEY = 'nexa_gcal_access_token_v2';
let cachedAccessToken: string | null = safeStorage.getItem(TOKEN_KEY);
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  try {
    const authInstance = getFirebaseAuth();
    return onAuthStateChanged(authInstance, async (user: User | null) => {
      const token = cachedAccessToken || (typeof window !== 'undefined' ? (localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)) : null);
      if (user && token) {
        cachedAccessToken = token;
        if (onAuthSuccess) onAuthSuccess(user, token);
      } else if (user && !token) {
        // User is logged in with Firebase Auth, notify app with user
        if (onAuthSuccess) onAuthSuccess(user, '');
      } else {
        if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      }
    });
  } catch (err) {
    console.warn('[GoogleAuth] Deferred initAuth (auth component not ready yet):', err);
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const authInstance = getFirebaseAuth();
    const providerInstance = getGoogleProvider();
    const result = await signInWithPopup(authInstance, providerInstance);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google Calendar.');
    }

    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, credential.accessToken);
      sessionStorage.setItem(TOKEN_KEY, credential.accessToken);
    }
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  if (cachedAccessToken) return cachedAccessToken;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      cachedAccessToken = stored;
      return stored;
    }
  }
  return null;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  }
};

export const logoutGoogle = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error(e);
  }
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
};
