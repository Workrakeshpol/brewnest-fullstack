/**
 * Auth Controller
 * ─────────────────────────────────
 * HTTP layer for authentication endpoints.
 * Delegates business logic to auth.service.
 * Uses apiResponse utilities for standardized output.
 */

import { success, error } from '../utils/apiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import authService from '../services/auth.service.js';

/** POST /api/auth?action=signup */
export async function signUp(req, res) {
 // TODO: Wire to authService.signUp(req.body)
  return error(res, 501, 'Not implemented — auth.controller.signUp');
}

/** POST /api/auth?action=signin */
export async function signIn(req, res) {
  // TODO: Wire to authService.signIn(req.body)
  return error(res, 501, 'Not implemented — auth.controller.signIn');
}

/** POST /api/auth?action=forgot-password */
export async function forgotPassword(req, res) {
  // TODO: Wire to authService.forgotPassword(req.body)
  return error(res, 501, 'Not implemented — auth.controller.forgotPassword');
}

/** POST /api/auth?action=reset-password */
export async function resetPassword(req, res) {
  // TODO: Wire to authService.resetPassword(req.body)
  return error(res, 501, 'Not implemented — auth.controller.resetPassword');
}

/** POST /api/auth?action=signout */
export async function signOut(req, res) {
  // TODO: Wire to authService.signOut()
  return error(res, 501, 'Not implemented — auth.controller.signOut');
}

/** GET /api/auth — get current user */
export async function getCurrentUser(req, res) {
  // TODO: Wire to authService.getCurrentUser(req.user.id)
  return error(res, 501, 'Not implemented — auth.controller.getCurrentUser');
}

/** PUT /api/auth/profile — update profile */
export async function updateProfile(req, res) {
  // TODO: Wire to authService.updateProfile(req.user.id, req.body)
  return error(res, 501, 'Not implemented — auth.controller.updateProfile');
}

export default {
  signUp,
  signIn,
  forgotPassword,
  resetPassword,
  signOut,
  getCurrentUser,
  updateProfile,
};
