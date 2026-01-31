"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../../../lib/auth-context";
import { Shell } from "../../../../components/shell";
import {
  getAssignments,
  createAssignment,
  deleteAssignment,
  Assignment,
  CreateAssignmentData,
} from "../../../../lib/assignments-api";
import { getUsers } from "../../../../lib/users-api";
import { getEvent } from "../../../../lib/events-api";
import { Skeleton } from "../../../../components/skeleton";
import {
  FiArrowLeft,
  FiUserPlus,
  FiTrash2,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatDateTime } from "../../../../lib/date-utils";

const ROLE_OPTIONS = [
  "Event Manager",
  "Staff",
  "Volunteer",
  "Security",
  "Photographer",
  "Other",
];

export default function AssignmentsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const eventId = params.id as string;
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<CreateAssignmentData>({
    userId: "",
    roleName: "",
  });

  const { data: event } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId),
    enabled: isAuthenticated && !!eventId,
  });

  const {
    data: assignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
  } = useQuery({
    queryKey: ["assignments", eventId],
    queryFn: () => getAssignments(eventId),
    enabled: isAuthenticated && !!eventId,
  });

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAssignmentData) =>
      createAssignment(eventId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId, "metrics"] });
      setFormData({ userId: "", roleName: "" });
      setShowCreateForm(false);
      toast.success("Assignment created successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create assignment"
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (assignmentId: string) => deleteAssignment(eventId, assignmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments", eventId] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId, "metrics"] });
      toast.success("Assignment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to delete assignment"
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
    if (!formData.userId || !formData.roleName) {
      toast.error("Please fill in all fields");
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
    <Shell pageTitle={`Assignments - ${event?.title || "Event"}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href={`/dashboard/events/${eventId}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <FiArrowLeft className="h-4 w-4" />
              <span>Back to Event</span>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage staff assignments for this event
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <FiUserPlus className="h-5 w-5" />
            <span>Add Assignment</span>
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Create Assignment
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="userId"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  User
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
                  <option value="">Select a user</option>
                  {users?.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email} {user.email !== user.name ? `(${user.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="roleName"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Role
                </label>
                <select
                  id="roleName"
                  value={formData.roleName}
                  onChange={(e) =>
                    setFormData({ ...formData, roleName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="">Select a role</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Creating..." : "Create Assignment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({ userId: "", roleName: "" });
                  }}
                  className="px-4 py-2 border border-border bg-background text-foreground font-medium rounded-lg hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Assignments List */}
        {assignmentsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : assignmentsError ? (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
            <p className="text-sm text-red-800 dark:text-red-200">
              Failed to load assignments. Please try again later.
            </p>
          </div>
        ) : assignments && assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FiUser className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold text-foreground">
                        {assignment.user?.name || assignment.user?.email || "Unknown User"}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <FiBriefcase className="h-4 w-4" />
                        <span>{assignment.roleName}</span>
                      </div>
                      <div className="text-xs">
                        Added {formatDateTime(assignment.createdAt)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete this assignment?"
                        )
                      ) {
                        deleteMutation.mutate(assignment.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <FiUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No assignments yet
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Start by adding staff assignments to this event
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <FiUserPlus className="h-5 w-5" />
              <span>Add Assignment</span>
            </button>
          </div>
        )}
      </div>
    </Shell>
  );
}

