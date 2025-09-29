export const AnedyaError = {
  Success: -1,
  Unknown: 0,
  Failure: 1,
  HttpRequestError: 3,
  HttpRequestTimeout: 4,
  keyNotFound: 5,
} as const;


// ------------------------------ Error Handling Enums -----------------------------

/**
 * Common error codes returned by Anedya API responses.
 * Use these enums instead of hardcoding strings.
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

/**
 * HTTP error codes that might be returned by fetch().
 */
export enum HttpError {
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}