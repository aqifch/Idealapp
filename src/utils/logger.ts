/**
 * Development-only Logger Utility
 * 
 * All console.log/warn/error calls should go through this utility.
 * In production (import.meta.env.PROD), all logging is silenced.
 * In development (import.meta.env.DEV), logs work normally.
 */

const isDev = import.meta.env.DEV;

export const logger = {
    log: (...args: unknown[]) => {
        if (isDev) console.log(...args);
    },
    warn: (...args: unknown[]) => {
        if (isDev) console.warn(...args);
    },
    error: (...args: unknown[]) => {
        // Errors are always logged (even in production) for debugging
        console.error(...args);
    },
    info: (...args: unknown[]) => {
        if (isDev) console.info(...args);
    },
};

export default logger;
