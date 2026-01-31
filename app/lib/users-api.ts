import { apiClient } from "./api-client";

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get<{ data: any[] }>("/api/users");
  const backendUsers = response.data.data || response.data;
  
  // Transform backend format to frontend format
  return (Array.isArray(backendUsers) ? backendUsers : []).map((backendUser) => ({
    id: backendUser.id,
    email: backendUser.email,
    name: backendUser.name,
    role: backendUser.role,
    createdAt: backendUser.createdAt,
  }));
}

