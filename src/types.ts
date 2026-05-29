import type { ErrorCode } from "./error/errors";

export type PublicServerError = {
  code: ErrorCode;
  message: string;
};

export type NormalizedError = {
  code: ErrorCode;
  message: string;
  expose: boolean;
  cause?: unknown;
  stack?: string;
};
