import { apiClient } from "./api-client";
import { setToken, setUser, clearToken } from "./auth-storage";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    [key: string]: any;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;
  [key: string]: any;
}

/**
 * Register a new user
 */
export async function register(
  name: string,
  email: string,
  password: string
): Promise<User> {
  try {
    const response = await apiClient.post<User>("/api/auth/register", {
      name,
      email,
      password,
    });

    // Registration returns user object directly (no token yet)
    // User needs to login after registration
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

/**
 * Login with email and password
 * Stores token and user in memory + localStorage
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  try {
    const response = await apiClient.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });

    const { accessToken, user } = response.data;

    // Store token and user
    setToken(accessToken);
    setUser(user);

    return response.data;
  } catch (error: any) {
    // Re-throw with more context if needed
    throw error;
  }
}

/**
 * Logout - clears token and user from storage
 * Note: Does not redirect - let the caller handle navigation
 */
export function logout(): void {
  clearToken();
}

/**
 * Get current user from /api/auth/me
 */
export async function getMe(): Promise<User> {
  try {
    const response = await apiClient.get<User>("/api/auth/me");
    const user = response.data;
    
    // Update stored user
    setUser(user);
    
    return user;
  } catch (error: any) {
    // If 401, token is invalid, clear it
    if (error.response?.status === 401) {
      clearToken();
    }
    throw error;
  }
}
