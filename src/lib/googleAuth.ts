import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

// Reutilizar instância existente se já inicializada
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => provider.addScope(scope));
// Forçar seleção de conta para permitir conectar a conta do cliente/colega
provider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline',
});

// Cache in-memory e no localStorage do access token para persistência permanente
const TOKEN_KEY = 'nexa_gcal_access_token_v2';
let cachedAccessToken: string | null = typeof window !== 'undefined' ? (localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)) : null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
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
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
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
