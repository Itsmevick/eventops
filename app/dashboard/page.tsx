"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../lib/auth-context";
import { Shell } from "../components/shell";
import { StatCard } from "../components/stat-card";
import { StatCardSkeleton } from "../components/skeleton";
import { getEventsStats } from "../lib/events-api";
import { CreateEventModal } from "../components/create-event-modal";
import { createEvent, CreateEventData } from "../lib/events-api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FiCalendar, FiCheckCircle, FiClock } from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);
  
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events-stats"],
    queryFn: getEventsStats,
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateEventData) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["events-stats"] });
      toast.success("Event created successfully");
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to create event. Please try again.";
      toast.error(errorMessage);
    },
  });

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <Shell pageTitle="Dashboard">
      <div className="space-y-6">
        {/* Overview Cards */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            ) : error ? (
              <div className="col-span-full rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Failed to load statistics. Please try again later.
                </p>
              </div>
            ) : (
              <>
                <StatCard
                  title="Total Events"
                  value={stats?.total ?? 0}
                  icon={<FiCalendar className="h-6 w-6" />}
                  description="All events in the system"
                />
                <StatCard
                  title="Published Events"
                  value={stats?.published ?? 0}
                  icon={<FiCheckCircle className="h-6 w-6" />}
                  description="Events currently published"
                />
                <StatCard
                  title="Upcoming Events"
                  value={stats?.upcoming ?? 0}
                  icon={<FiClock className="h-6 w-6" />}
                  description="Events scheduled in the future"
                />
              </>
            )}
          </div>
        </div>

        {/* Additional Content Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiCalendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    New event created
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FiCheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Event published
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 hours ago
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Create New Event
              </button>
              <Link
                href="/dashboard/events"
                className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                View All Events
              </Link>
              <Link
                href="/dashboard/settings"
                className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Manage Settings
              </Link>
            </div>
          </div>
        </div>

        {/* Create Event Modal */}
        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            await createMutation.mutateAsync(data);
          }}
        />
      </div>
    </Shell>
  );
}

