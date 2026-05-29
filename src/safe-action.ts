import "server-only";

import z from "zod";

import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";

import { logActionError, logActionExecution } from "./log/logger";

import { normalizeError } from "./error/normalize-error";
import { requireUser } from "../auth-helpers";

export const actionClient = createSafeActionClient({
  defineMetadataSchema: () =>
    z.object({
      actionName: z.string(),
    }),

  handleServerError(error, ctx) {
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
