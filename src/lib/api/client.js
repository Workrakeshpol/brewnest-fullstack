/**
 * API Client — base HTTP client for frontend → backend communication.
 * ─────────────────────────────────
 * Handles:
 *   - Base URL construction
 *   - Auth token injection (from Supabase session)
 *   - JSON serialization / parsing
 *   - Standardized error extraction
 *   - Query string construction
 *
 * Usage:
 *   import { apiClient } from './client';
 *   const data = await apiClient.get('/products');
 */

const BASE_URL = '/api';

/** In-memory token cache (set by auth flows). */
let authToken = null;

/**
 * Set the auth token for subsequent requests.
 * Called after login/signup or when the session is restored.
 */
export function setAuthToken(token) {
  authToken = token;
}

/** Clear the auth token (on logout). */
export function clearAuthToken() {
  authToken = null;
}

/** Build a query string from a params object. */
function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Core request function. */
async function request(method, path, { params, body, headers } = {}) {
  const url = `${BASE_URL}${path}${buildQueryString(params)}`;

  const requestHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Parse JSON response
  let data;
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // Handle errors
  if (!response.ok) {
    const message =
      (typeof data === 'object' && data?.error?.message) ||
      (typeof data === 'object' && data?.error) ||
      `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Return data (unwrap if standardized response)
  if (typeof data === 'object' && data?.success === true && 'data' in data) {
    return data.data;
  }
  return data;
}

/** High-level API client. */
export const apiClient = {
  get:    (path, options) => request('GET',    path, options),
  post:   (path, options) => request('POST',   path, options),
  put:    (path, options) => request('PUT',    path, options),
  patch:  (path, options) => request('PATCH',  path, options),
  delete: (path, options) => request('DELETE', path, options),
};

export default apiClient;
