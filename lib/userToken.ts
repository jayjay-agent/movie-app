/**
 * Anonymous user token for Personalization and Insights continuity.
 *
 * Persisted in localStorage for the lifetime of the browser. No cookies,
 * no server state. Clearing browser storage resets the profile.
 */

const STORAGE_KEY = "movies-demo-user-token";

function newToken(): string {
  return `anon-${crypto.randomUUID()}`;
}

/**
 * Returns the current user token, generating + persisting one on first call.
 *
 * SSR-safe: returns `null` on the server. Callers must handle the null case
 * (typically by skipping Insights init until the client mounts).
 */
export function getOrCreateUserToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const token = newToken();
    window.localStorage.setItem(STORAGE_KEY, token);
    return token;
  } catch {
    return newToken();
  }
}

/**
 * Rotates the token, effectively starting a fresh Personalization profile
 * from the client's perspective. Historical events on Algolia's side persist
 * under the old token until they age out.
 */
export function resetUserToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = newToken();
  try {
    window.localStorage.setItem(STORAGE_KEY, token);
  } catch {
    /* ignore */
  }
  return token;
}
