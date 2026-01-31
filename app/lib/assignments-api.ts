import { apiClient } from "./api-client";

export interface Assignment {
  id: string;
  eventId: string;
  userId: string;
  roleName: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentData {
  userId: string;
  roleName: string;
}

/**
 * Get assignments for an event
 */
export async function getAssignments(eventId: string): Promise<Assignment[]> {
  const response = await apiClient.get<Assignment[]>(
    `/api/events/${eventId}/assignments`
  );
  return response.data;
}

/**
 * Create an assignment
 */
export async function createAssignment(
  eventId: string,
  data: CreateAssignmentData
): Promise<Assignment> {
  const response = await apiClient.post<Assignment>(
    `/api/events/${eventId}/assignments`,
    data
  );
  return response.data;
}

/**
 * Delete an assignment
 */
export async function deleteAssignment(
  eventId: string,
  assignmentId: string
): Promise<void> {
  await apiClient.delete(`/api/events/${eventId}/assignments/${assignmentId}`);
}

