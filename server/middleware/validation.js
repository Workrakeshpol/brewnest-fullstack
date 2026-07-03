/**
 * Validation Middleware
 * ─────────────────────────────────
 * Lightweight schema-based validation — no external dependencies.
 *
 * Define a schema as a flat object of field rules, then pass it
 * to `validate(schema)` or `validateBody(schema)` / `validateQuery(schema)`.
 *
 * Schema shape:
 *   {
 *     email:    { type: 'email',   required: true },
 *     password: { type: 'string',  required: true, min: 6 },
 *     quantity: { type: 'integer', required: true, min: 1, max: 99 },
 *     tags:     { type: 'array',   required: false },
 *   }
 */

import { ApiError } from '../utils/ApiError.js';

/**
 * Validate a single value against a rule.
 * Returns an error message string or null if valid.
 */
function validateField(value, rule, fieldName) {
  const isUndefined = value === undefined || value === null;

  if (isUndefined) {
    return rule.required ? `${fieldName} is required` : null;
  }

  switch (rule.type) {
    case 'string':
      if (typeof value !== 'string') return `${fieldName} must be a string`;
      if (rule.min && value.length < rule.min)
        return `${fieldName} must be at least ${rule.min} characters`;
      if (rule.max && value.length > rule.max)
        return `${fieldName} must be at most ${rule.max} characters`;
      break;

    case 'email':
      if (typeof value !== 'string') return `${fieldName} must be a string`;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return `${fieldName} must be a valid email address`;
      break;

    case 'integer':
      if (!Number.isInteger(Number(value))) return `${fieldName} must be an integer`;
      if (rule.min !== undefined && Number(value) < rule.min)
        return `${fieldName} must be at least ${rule.min}`;
      if (rule.max !== undefined && Number(value) > rule.max)
        return `${fieldName} must be at most ${rule.max}`;
      break;

    case 'number':
      if (isNaN(Number(value))) return `${fieldName} must be a number`;
      if (rule.min !== undefined && Number(value) < rule.min)
        return `${fieldName} must be at least ${rule.min}`;
      if (rule.max !== undefined && Number(value) > rule.max)
        return `${fieldName} must be at most ${rule.max}`;
      break;

    case 'boolean':
      if (typeof value !== 'boolean') return `${fieldName} must be a boolean`;
      break;

    case 'array':
      if (!Array.isArray(value)) return `${fieldName} must be an array`;
      if (rule.minItems && value.length < rule.minItems)
        return `${fieldName} must have at least ${rule.minItems} items`;
      break;

    case 'uuid':
      if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))
        return `${fieldName} must be a valid UUID`;
      break;

    case 'enum':
      if (!rule.values?.includes(value))
        return `${fieldName} must be one of: ${rule.values?.join(', ')}`;
      break;

    default:
      break;
  }

  return null;
}

/**
 * Validate an object against a schema.
 * Returns { valid, errors } where errors is a { field: message } map.
 */
export function validateObject(data, schema) {
  const errors = {};

  for (const [field, rule] of Object.entries(schema)) {
    const err = validateField(data?.[field], rule, field);
    if (err) errors[field] = err;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Middleware factory: validate req.body against schema.
 */
export function validateBody(schema) {
  return (req, res, next) => {
    const { valid, errors } = validateObject(req.body, schema);
    if (!valid) {
      return next
        ? next(ApiError.badRequest('Validation failed', errors))
        : res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
    }
    req.validatedBody = pickValidFields(req.body, schema);
    if (next) next();
  };
}

/**
 * Middleware factory: validate req.query against schema.
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    const { valid, errors } = validateObject(req.query, schema);
    if (!valid) {
      return next
        ? next(ApiError.badRequest('Invalid query parameters', errors))
        : res.status(400).json({ success: false, error: { message: 'Invalid query parameters', details: errors } });
    }
    if (next) next();
  };
}

/**
 * Generic validate — validates body by default.
 */
export const validate = validateBody;

/** Extract only fields defined in the schema (whitelist). */
function pickValidFields(data, schema) {
  const picked = {};
  for (const field of Object.keys(schema)) {
    if (data?.[field] !== undefined) picked[field] = data[field];
  }
  return picked;
}

export default { validate, validateBody, validateQuery, validateObject };
