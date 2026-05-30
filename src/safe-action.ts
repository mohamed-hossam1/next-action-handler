import "server-only";

import z from "zod";

import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

import { logActionError, logActionExecution } from "./log/logger";

import { normalizeError } from "./error/normalize-error";
import { InternalServerError } from "./error/errors";
import { requireUser } from "../auth-helpers";

const OUTPUT_VALIDATION_SERVER_ERROR_MESSAGE =
  "Unexpected response. Please try again.";

function isActionOutputDataValidationError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    (error.name === "ActionOutputDataValidationError" ||
      error.constructor?.name === "ActionOutputDataValidationError")
  );
}

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () =>
    z.object({
      actionName: z.string(),
    }),

  handleServerError(error, ctx) {
    if (isActionOutputDataValidationError(error)) {
      const normalized = normalizeError(
        new InternalServerError("Action output validation failed", error),
      );

      logActionError({
        action: ctx.metadata.actionName,
        error: normalized,
      });

      return {
        code: normalized.code,
        message: OUTPUT_VALIDATION_SERVER_ERROR_MESSAGE,
      };
    }

    const normalized = normalizeError(error);

    logActionError({
      action: ctx.metadata.actionName,
      error: normalized,
    });

    return {
      code: normalized.code,

      message: normalized.expose
        ? normalized.message
        : DEFAULT_SERVER_ERROR_MESSAGE,
    };
  },
}).use(async ({ next, metadata }) => {
  const startedAt = Date.now();

  const result = await next();

  if (!result.serverError) {
    logActionExecution({
      action: metadata.actionName,
      durationMs: Date.now() - startedAt,
    });
  }

  return result;
});

export const authedActionClient = actionClient.use(async ({ next }) => {
  const user = await requireUser();
  return next({ ctx: { user } });
});
