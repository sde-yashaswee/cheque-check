import pino from 'pino';
import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Universal logger using Pino.
 * In development, we use 'debug' level. In production, 'info'.
 * Logs are output as JSON strings for structured log management.
 */
const pinoLogger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  browser: {
    asObject: true,
  },
});

/**
 * Enhanced logger that wraps Pino and integrates with Sentry.
 */
export const logger = {
  debug: (msg: string, context?: Record<string, any>) => {
    if (context) {
      pinoLogger.debug(context, msg);
    } else {
      pinoLogger.debug(msg);
    }
  },

  info: (msg: string, context?: Record<string, any>) => {
    if (context) {
      pinoLogger.info(context, msg);
    } else {
      pinoLogger.info(msg);
    }
  },

  warn: (msg: string, context?: Record<string, any>) => {
    if (context) {
      pinoLogger.warn(context, msg);
    } else {
      pinoLogger.warn(msg);
    }
  },

  /**
   * Logs an error and explicitly sends it to Sentry.
   */
  error: (msg: string, error?: unknown, context?: Record<string, any>) => {
    const logData = {
      ...(context || {}),
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };

    pinoLogger.error(logData, msg);

    // Send to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        extra: {
          msg,
          ...context
        }
      });
    } else {
      Sentry.captureMessage(msg, {
        level: 'error',
        extra: {
          error,
          ...context
        }
      });
    }
  },

  /**
   * Logs a fatal error and explicitly sends it to Sentry with fatal level.
   */
  fatal: (msg: string, error?: unknown, context?: Record<string, any>) => {
    const logData = {
      ...(context || {}),
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    };

    pinoLogger.fatal(logData, msg);

    // Send to Sentry
    if (error instanceof Error) {
      Sentry.captureException(error, {
        level: 'fatal',
        extra: {
          msg,
          ...context
        }
      });
    } else {
      Sentry.captureMessage(msg, {
        level: 'fatal',
        extra: {
          error,
          ...context
        }
      });
    }
  },
};
