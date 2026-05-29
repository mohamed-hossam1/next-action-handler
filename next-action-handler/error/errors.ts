export const ERROR_CODES = [
  "BAD_REQUEST",
  "VALIDATION_ERROR",

  "UNAUTHORIZED",
  "FORBIDDEN",

  "NOT_FOUND",

  "RATE_LIMITED",

  "DATABASE_ERROR",
  "INTERNAL_SERVER_ERROR",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export class ActionError extends Error {
  public readonly code: ErrorCode;
  public readonly expose: boolean;
  public readonly cause?: unknown;

  constructor({
    message,
    code,
    expose = true,
    cause,
  }: {
    message: string;
    code: ErrorCode;
    expose?: boolean;
    cause?: unknown;
  }) {
    super(message);

    this.name = new.target.name;

    this.code = code;
    this.expose = expose;
    this.cause = cause;

    Object.setPrototypeOf(this, new.target.prototype);

    Error.captureStackTrace?.(this, new.target);
  }
}

export class BadRequestError extends ActionError {
  constructor(message = "Bad request", cause?: unknown) {
    super({
      message,
      code: "BAD_REQUEST",
      cause,
    });
  }
}

export class ValidationError extends ActionError {
  public readonly fields?: Record<string, string[]>;

  constructor(
    message = "Invalid input",
    fields?: Record<string, string[]>,
    cause?: unknown,
  ) {
    super({
      message,
      code: "VALIDATION_ERROR",
      cause,
    });

    this.fields = fields;
  }
}

export class UnauthorizedError extends ActionError {
  constructor(message = "Unauthorized", cause?: unknown) {
    super({
      message,
      code: "UNAUTHORIZED",
      cause,
    });
  }
}

export class ForbiddenError extends ActionError {
  constructor(message = "Forbidden", cause?: unknown) {
    super({
      message,
      code: "FORBIDDEN",
      cause,
    });
  }
}

export class NotFoundError extends ActionError {
  constructor(message = "Resource not found", cause?: unknown) {
    super({
      message,
      code: "NOT_FOUND",
      cause,
    });
  }
}

export class RateLimitError extends ActionError {
  constructor(message = "Too many requests", cause?: unknown) {
    super({
      message,
      code: "RATE_LIMITED",
      cause,
    });
  }
}

export class DatabaseError extends ActionError {
  constructor(message = "Database operation failed", cause?: unknown) {
    super({
      message,
      code: "DATABASE_ERROR",
      expose: false,
      cause,
    });
  }
}

export class InternalServerError extends ActionError {
  constructor(message = "Something went wrong", cause?: unknown) {
    super({
      message,
      code: "INTERNAL_SERVER_ERROR",
      expose: false,
      cause,
    });
  }
}
