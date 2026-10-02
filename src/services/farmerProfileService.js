/**
 * KisanGuard AI — User-Scoped Farmer Profile & History Intelligence Service
 * 
 * Provides isolated, persistent, user-scoped storage for farmer profiles and crop history records.
 * Integrates with MongoDB backend (/api/user/profile) and maintains local cache for instant rendering.
 * 
 * NO fake demo data injection, NO auto-dumping of arbitrary chat messages.
 */

import { getCurrentAccount } from './authService.js';
import { apiGet, apiPut, apiPost } from './apiClient.js';

const STORAGE_PROFILE_PREFIX = 'kisanguard_farmer_profile_';
const STORAGE_HISTORY_PREFIX = 'kisanguard_farmer_history_';

/**
 * Returns the active user ID or 'usr_default' fallback
 */
function getActiveUserId(overrideUserId = null) {
  if (overrideUserId && typeof overrideUserId === 'string' && overrideUserId.trim()) {
    return overrideUserId.trim();
  }
  const account = getCurrentAccount();
  return account?.id || account?._id || 'usr_default';
}

/**
 * Empty profile structure
 */
const EMPTY_PROFILE = {
  name: '',
  language: 'gu',
  village: '',
  district: '',
  state: '',
  landSize: '',
  landUnit: 'acres',
  soilType: '',
  waterAvailability: '',
  currentCrop: '',
  selectedCrops: [],
  lossCauses: [],
  farmingGoals: '',
  onboardingCompleted: false
};

/**
 * Validates input profile parameters
 */
export function validateProfileInput(data = {}) {
  const errors = [];

  if (data.landSize) {
    const match = String(data.landSize).match(/(-?[0-9.]+)/);
    if (match) {
      const num = parseFloat(match[1]);
      if (isNaN(num) || num <= 0 || num > 10000) {
        errors.push('Land size must be a positive number up to 10,000 acres.');
      }
    }
  }

  if (data.village && String(data.village).length > 100) {
    errors.push('Village name is too long.');
  }

  if (data.district && String(data.district).length > 100) {
    errors.push('District name is too long.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Retrieves farmer profile for a given user ID with authorization check.
 * Synchronously returns local cache and triggers background backend sync if needed.
 */
export function getFarmerProfile(userId = null) {
  const targetUserId = getActiveUserId(userId);
  const activeUser = getCurrentAccount();

  if (userId && activeUser && (activeUser.id !== userId && activeUser._id !== userId)) {
    console.warn(`[Security] Unauthorized access attempt: User "${activeUser.id}" tried to read profile of "${userId}"`);
    return null;
  }

  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(`${STORAGE_PROFILE_PREFIX}${targetUserId}`);
    if (raw && raw !== 'undefined' && raw !== 'null') {
      const parsed = JSON.parse(raw);
      return {
        ...EMPTY_PROFILE,
        ...parsed,
        userId: targetUserId
      };
    }
  } catch (e) {
    console.error(`Error reading profile for user ${targetUserId}:`, e);
  }

  return null;
}

/**
 * Fetches the latest profile from backend /api/user/profile and updates local cache.
 */
export async function fetchRemoteProfile() {
  try {
    const response = await apiGet('/api/user/profile');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.profile) {
        const userId = data.profile.userId || getActiveUserId();
        localStorage.setItem(`${STORAGE_PROFILE_PREFIX}${userId}`, JSON.stringify(data.profile));
        return data.profile;
      }
    }
  } catch (e) {
    console.warn('[ProfileService] Remote profile fetch failed:', e.message);
  }
  return getFarmerProfile();
}

/**
 * Saves/updates profile for a given user ID with input validation, local persistence, and MongoDB sync.
 */
export function saveFarmerProfile(profileData = {}, userId = null) {
  const targetUserId = getActiveUserId(userId);
  const activeUser = getCurrentAccount();

  if (userId && activeUser && (activeUser.id !== userId && activeUser._id !== userId)) {
    console.warn(`[Security] Unauthorized profile update attempt by user "${activeUser.id}" for user "${userId}"`);
    return { success: false, errorType: 'UNAUTHORIZED_ACCESS', error: 'Access denied.' };
  }

  // Input Validation
  const val = validateProfileInput(profileData);
  if (!val.valid) {
    return { success: false, errorType: 'VALIDATION_ERROR', error: val.errors.join(' ') };
  }

  try {
    const existing = getFarmerProfile(targetUserId) || {};
    const updated = {
      ...existing,
      ...profileData,
      userId: targetUserId,
      updatedAt: new Date().toISOString()
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${STORAGE_PROFILE_PREFIX}${targetUserId}`, JSON.stringify(updated));
    }

    // Background sync to backend MongoDB
    apiPut('/api/user/profile', updated).catch((err) => {
      console.warn('[ProfileService] Backend profile sync notice:', err.message);
    });

    return { success: true, profile: updated };
  } catch (e) {
    console.error(`Error saving profile for user ${targetUserId}:`, e);
    return { success: false, errorType: 'STORAGE_ERROR', error: e.message };
  }
}

/**
 * Retrieves crop history array for active user
 */
export function getCropHistory(userId = null) {
  const targetUserId = getActiveUserId(userId);
  const activeUser = getCurrentAccount();

  if (userId && activeUser && (activeUser.id !== userId && activeUser._id !== userId)) {
    console.warn(`[Security] Unauthorized crop history access by user "${activeUser.id}" for user "${userId}"`);
    return [];
  }

  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(`${STORAGE_HISTORY_PREFIX}${targetUserId}`);
    if (raw && raw !== 'undefined') {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error(`Error reading crop history for user ${targetUserId}:`, e);
  }

  return [];
}

/**
 * Appends a new verified crop history record for active user
 */
export function addCropHistoryRecord(record = {}, userId = null) {
  const targetUserId = getActiveUserId(userId);
  const activeUser = getCurrentAccount();

  if (userId && activeUser && (activeUser.id !== userId && activeUser._id !== userId)) {
    console.warn(`[Security] Unauthorized crop history modification by user "${activeUser.id}" for user "${userId}"`);
    return { success: false, errorType: 'UNAUTHORIZED_ACCESS', error: 'Access denied.' };
  }

  if (!record.crop || !String(record.crop).trim()) {
    return { success: false, errorType: 'VALIDATION_ERROR', error: 'Crop name is required.' };
  }

  try {
    const history = getCropHistory(targetUserId);
    const newRecord = {
      id: 'rec_' + Date.now(),
      crop: String(record.crop).trim().substring(0, 100),
      season: record.season || '',
      year: record.year || new Date().getFullYear(),
      landSize: record.landSize || '',
      profitLoss: record.profitLoss || 'Profit',
      lossCause: record.lossCause || 'None',
      notes: record.notes || '',
      createdAt: new Date().toISOString()
    };

    const updated = [newRecord, ...history];
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${STORAGE_HISTORY_PREFIX}${targetUserId}`, JSON.stringify(updated));
    }

    // Sync to backend MongoDB
    apiPost('/api/user/crop-history', newRecord).catch(() => {});

    return { success: true, record: newRecord, history: updated };
  } catch (e) {
    console.error(`Error adding crop history record for user ${targetUserId}:`, e);
    return { success: false, errorType: 'STORAGE_ERROR', error: e.message };
  }
}

export default {
  getFarmerProfile,
  fetchRemoteProfile,
  saveFarmerProfile,
  getCropHistory,
  addCropHistoryRecord,
  validateProfileInput
};
