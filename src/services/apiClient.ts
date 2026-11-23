//FEATURE: Central HTTP Client & Fetch Wrapper
//Builds the base URL from NEXT_PUBLIC_API_URL (default http://localhost:4000/api/v1)and sends every request as JSON.
//Handles errors in one place: failed requests throw an `ApiError` with a clear message, the HTTP status, and a flag for network failures (server unreachable).Pages show these messages in an error box with a "Try again" button.

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

/**
 * Error thrown for every failed API call, so pages can show a clear message.
 * - `status` is the HTTP status code (0 when the server could not be reached).
 * - `isNetworkError` is true when the request never reached the backend.
 */
export class ApiError extends Error {
  status: number;
  isNetworkError: boolean;

  constructor(message: string, status: number, isNetworkError = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetworkError = isNetworkError;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options?.headers,
      },
    });
  } catch {
    // fetch only rejects when the request could not be made (server down, offline, CORS, ...)
    throw new ApiError(
      "Cannot reach the server. Please check that the backend is running and try again.",
      0,
      true
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody?.message === "string") {
        errorMessage = errorBody.message;
      }
    } catch {
      // Ignore non-json responses
    }
    throw new ApiError(errorMessage, response.status);
  }

  // Some responses (for example 204 No Content) have no body.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
