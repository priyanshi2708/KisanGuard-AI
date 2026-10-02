/**
 * KisanGuard AI — Centralized API Client
 *
 * All frontend → backend API calls go through this helper.
 * Uses VITE_API_BASE_URL in production; falls back to '' (same origin) in dev.
 * Always sends credentials (HTTP-only JWT cookies).
 *
 * IMPORTANT: GROQ_API_KEY, JWT_SECRET, MONGODB_URI NEVER appear here.
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')
  : '';

/**
 * Builds the full API URL for a given path (e.g. '/api/chat').
 */
export function apiUrl(path) {
  return `${API_BASE}${path}`;
}

/**
 * Standard fetch wrapper including credentials
 */
export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  return fetch(url, {
    credentials: 'include',
    ...options,
    headers
  });
}

/**
 * Safely parse JSON from a fetch Response, handling empty/HTML/error bodies without throwing.
 */
export async function safeJson(response) {
  if (!response) {
    return { success: false, message: 'No response received from server.' };
  }
  try {
    const text = await response.text();
    if (!text || text.trim().length === 0) {
      return { success: response.ok, status: response.status, data: null };
    }
    return JSON.parse(text);
  } catch (err) {
    console.warn('[apiClient] Non-JSON server response:', response.status);
    return {
      success: false,
      status: response.status,
      error: 'SERVER_COMMUNICATION_ERROR',
      message: response.ok
        ? 'Received unexpected response format from server.'
        : `Server communication error (${response.status}). Please check network or try again.`
    };
  }
}

/**
 * POST helper — sends JSON body and returns Response.
 */
export async function apiPost(path, body, options = {}) {
  return apiFetch(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options
  });
}

/**
 * PUT helper — sends JSON body and returns Response.
 */
export async function apiPut(path, body, options = {}) {
  return apiFetch(path, {
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...options
  });
}

/**
 * DELETE helper
 */
export async function apiDelete(path, options = {}) {
  return apiFetch(path, {
    method: 'DELETE',
    ...options
  });
}

/**
 * GET helper — sends query params and returns Response.
 */
export async function apiGet(path, params = {}, options = {}) {
  const qs = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  return apiFetch(path + qs, {
    method: 'GET',
    ...options
  });
}

export default { apiUrl, apiFetch, apiPost, apiPut, apiDelete, apiGet, safeJson };
