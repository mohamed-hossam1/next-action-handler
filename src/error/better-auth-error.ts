import { isAPIError } from "better-auth/api";

import {
  BadRequestError,
  InternalServerError,
  UnauthorizedError,
  type ActionError,
} from "./errors";

type BetterAuthApiError = {
  message?: string;
  statusCode?: number;
};

type BetterAuthErrorOptions = {
  enumerationSafe?: boolean;
  genericMessage?: string;
};

export function fromBetterAuthError(
  error: unknown,
  options: BetterAuthErrorOptions = {},
): ActionError {
  if (!isAPIError(error)) {
    return new InternalServerError(
      options.genericMessage ?? "Something went wrong",
      error,
    );
  }

  const apiError = error as BetterAuthApiError;

  const message = options.enumerationSafe
    ? (options.genericMessage ?? "Invalid credentials")
    : (apiError.message ?? "Something went wrong");

  switch (apiError.statusCode) {
    case 400:
      return new BadRequestError(message, error);

    case 401:
      return new UnauthorizedError(message, error);

    default:
      return new InternalServerError(message, error);
  }
}

// use for catch better auth error

// throw fromBetterAuthError(
//     error,
//     {
//       enumerationSafe: true,
//       genericMessage: "Invalid credentials",
//     },
//   );