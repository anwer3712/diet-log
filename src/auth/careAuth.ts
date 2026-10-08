// Google OAuth & Device Key Authentication Guard

const CARE_AUTH_CLIENT_ID = '591777420446-hl5hpvd79nna9klklbrpi2lma29skq3s.apps.googleusercontent.com';
const TOKEN_KEY = 'care_idt';
const DEVKEY_KEY = 'care_devkey';
const AUTH_ENFORCE_KEY = 'care_auth_enforced';

export interface AuthState {
  isAuthenticated: boolean;
  userEmail?: string;
  userName?: string;
  userPicture?: string;
  deviceKey?: string;
  isEnforced: boolean;
}

export function getDeviceKey(): string {
  try {
    return localStorage.getItem(DEVKEY_KEY) || '';
  } catch {
    return '';
  }
}

export function saveDeviceKey(key: string): void {
  try {
    localStorage.setItem(DEVKEY_KEY, key);
  } catch {
    // ignore
  }
}

export function isAuthEnforced(): boolean {
  try {
    const val = localStorage.getItem(AUTH_ENFORCE_KEY);
    return val === null ? true : val === 'true'; // 預設安全強制開啟
  } catch {
    return true;
  }
}

export function setAuthEnforced(enforced: boolean): void {
  try {
    localStorage.setItem(AUTH_ENFORCE_KEY, enforced ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function getStoredToken(): string {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
    if (!token) return '';
    // 檢查過期
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (payload.exp && payload.exp * 1000 <= Date.now()) {
        return '';
      }
    }
    return token;
  } catch {
    return '';
  }
}

export function saveToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function clearAuth(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(DEVKEY_KEY);
  } catch {
    // ignore
  }
}

export function parseJwt(token: string): { email?: string; name?: string; picture?: string } {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

export { CARE_AUTH_CLIENT_ID };
