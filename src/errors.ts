/**
 * Base class for all Anedya errors.
 */
export class AnedyaError extends Error {
  constructor(
    public message: string,
    public reasonCode: string = "UNKNOWN_ERROR",
    public httpStatus?: number,
  ) {
    super(message);
    this.name = "AnedyaError";
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AnedyaError);
    }
  }
}

/**
 * Error codes for Anedya errors.
 */
export const AnedyaErrorCodes = {
  Success: -1,
  Unknown: 0,
  Failure: 1,
  HttpRequestError: 3,
  HttpRequestTimeout: 4,
  KeyNotFound: 5,
} as const;

/**
 * Error thrown when authentication fails (e.g., invalid token, unauthorized).
 */
export class AuthenticationError extends AnedyaError {
  constructor(
    message: string,
    reasonCode: string = "UNAUTHORIZED",
    httpStatus: number = 401,
  ) {
    super(message, reasonCode, httpStatus);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown when a network issue occurs (e.g., timeout, connectivity).
 */
export class NetworkError extends AnedyaError {
  constructor(message: string, httpStatus?: number) {
    super(message, "NETWORK_ERROR", httpStatus);
    this.name = "NetworkError";
  }
}

/**
 * Error thrown when a requested resource is not found (e.g., node not found, variable not found).
 */
export class NotFoundError extends AnedyaError {
  constructor(
    message: string,
    reasonCode: string = "NOT_FOUND",
    httpStatus: number = 404,
  ) {
    super(message, reasonCode, httpStatus);
    this.name = "NotFoundError";
  }
}

/**
 * Error thrown for client-side errors (e.g., bad request parameters).
 */
export class BadRequestError extends AnedyaError {
  constructor(
    message: string,
    reasonCode: string = "BAD_REQUEST",
    httpStatus: number = 400,
  ) {
    super(message, reasonCode, httpStatus);
    this.name = "BadRequestError";
  }
}

/**
 * Error thrown for server-side errors (e.g., 5xx status codes).
 */
export class ServerError extends AnedyaError {
  constructor(
    message: string,
    reasonCode: string = "SERVER_ERROR",
    httpStatus: number = 500,
  ) {
    super(message, reasonCode, httpStatus);
    this.name = "ServerError";
  }
}

/**
 * Enum for common error reasons used in messages.
 */
export enum ErrorReason {
  ACCESS_DENIED = "auth::accessdenied",
  INVALID_SIGNATURE = "INVALID_SIGNATURE",
  UNAUTHORIZED = "UNAUTHORIZED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  NODE_NOT_FOUND = "NODE_NOT_FOUND",
  VARIABLE_NOT_FOUND = "VARIABLE_NOT_FOUND",
  BAD_REQUEST = "BAD_REQUEST",
  SERVER_ERROR = "SERVER_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}
