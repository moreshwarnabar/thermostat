import winston from "winston";

// Define log levels
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
} as const;

// Define colors for each log level
const logColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
} as const;

// Add colors to winston
winston.addColors(logColors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";

    if (stack) {
      return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}${
        metaString ? `\nMeta: ${metaString}` : ""
      }`;
    }

    return `${timestamp} [${level.toUpperCase()}]: ${message}${
      metaString ? `\nMeta: ${metaString}` : ""
    }`;
  })
);

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, ...meta } = info;
    const metaString = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";

    if (stack) {
      return `${timestamp} [${level}]: ${message}\n${stack}${
        metaString ? `\nMeta: ${metaString}` : ""
      }`;
    }

    return `${timestamp} [${level}]: ${message}${
      metaString ? `\nMeta: ${metaString}` : ""
    }`;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Always add console transport
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === "production" ? logFormat : consoleFormat,
  })
);

// Add file transports for production
if (process.env.NODE_ENV === "production") {
  // Error log file
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  // Combined log file
  transports.push(
    new winston.transports.File({
      filename: "logs/combined.log",
      format: logFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// Create the logger instance
const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  levels: logLevels,
  format: logFormat,
  transports,
  exitOnError: false,
});

// Enhanced logging interface with context support
interface LogContext {
  userId?: string;
  requestId?: string;
  scheduleId?: string;
  deviceId?: string;
  operation?: string;
  [key: string]: unknown;
}

class Logger {
  private context: LogContext = {};

  // Set context for subsequent log calls
  setContext(context: LogContext): Logger {
    const newLogger = new Logger();
    newLogger.context = { ...this.context, ...context };
    return newLogger;
  }

  // Clear context
  clearContext(): Logger {
    const newLogger = new Logger();
    newLogger.context = {};
    return newLogger;
  }

  private formatMessage(
    message: string,
    meta?: Record<string, unknown>
  ): [string, Record<string, unknown> | undefined] {
    const combinedMeta = { ...this.context, ...meta };
    return [
      message,
      Object.keys(combinedMeta).length > 0 ? combinedMeta : undefined,
    ];
  }

  error(message: string, meta?: Record<string, unknown>): void {
    const [formattedMessage, formattedMeta] = this.formatMessage(message, meta);
    logger.error(formattedMessage, formattedMeta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    const [formattedMessage, formattedMeta] = this.formatMessage(message, meta);
    logger.warn(formattedMessage, formattedMeta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    const [formattedMessage, formattedMeta] = this.formatMessage(message, meta);
    logger.info(formattedMessage, formattedMeta);
  }

  http(message: string, meta?: Record<string, unknown>): void {
    const [formattedMessage, formattedMeta] = this.formatMessage(message, meta);
    logger.http(formattedMessage, formattedMeta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    const [formattedMessage, formattedMeta] = this.formatMessage(message, meta);
    logger.debug(formattedMessage, formattedMeta);
  }

  // Convenience methods for common operations
  apiStart(operation: string, meta?: Record<string, unknown>): Logger {
    this.info(`Starting ${operation}`, meta);
    return this.setContext({ operation, ...meta });
  }

  apiEnd(operation: string, meta?: Record<string, unknown>): void {
    this.info(`Completed ${operation}`, meta);
  }

  apiError(
    operation: string,
    error: Error,
    meta?: Record<string, unknown>
  ): void {
    this.error(`Failed ${operation}`, {
      error: error.message,
      stack: error.stack,
      ...meta,
    });
  }

  // Thermostat-specific logging methods
  thermostatOperation(
    operation: string,
    meta?: Record<string, unknown>
  ): Logger {
    return this.setContext({ operation: `thermostat_${operation}`, ...meta });
  }

  scheduleProcessing(
    scheduleId: string,
    meta?: Record<string, unknown>
  ): Logger {
    return this.setContext({
      scheduleId,
      operation: "schedule_processing",
      ...meta,
    });
  }

  authOperation(operation: string, meta?: Record<string, unknown>): Logger {
    return this.setContext({ operation: `auth_${operation}`, ...meta });
  }
}

// Create and export the default logger instance
const defaultLogger = new Logger();

export { Logger, defaultLogger as logger };
export type { LogContext };
