"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../lib/auth-context";
import { Shell } from "../../../../components/shell";
import {
  getCheckIns,
  createCheckIn,
  CheckIn,
  CreateCheckInData,
} from "../../../../lib/checkins-api";
import { getUsers } from "../../../../lib/users-api";
import { getEvent } from "../../../../lib/events-api";
import { Skeleton } from "../../../../components/skeleton";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiUser,
  FiClock,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDateTime } from "../../../../lib/date-utils";

export default function CheckInsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const eventId = params.id as string;
  const [formData, setFormData] = useState<CreateCheckInData>({
    userId: "",
  });

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId),
    enabled: isAuthenticated && !!eventId,
  });

  const {
    data: checkIns,
    isLoading: checkInsLoading,
    error: checkInsError,
  } = useQuery({
    queryKey: ["checkins", eventId],
    queryFn: () => getCheckIns(eventId),
    enabled: isAuthenticated && !!eventId,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCheckInData) => createCheckIn(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId, "metrics"] });
      setFormData({ userId: "" });
      toast.success("Check-in recorded successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to record check-in"
      );
    },
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userId) {
      toast.error("Please select a user");
      return;
    }
    createMutation.mutate(formData);
  };

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
    <Shell pageTitle={`Check-ins - ${event?.title || "Event"}`}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/dashboard/events/${eventId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <FiArrowLeft className="h-4 w-4" />
            <span>Back to Event</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Check-ins</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record and view staff check-ins for this event
          </p>
        </div>

        {/* Check-in Form */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Record Check-in
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Staff Member
              </label>
              <select
                id="userId"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select a staff member</option>
                {users?.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} {user.email !== user.name ? `(${user.email})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiCheckCircle className="h-5 w-5" />
              {createMutation.isPending ? "Recording..." : "Record Check-in"}
            </button>
          </form>
        </div>

        {/* Check-ins List */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Check-in History
          </h2>
          {checkInsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-border bg-card p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : checkInsError ? (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
              <p className="text-sm text-red-800 dark:text-red-200">
                Failed to load check-ins. Please try again later.
              </p>
            </div>
          ) : checkIns && checkIns.length > 0 ? (
            <div className="space-y-4">
              {checkIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="rounded-lg border border-border bg-card p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <FiCheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {checkIn.user?.name || checkIn.user?.email || "Unknown User"}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <FiClock className="h-4 w-4" />
                          <span>{formatDateTime(checkIn.checkedInAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FiCheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No check-ins yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Start recording check-ins using the form above
              </p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}

