import { apiClient } from "./api-client";

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: "draft" | "published" | "cancelled" | "archived";
  location?: string;
  capacity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventsStats {
  total: number;
  published: number;
  upcoming: number;
}

export interface EventMetrics {
  totalAssignments: number;
  totalCheckIns: number;
  assignmentsByRole: Record<string, number>;
  checkInsToday: number;
}

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
  const response = await apiClient.get<{ data: any[] }>("/api/events");
  const backendEvents = response.data.data || response.data;
  
  // Transform backend format to frontend format
  return (Array.isArray(backendEvents) ? backendEvents : []).map((backendEvent) => ({
    id: backendEvent.id,
    title: backendEvent.title,
    description: backendEvent.description,
    startDate: backendEvent.startAt || backendEvent.startDate,
    endDate: backendEvent.endAt || backendEvent.endDate,
    status: (backendEvent.status?.toLowerCase() || "draft") as Event["status"],
    location: backendEvent.venue || backendEvent.location,
    capacity: backendEvent.capacity,
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
  }));
}

/**
 * Get events statistics
 */
export async function getEventsStats(): Promise<EventsStats> {
  const response = await apiClient.get<{ data: EventsStats }>("/api/events/stats");
  const backendStats = response.data.data || response.data;
  return {
    total: backendStats.total || 0,
    published: backendStats.published || 0,
    upcoming: backendStats.upcoming || 0,
  };
}

/**
 * Get a single event by ID
 */
export async function getEvent(id: string): Promise<Event> {
  const response = await apiClient.get<{ data: any }>(`/api/events/${id}`);
  const backendEvent = response.data.data || response.data;
  
  // Transform backend format to frontend format
  return {
    id: backendEvent.id,
    title: backendEvent.title,
    description: backendEvent.description,
    startDate: backendEvent.startAt || backendEvent.startDate,
    endDate: backendEvent.endAt || backendEvent.endDate,
    status: (backendEvent.status?.toLowerCase() || "draft") as Event["status"],
    location: backendEvent.venue || backendEvent.location,
    capacity: backendEvent.capacity,
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
  };
}

/**
 * Publish an event
 */
export async function publishEvent(id: string): Promise<Event> {
  const response = await apiClient.patch<{ data: any }>(`/api/events/${id}/publish`);
  const backendEvent = response.data.data || response.data;
  
  // Transform backend format to frontend format
  return {
    id: backendEvent.id,
    title: backendEvent.title,
    description: backendEvent.description,
    startDate: backendEvent.startAt || backendEvent.startDate,
    endDate: backendEvent.endAt || backendEvent.endDate,
    status: (backendEvent.status?.toLowerCase() || "draft") as Event["status"],
    location: backendEvent.venue || backendEvent.location,
    capacity: backendEvent.capacity,
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
  };
}

/**
 * Archive an event
 */
export async function archiveEvent(id: string): Promise<Event> {
  const response = await apiClient.patch<{ data: any }>(`/api/events/${id}/archive`);
  const backendEvent = response.data.data || response.data;
  
  // Transform backend format to frontend format
  return {
    id: backendEvent.id,
    title: backendEvent.title,
    description: backendEvent.description,
    startDate: backendEvent.startAt || backendEvent.startDate,
    endDate: backendEvent.endAt || backendEvent.endDate,
    status: (backendEvent.status?.toLowerCase() || "draft") as Event["status"],
    location: backendEvent.venue || backendEvent.location,
    capacity: backendEvent.capacity,
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
  };
}

/**
 * Get event metrics
 */
export async function getEventMetrics(id: string): Promise<EventMetrics> {
  const response = await apiClient.get<{ data: any }>(`/api/events/${id}/metrics`);
  const backendMetrics = response.data.data || response.data;
  
  // Ensure assignmentsByRole is always an object
  return {
    totalAssignments: backendMetrics.totalAssignments || 0,
    totalCheckIns: backendMetrics.totalCheckIns || 0,
    assignmentsByRole: backendMetrics.assignmentsByRole || {},
    checkInsToday: backendMetrics.checkInsToday || 0,
  };
}

export interface CreateEventData {
  title: string;
  description?: string | null;
  venue?: string | null;
  startAt: string; // ISO datetime string
  endAt: string; // ISO datetime string
  capacity?: number;
}

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventData): Promise<Event> {
  const response = await apiClient.post<{ data: any }>("/api/events", data);
  const backendEvent = response.data.data;
  
  // Transform backend format (startAt/endAt/venue/uppercase status) to frontend format
  return {
    id: backendEvent.id,
    title: backendEvent.title,
    description: backendEvent.description,
    startDate: backendEvent.startAt,
    endDate: backendEvent.endAt,
    status: backendEvent.status.toLowerCase() as Event["status"],
    location: backendEvent.venue,
    capacity: backendEvent.capacity,
    createdAt: backendEvent.createdAt,
    updatedAt: backendEvent.updatedAt,
  };
}

