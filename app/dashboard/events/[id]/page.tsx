"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../lib/auth-context";
import { Shell } from "../../../components/shell";
import {
  getEvent,
  publishEvent,
  archiveEvent,
  getEventMetrics,
  Event,
  EventMetrics,
} from "../../../lib/events-api";
import { Skeleton } from "../../../components/skeleton";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiEdit,
  FiArchive,
  FiCheckCircle,
  FiArrowLeft,
  FiUserCheck,
  FiClipboard,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDateTime } from "../../../lib/date-utils";

function StatusBadge({ status }: { status: Event["status"] }) {
  const statusConfig = {
    draft: {
      label: "Draft",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    },
    published: {
      label: "Published",
      className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    },
    archived: {
      label: "Archived",
      className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    },
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// Helper to check if an ID is a valid event ID (CUID format)
function isValidEventId(id: string): boolean {
  // CUIDs are 25 characters, start with 'c', and contain alphanumeric characters
  // Basic validation: not "new" and looks like a CUID
  if (id === "new" || id === "edit") {
    return false;
  }
  // CUID format: starts with 'c' and is 25 characters
  return /^c[a-z0-9]{24}$/i.test(id);
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const eventId = params.id as string;
  const [activeTab, setActiveTab] = useState<"assignments" | "checkins">(
    "assignments"
  );

  // Redirect if "new" is treated as an ID
  useEffect(() => {
    if (eventId === "new" || !isValidEventId(eventId)) {
      router.push("/dashboard/events");
    }
  }, [eventId, router]);

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId),
    enabled: isAuthenticated && !!eventId && isValidEventId(eventId),
  });

  const {
    data: metrics,
    isLoading: metricsLoading,
  } = useQuery({
    queryKey: ["event", eventId, "metrics"],
    queryFn: () => getEventMetrics(eventId),
    enabled: isAuthenticated && !!eventId && isValidEventId(eventId),
  });

  const publishMutation = useMutation({
    mutationFn: () => publishEvent(eventId),
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(["event", eventId], updatedEvent);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events-stats"] });
      toast.success("Event published successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to publish event"
      );
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveEvent(eventId),
    onSuccess: (updatedEvent) => {
      queryClient.setQueryData(["event", eventId], updatedEvent);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events-stats"] });
      toast.success("Event archived successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to archive event"
      );
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }


  return (
    <Shell pageTitle={event?.title || "Event Details"}>
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <FiArrowLeft className="h-4 w-4" />
          <span>Back to Events</span>
        </Link>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
            <p className="text-sm text-red-800 dark:text-red-200">
              Failed to load event. Please try again later.
            </p>
          </div>
        ) : event ? (
          <>
            {/* Summary Header */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-foreground">
                      {event.title}
                    </h1>
                    <StatusBadge status={event.status} />
                  </div>
                  {event.description && (
                    <p className="text-muted-foreground">{event.description}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.status === "draft" && (
                    <button
                      onClick={() => publishMutation.mutate()}
                      disabled={publishMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiCheckCircle className="h-4 w-4" />
                      {publishMutation.isPending ? "Publishing..." : "Publish"}
                    </button>
                  )}
                  {event.status !== "archived" && (
                    <button
                      onClick={() => archiveMutation.mutate()}
                      disabled={archiveMutation.isPending}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background text-foreground font-medium rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiArchive className="h-4 w-4" />
                      {archiveMutation.isPending ? "Archiving..." : "Archive"}
                    </button>
                  )}
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-background text-foreground font-medium rounded-lg hover:bg-accent transition-colors"
                  >
                    <FiEdit className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>

              {/* Event Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-3">
                  <FiCalendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(event.startDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FiCalendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">End Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(event.endDate)}
                    </p>
                  </div>
                </div>
                {event.location && (
                  <div className="flex items-start gap-3">
                    <FiMapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}
                {event.capacity !== undefined && (
                  <div className="flex items-start gap-3">
                    <FiUsers className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Capacity</p>
                      <p className="text-sm text-muted-foreground">
                        {event.capacity} attendees
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Section */}
            {metricsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-6">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            ) : metrics ? (
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  Event Metrics
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Assignments
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.totalAssignments}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Check-ins
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.totalCheckIns}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">
                      Check-ins Today
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.checkInsToday}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm text-muted-foreground mb-1">
                      Roles Assigned
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {metrics.assignmentsByRole ? Object.keys(metrics.assignmentsByRole).length : 0}
                    </p>
                  </div>
                </div>
                {metrics.assignmentsByRole && Object.keys(metrics.assignmentsByRole).length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Assignments by Role
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {Object.entries(metrics.assignmentsByRole).map(
                        ([role, count]) => (
                          <div
                            key={role}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted"
                          >
                            <span className="text-sm text-foreground">
                              {role}
                            </span>
                            <span className="text-sm font-semibold text-foreground">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Tabs Section */}
            <div className="rounded-lg border border-border bg-card shadow-sm">
              {/* Tab Buttons */}
              <div className="border-b border-border">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveTab("assignments")}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "assignments"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <FiUserCheck className="h-4 w-4" />
                    Assignments
                  </button>
                  <button
                    onClick={() => setActiveTab("checkins")}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "checkins"
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <FiClipboard className="h-4 w-4" />
                    Check-ins
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === "assignments" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Event Assignments
                      </h3>
                      <Link
                        href={`/dashboard/events/${event.id}/assignments`}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        Manage Assignments →
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      View and manage staff assignments for this event.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">
                        Event Check-ins
                      </h3>
                      <Link
                        href={`/dashboard/events/${event.id}/checkins`}
                        className="text-sm text-primary hover:text-primary/80 font-medium"
                      >
                        View Check-ins →
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Track attendee check-ins for this event.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Shell>
  );
}

