/**
 * Logger — minimal structured logger for serverless environment.
 * Outputs JSON in production, pretty-printed in development.
 */

import { env } from '../config/index.js';

const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const minLevel = env.IS_DEV ? LEVELS.debug : LEVELS.info;

function format(level, message, meta) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };

  if (env.IS_DEV) {
    // Pretty print in dev
    const prefix = `[${entry.timestamp}] ${level.toUpperCase()}`;
    return meta
      ? `${prefix}: ${message} ${JSON.stringify(meta, null, 0)}`
      : `${prefix}: ${message}`;
  }
  return JSON.stringify(entry);
}

export const logger = {
  debug(message, meta) {
    if (LEVELS.debug >= minLevel) console.debug(format('debug', message, meta));
  },
  info(message, meta) {
    if (LEVELS.info >= minLevel) console.info(format('info', message, meta));
  },
  warn(message, meta) {
    if (LEVELS.warn >= minLevel) console.warn(format('warn', message, meta));
  },
  error(message, meta) {
    if (LEVELS.error >= minLevel) console.error(format('error', message, meta));
  },
};

export default logger;
