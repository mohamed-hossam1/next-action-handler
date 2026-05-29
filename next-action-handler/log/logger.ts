import { ERROR_LOG_LEVEL, logger } from "./logger-config";
import type { NormalizedError } from "../types";

type BaseLogOptions = {
  action: string;
};

type LogMeta = Record<string, unknown>;

type ActionLogMessageOptions = BaseLogOptions & {
  message: string;
  meta?: LogMeta;
};

type ActionExecutionLogOptions = BaseLogOptions & {
  durationMs: number;
  message?: string;
  meta?: LogMeta;
};

type ActionErrorLogOptions = BaseLogOptions & {
  error: NormalizedError;
};

export function logWarn({ action, message, meta }: ActionLogMessageOptions) {
  logger.warn(
    {
      action,
      ...meta,
    },
    message,
  );
}

export function logError({ action, message, meta }: ActionLogMessageOptions) {
  logger.error(
    {
      action,
      ...meta,
    },
    message,
  );
}

export function logInfo({
  action,
  message,
  durationMs,
  meta,
}: ActionExecutionLogOptions) {
  logger.info(
    {
      action,
      durationMs,
      ...meta,
    },
    message,
  );
}

export function logActionExecution({
  action,
  durationMs,
  message = "Action executed successfully",
  meta,
}: ActionExecutionLogOptions) {
  logInfo({
    action,
    durationMs,
    message,
    meta,
  });
}

export function logActionError({ action, error }: ActionErrorLogOptions) {
  const level = ERROR_LOG_LEVEL[error.code];

  const logMeta = {
    errorCode: error.code,

    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,

    cause:
      error.cause instanceof Error
        ? {
            name: error.cause.name,
            message: error.cause.message,
            stack:
              process.env.NODE_ENV === "development"
                ? error.cause.stack
                : undefined,
          }
        : error.cause,
  };

  const payload = {
    action,
    ...logMeta,
  };

  if (level === "error") {
    logger.error(payload, error.message);
    return;
  }

  logger.warn(payload, error.message);
}
