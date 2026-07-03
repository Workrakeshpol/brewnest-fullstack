/**
 * Auth Validation Schemas
 * ─────────────────────────────────
 * Used by validation middleware to validate request bodies.
 */

export const signUpSchema = {
  email:    { type: 'email',   required: true },
  password: { type: 'string',  required: true, min: 6, max: 128 },
  name:     { type: 'string',  required: false, max: 100 },
};

export const signInSchema = {
  email:    { type: 'email',   required: true },
  password: { type: 'string',  required: true },
};

export const forgotPasswordSchema = {
  email: { type: 'email', required: true },
};

export const resetPasswordSchema = {
  access_token:  { type: 'string', required: true },
  refresh_token: { type: 'string', required: true },
  new_password:  { type: 'string', required: true, min: 6 },
};

export const updateProfileSchema = {
  name:       { type: 'string', required: false, max: 100 },
  phone:      { type: 'string', required: false, max: 20 },
  avatar_url: { type: 'string', required: false },
};

export default {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
};
