// Token storage in memory (for SSR safety)
let tokenInMemory: string | null = null;
let userInMemory: any | null = null;

const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

/**
 * Get token from memory (preferred) or localStorage
 */
export function getToken(): string | null {
  if (typeof window === "undefined") {
    return tokenInMemory;
  }
  
  // Return from memory if available, otherwise from localStorage
  if (tokenInMemory) {
    return tokenInMemory;
  }
  
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) {
    tokenInMemory = stored;
  }
  return stored;
}

/**
 * Store token in both memory and localStorage
 */
export function setToken(token: string): void {
  tokenInMemory = token;
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get user from memory or localStorage
 */
export function getUser(): any | null {
  if (typeof window === "undefined") {
    return userInMemory;
  }
  
  if (userInMemory) {
    return userInMemory;
  }
  
  const stored = localStorage.getItem(USER_KEY);
  if (stored) {
    try {
      userInMemory = JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return userInMemory;
}

/**
 * Store user in both memory and localStorage
 */
export function setUser(user: any): void {
  userInMemory = user;
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

/**
 * Clear both token and user from memory and localStorage
 */
export function clearToken(): void {
  tokenInMemory = null;
  userInMemory = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

