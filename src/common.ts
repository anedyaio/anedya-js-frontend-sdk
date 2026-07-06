/*
Manage all common interfaces
*/
export interface IConfigHeaders {
  tokenId: string;
  tokenBytes: Uint8Array;
  signatureVersion: string;
  signatureVersionBytes: Uint8Array;
  authorizationMode: string;
}

export interface _ITimeSeriesData {
  [key: string]: object[]; // Adjust `object` to the exact type of elements in the array if possible
}

export interface _IError {
  errorMessage: string;
  reasonCode: string;
}

/**
 * Retries a function with exponential backoff.
 *
 * @param fn - The function to retry.
 * @param retries - Maximum number of retries.
 * @param delay - Initial delay in milliseconds.
 * @param retryableErrors - Array of error classes that should trigger a retry.
 * @returns The result of the function.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  retryableErrors: Array<new (...args: any[]) => Error> = [Error],
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const isRetryable = retryableErrors.some(
      (ErrorClass) => error instanceof ErrorClass,
    );
    if (retries <= 0 || !isRetryable) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 2, retryableErrors);
  }
}
