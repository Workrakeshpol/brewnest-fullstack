/**
 * Auth Service
 * ─────────────────────────────────
 * Business logic for authentication operations.
 * Controllers call these methods — they never touch res directly.
 */

import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';
import UserModel from '../models/user.model.js';
import { logger } from '../utils/logger.js';

class AuthService {
  /** Sign up a new user. */
  async signUp({ email, password, name }) {
    // TODO: Implement business logic
    // - Create auth user via supabaseAdmin.auth.admin.createUser()
    // - Assign default 'customer' role in user_roles
    // - Create profile record
    // - Return user + role
    throw new Error('auth.service.signUp: not implemented');
  }

  /** Sign in an existing user. */
  async signIn({ email, password }) {
    // TODO: Implement business logic
    // - Call supabaseAdmin.auth.signInWithPassword()
    // - Fetch role from user_roles
    // - Return session + user + role
    throw new Error('auth.service.signIn: not implemented');
  }

  /** Send a password reset email. */
  async forgotPassword({ email }) {
    // TODO: Implement business logic
    // - Call supabaseAdmin.auth.resetPasswordForEmail()
    throw new Error('auth.service.forgotPassword: not implemented');
  }

  /** Reset password using recovery token. */
  async resetPassword({ access_token, refresh_token, new_password }) {
    // TODO: Implement business logic
    // - Set session from recovery tokens
    // - Update user password
    throw new Error('auth.service.resetPassword: not implemented');
  }

  /** Get current user profile + role. */
  async getCurrentUser(userId) {
    // TODO: Implement business logic
    // - Fetch profile from UserModel
    // - Fetch role from user_roles
    throw new Error('auth.service.getCurrentUser: not implemented');
  }

  /** Update user profile. */
  async updateProfile(userId, updates) {
    // TODO: Implement business logic
    // - Validate allowed fields
    // - Update profile via UserModel.updateById()
    throw new Error('auth.service.updateProfile: not implemented');
  }
}

export default new AuthService();
