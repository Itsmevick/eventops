import { apiClient } from "./api-client";

export interface CheckIn {
  id: string;
  eventId: string;
  userId: string;
  checkedInAt: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export interface CreateCheckInData {
  userId: string;
}

/**
 * Get check-ins for an event
 */
export async function getCheckIns(eventId: string): Promise<CheckIn[]> {
  const response = await apiClient.get<CheckIn[]>(
    `/api/events/${eventId}/checkins`
  );
  return response.data;
}

/**
 * Create a check-in
 */
export async function createCheckIn(
  eventId: string,
  data: CreateCheckInData
): Promise<CheckIn> {
  const response = await apiClient.post<CheckIn>(
    `/api/events/${eventId}/checkins`,
    data
  );
  return response.data;
}

