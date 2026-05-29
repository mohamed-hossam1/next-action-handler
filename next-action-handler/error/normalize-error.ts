import { ActionError, InternalServerError } from "./errors";

import type { NormalizedError } from "../types";

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ActionError) {
    return {
      code: error.code,
      message: error.message,
      expose: error.expose,

      cause: error.cause,
      stack: error.stack,
    };
  }

  const internalError = new InternalServerError("Something went wrong", error);

  return {
    code: internalError.code,
    message: internalError.message,
    expose: internalError.expose,

    cause: error,
    stack: error instanceof Error ? error.stack : undefined,
  };
}
