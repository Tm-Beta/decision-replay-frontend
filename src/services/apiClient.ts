// FEATURE: Central HTTP Client & Fetch Wrapper

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;
}

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

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("decision-replay-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.state?.token || null;
  } catch {
    return null;
  }
}

async function handleFailedResponse(
  response: Response,
  endpoint: string,
  hadToken: boolean
): Promise<never> {
  if (response.status === 401 && hadToken && !endpoint.startsWith("/auth/google")) {
    unauthorizedHandler?.();
  }
  throw new ApiError(await parseErrorMessage(response), response.status);
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = getStoredToken();
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

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
    throw new ApiError(
      "Cannot reach the server. Please check that the backend is running and try again.",
      0,
      true
    );
  }

  if (!response.ok) {
    await handleFailedResponse(response, endpoint, Boolean(token));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function parseErrorMessage(response: Response): Promise<string> {
  let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
  try {
    const errorBody = await response.json();
    if (typeof errorBody?.detail === "string") {
      errorMessage = errorBody.detail;
    } else if (typeof errorBody?.message === "string") {
      errorMessage = errorBody.message;
    }
  } catch {
    // Ignore non-json responses
  }
  return errorMessage;
}

export async function downloadProtectedFile(
  endpoint: string
): Promise<{ blob: Blob; fileName: string | null }> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {};
  const token = getStoredToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, { method: "GET", headers });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Please check that the backend is running and try again.",
      0,
      true
    );
  }

  if (!response.ok) {
    await handleFailedResponse(response, endpoint, Boolean(token));
  }

  const disposition = response.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);
  const blob = await response.blob();
  return { blob, fileName: match?.[1] ?? null };
}

export async function uploadProtectedBinary<T>(
  endpoint: string,
  file: Blob
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/octet-stream",
  };
  const token = getStoredToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers,
      body: file,
    });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Please check that the backend is running and try again.",
      0,
      true
    );
  }

  if (!response.ok) {
    await handleFailedResponse(response, endpoint, Boolean(token));
  }

  return response.json() as Promise<T>;
}
