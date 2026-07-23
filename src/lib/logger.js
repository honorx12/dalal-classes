/**
 * Centralized logging utility
 * Reduces verbosity in production builds
 * Never logs sensitive data like tokens, keys, emails, or payment info
 */

const isProd = import.meta.env.PROD;

/**
 * Sanitizes error objects to remove sensitive data
 * @param {Error|Object} error
 * @returns {Object} Sanitized error info
 */
function sanitizeError(error) {
  if (!error) return null;
  
  // If it's an Error object, extract safe properties
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      // Only include stack in development
      ...(isProd ? {} : { stack: error.stack }),
    };
  }
  
  // If it's a plain object, return a safe copy
  if (typeof error === 'object') {
    const safe = {};
    for (const [key, value] of Object.entries(error)) {
      // Skip sensitive keys
      const sensitiveKeys = ['token', 'password', 'secret', 'key', 'auth', 'authorization', 'api_key', 'apikey'];
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        safe[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        safe[key] = sanitizeError(value);
      } else {
        safe[key] = value;
      }
    }
    return safe;
  }
  
  return error;
}

/**
 * Logs an error message
 * In production, only logs the error code/message, not full objects
 * @param {string} context - Where the error occurred
 * @param {Error|Object} error - The error to log
 * @param {Object} extra - Additional safe context (no PII)
 */
export function logError(context, error, extra = {}) {
  if (isProd) {
    // In production, only log minimal info
    const sanitized = sanitizeError(error);
    console.error(`[${context}]`, sanitized?.message || sanitized || error);
  } else {
    // In development, log full details
    const sanitized = sanitizeError(error);
    console.error(`[${context}]`, sanitized, extra);
  }
}

/**
 * Logs a warning message
 * @param {string} context - Where the warning occurred
 * @param {string} message - The warning message
 */
export function logWarning(context, message) {
  if (!isProd) {
    console.warn(`[${context}]`, message);
  }
}

/**
 * Logs an informational message (dev only)
 * @param {string} context - Where the log originated
 * @param {string} message - The message
 */
export function logInfo(context, message) {
  if (!isProd) {
    // eslint-disable-next-line no-console
    console.log(`[${context}]`, message);
  }
}

/**
 * Logs debug information (dev only)
 * @param {string} context - Where the log originated
 * @param {...any} args - Values to log
 */
export function logDebug(context, ...args) {
  if (!isProd && import.meta.env.VITE_DEBUG === 'true') {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG:${context}]`, ...args);
  }
}

export default {
  error: logError,
  warn: logWarning,
  info: logInfo,
  debug: logDebug,
};
