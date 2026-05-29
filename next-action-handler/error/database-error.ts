import { DatabaseError } from "./errors";

export function toDatabaseError(
  error: unknown,
  message = "Database operation failed",
): DatabaseError {
  return new DatabaseError(message, error);
}

// use for catch database error

// throw toDatabaseError(
//     error,
//     "Failed to create user",
//   );