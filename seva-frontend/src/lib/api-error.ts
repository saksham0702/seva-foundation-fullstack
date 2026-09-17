import type { AxiosError } from "axios";

interface BackendError {
  success: boolean;
  message?: string;
  error?: string | { message?: string };
}

/**
 * Extracts a human-readable error message from an Axios error.
 * Falls back to `fallback` if nothing usable is found.
 *
 * Backend error shapes handled:
 *  { message: "..." }
 *  { error: "..." }
 *  { error: { message: "..." } }
 */
export function extractErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  const axiosError = err as AxiosError<BackendError>;

  if (axiosError?.response?.data) {
    const data = axiosError.response.data;

    if (typeof data.message === "string" && data.message) return data.message;

    if (typeof data.error === "string" && data.error) return data.error;

    if (typeof data.error === "object" && data.error?.message)
      return data.error.message;
  }

  if (axiosError?.message) return axiosError.message;

  return fallback;
}
