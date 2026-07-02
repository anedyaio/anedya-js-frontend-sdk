import {
  AnedyaError,
  AuthenticationError,
  NetworkError,
  NotFoundError,
  BadRequestError,
  ServerError,
} from "./errors";

interface _AnedyaErrorResponseBody {
  success: boolean;
  error: string;
  reasonCode: string;
  errorcode?: number;
}

/**
 * Validates the response from the Anedya API.
 * If the response is not successful (either non-2xx status or success: false in body),
 * it throws an appropriate AnedyaError.
 *
 * @param response - The Fetch API Response object.
 * @throws {AnedyaError} or one of its subclasses.
 */
export async function validateResponse(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  let errorBody: _AnedyaErrorResponseBody | null = null;

  try {
    // Try to parse the response body as JSON to get more granular error information
    errorBody = await response.json();
  } catch (e) {
    // If parsing fails, errorBody remains null, and we fall back to status-based error mapping
  }

  if (errorBody && errorBody.success === false) {
    throw new AnedyaError(
      errorBody.error,
      errorBody.reasonCode,
      response.status
    );
  }

  // Fallback to status-based error mapping if no specific error body was found or parsed
  if (response.status === 401 || response.status === 403) {
    throw new AuthenticationError("Unauthorized access", "UNAUTHORIZED", response.status);
  }
  if (response.status === 404) {
    throw new NotFoundError("Resource not found", "NOT_FOUND", response.status);
  }
  if (response.status === 400) {
    throw new BadRequestError("Bad request", "BAD_REQUEST", response.status);
  }
  if (response.status >= 500) {
    throw new ServerError("Server error", "SERVER_ERROR", response.status);
  }
  throw new NetworkError(`Request failed with status ${response.status}`, response.status);
}
