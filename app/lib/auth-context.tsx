"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getToken, getUser, setToken, setUser, clearToken } from "./auth-storage";
import { login as loginApi, logout as logoutApi, getMe, User, LoginCredentials } from "./auth-api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      const storedUser = getUser();

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUserState(storedUser);

        // Optionally verify token is still valid by fetching user
        try {
          const freshUser = await getMe();
          setUserState(freshUser);
        } catch (error) {
          // Token is invalid, clear it
          clearToken();
          setTokenState(null);
          setUserState(null);
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await loginApi(email, password);
      setTokenState(response.accessToken);
      setUserState(response.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    logoutApi();
    setTokenState(null);
    setUserState(null);
    
    // Redirect to login page
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await getMe();
      setUserState(freshUser);
    } catch (error) {
      // If fetch fails, user might be logged out
      clearToken();
      setTokenState(null);
      setUserState(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

