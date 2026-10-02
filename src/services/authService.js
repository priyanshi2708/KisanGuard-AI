/**
 * KisanGuard AI — Authentication & User Session Service
 *
 * Communicates with native Express + MongoDB backend (/api/auth/*)
 * using secure HTTP-only cookies and JWT authentication.
 *
 * Rules:
 * - Pure Email & Password authentication with JWT & HTTP-only cookies.
 * - Multi-language support (English, Gujarati, Hindi).
 * - No fake or demo accounts.
 */

import { apiPost, apiGet, apiPut } from './apiClient.js';

const STORAGE_CURRENT_ACCOUNT_KEY = 'kisanguard_account';

/**
 * Registers a new user account with the backend (MongoDB).
 * Sets HTTP-only authentication cookie and stores session cache.
 */
export const registerAccount = async ({ name, phone = '', email, password, language = 'gu', role = 'farmer' }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  const cleanPhone = (phone || '').trim();
  const cleanLanguage = (language || 'gu').toLowerCase();

  if (!cleanEmail || !password || !cleanName) {
    throw new Error('MISSING_CREDENTIALS');
  }

  const response = await apiPost('/api/auth/register', {
    name: cleanName,
    email: cleanEmail,
    password,
    phone: cleanPhone,
    language: cleanLanguage,
    role
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    if (data.errorType === 'EMAIL_ALREADY_EXISTS') {
      throw new Error('ALREADY_REGISTERED');
    }
    if (data.errorType === 'WEAK_PASSWORD') {
      throw new Error('WEAK_PASSWORD');
    }
    if (data.errorType === 'INVALID_EMAIL') {
      throw new Error('INVALID_EMAIL');
    }
    throw new Error(data.message || 'Registration failed.');
  }

  const user = data.user;
  try {
    localStorage.setItem(STORAGE_CURRENT_ACCOUNT_KEY, JSON.stringify(user));
    localStorage.setItem('language', user.language || cleanLanguage);
  } catch (e) {}

  return user;
};

/**
 * Logs in an existing user with Email and Password.
 * Backend verifies bcrypt password hash and sets HTTP-only JWT cookie.
 */
export const loginAccount = async ({ identifier, email, password }) => {
  const loginEmail = (email || identifier || '').trim().toLowerCase();
  const loginPassword = (password || '').trim();

  if (!loginEmail || !loginPassword) {
    throw new Error('MISSING_CREDENTIALS');
  }

  const response = await apiPost('/api/auth/login', {
    email: loginEmail,
    password: loginPassword
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    if (response.status === 401 || data.errorType === 'INVALID_CREDENTIALS') {
      throw new Error('INVALID_CREDENTIALS');
    }
    throw new Error(data.message || 'Login failed.');
  }

  const user = data.user;
  try {
    localStorage.setItem(STORAGE_CURRENT_ACCOUNT_KEY, JSON.stringify(user));
    localStorage.setItem('language', user.language || 'gu');
  } catch (e) {}

  return user;
};

/**
 * Fetches current authenticated user session from backend (/api/auth/me).
 */
export const getMe = async () => {
  try {
    const response = await apiGet('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        localStorage.setItem(STORAGE_CURRENT_ACCOUNT_KEY, JSON.stringify(data.user));
        if (data.user.language) {
          localStorage.setItem('language', data.user.language);
        }
        return data.user;
      }
    }
    // If 401 Unauthorized, clear cached session
    if (response.status === 401) {
      localStorage.removeItem(STORAGE_CURRENT_ACCOUNT_KEY);
    }
  } catch (e) {
    console.warn('[AuthService] Could not reach backend session endpoint:', e.message);
  }
  return getCurrentAccount();
};

/**
 * Returns the cached authenticated user object from localStorage.
 */
export const getCurrentAccount = () => {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(STORAGE_CURRENT_ACCOUNT_KEY);
    if (raw && raw !== 'undefined' && raw !== 'null') {
      const acc = JSON.parse(raw);
      if (acc && typeof acc === 'object' && (acc.id || acc._id)) {
        acc.id = acc.id || acc._id;
        return acc;
      }
    }
  } catch (e) {
    console.error('[AuthService] Error reading active session:', e);
  }
  return null;
};

/**
 * Updates user account details (name and language).
 */
export const updateAccount = async (updatedFields) => {
  const current = getCurrentAccount() || {};
  const updatedUser = { ...current, ...updatedFields };

  try {
    localStorage.setItem(STORAGE_CURRENT_ACCOUNT_KEY, JSON.stringify(updatedUser));
    if (updatedFields.language) {
      localStorage.setItem('language', updatedFields.language);
      // Sync language with backend
      await apiPut('/api/user/language', { language: updatedFields.language }).catch(() => {});
    }
  } catch (e) {}

  return updatedUser;
};

/**
 * Logs out the current user by clearing backend auth cookie and client storage.
 */
export const logoutAccount = async () => {
  try {
    await apiPost('/api/auth/logout', {});
  } catch (e) {}

  try {
    localStorage.removeItem(STORAGE_CURRENT_ACCOUNT_KEY);
  } catch (e) {}
};

export default {
  registerAccount,
  loginAccount,
  getMe,
  getCurrentAccount,
  updateAccount,
  logoutAccount
};
