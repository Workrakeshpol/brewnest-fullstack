/**
 * Auth API Client
 * ─────────────────────────────────
 * Frontend functions for authentication endpoints.
 */

import { apiClient, setAuthToken, clearAuthToken } from './client.js';

export const authApi = {
  /** Sign up a new account. */
  signUp: (payload) =>
    apiClient.post('/auth', { params: { action: 'signup' }, body: payload }),

  /** Sign in with email + password. */
  signIn: async (payload) => {
    const data = await apiClient.post('/auth', { params: { action: 'signin' }, body: payload });
    if (data?.session?.access_token) {
      setAuthToken(data.session.access_token);
    }
    return data;
  },

  /** Request a password reset email. */
  forgotPassword: (email) =>
    apiClient.post('/auth', { params: { action: 'forgot-password' }, body: { email } }),

  /** Reset password using recovery tokens. */
  resetPassword: (payload) =>
    apiClient.post('/auth', { params: { action: 'reset-password' }, body: payload }),

  /** Sign out — clears the local token. */
  signOut: () => {
    clearAuthToken();
    return apiClient.post('/auth', { params: { action: 'signout' } });
  },

  /** Get the current authenticated user. */
  getCurrentUser: () => apiClient.get('/auth'),

  /** Update the user's profile. */
  updateProfile: (updates) => apiClient.put('/auth', { body: updates }),
};

export default authApi;
