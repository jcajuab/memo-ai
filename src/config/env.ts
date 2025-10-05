/**
 * Environment configuration for the application
 */

// Default to localhost for development
const DEFAULT_API_BASE_URL = "https://memo.ojou.de";

// Regex for removing trailing slash (defined at top level for performance)
const TRAILING_SLASH_REGEX = /\/$/;

/**
 * Get the API base URL from environment variables or use default
 */
function getApiBaseUrl(): string {
  // Check for environment variable (works in both client and server)
  if (typeof window !== "undefined") {
    // Client-side: Check for runtime config or build-time env
    return (
      (window as { __API_BASE_URL__?: string }).__API_BASE_URL__ ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      DEFAULT_API_BASE_URL
    );
  }

  // Server-side: Check for server env variables
  return (
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL
  );
}

/**
 * Environment configuration object
 */
export const env = {
  /**
   * Base URL for API endpoints
   * Can be overridden with NEXT_PUBLIC_API_BASE_URL environment variable
   * Examples: "http://localhost:3000", "https://memo.ojou.de"
   */
  API_BASE_URL: getApiBaseUrl(),

  /**
   * Build the full URL for an API endpoint
   */
  apiUrl: (path: string): string => {
    const baseUrl = env.API_BASE_URL.replace(TRAILING_SLASH_REGEX, ""); // Remove trailing slash
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${baseUrl}${cleanPath}`;
  },
} as const;
