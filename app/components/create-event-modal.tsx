"use client";

import { useState, FormEvent } from "react";
import { FiX } from "react-icons/fi";
import { createEvent, CreateEventData } from "../lib/events-api";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEventData) => Promise<void>;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateEventModalProps) {
  const [formData, setFormData] = useState<CreateEventData>({
    title: "",
    description: "",
    venue: "",
    startAt: "",
    endAt: "",
    capacity: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.startAt) {
      newErrors.startAt = "Start date is required";
    }

    if (!formData.endAt) {
      newErrors.endAt = "End date is required";
    }

    if (formData.startAt && formData.endAt) {
      const start = new Date(formData.startAt);
      const end = new Date(formData.endAt);
      if (end <= start) {
        newErrors.endAt = "End date must be after start date";
      }
    }

    if (formData.capacity !== undefined && formData.capacity < 1) {
      newErrors.capacity = "Capacity must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert datetime-local format to ISO string
      const payload: CreateEventData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || null,
        venue: formData.venue?.trim() || null,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        capacity: formData.capacity || 0,
      };

      await onSubmit(payload);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        venue: "",
        startAt: "",
        endAt: "",
        capacity: 1,
      });
      setErrors({});
      onClose();
    } catch (error) {
      // Error handling is done by parent
      console.error("Failed to create event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Create New Event
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.title
                  ? "border-red-500"
                  : "border-border"
              } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              placeholder="Event title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Event description (optional)"
            />
          </div>

          {/* Venue */}
          <div>
            <label
              htmlFor="venue"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Venue
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Event venue (optional)"
            />
          </div>

          {/* Date/Time Fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Start Date/Time */}
            <div>
              <label
                htmlFor="startAt"
                className="block text-sm font-medium text-foreground mb-1"
              >
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="startAt"
                name="startAt"
                value={formData.startAt}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.startAt
                    ? "border-red-500"
                    : "border-border"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.startAt && (
                <p className="mt-1 text-sm text-red-500">{errors.startAt}</p>
              )}
            </div>

            {/* End Date/Time */}
            <div>
              <label
                htmlFor="endAt"
                className="block text-sm font-medium text-foreground mb-1"
              >
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="endAt"
                name="endAt"
                value={formData.endAt}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-lg border ${
                  errors.endAt
                    ? "border-red-500"
                    : "border-border"
                } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
              />
              {errors.endAt && (
                <p className="mt-1 text-sm text-red-500">{errors.endAt}</p>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label
              htmlFor="capacity"
              className="block text-sm font-medium text-foreground mb-1"
            >
              Capacity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className={`w-full px-3 py-2 rounded-lg border ${
                errors.capacity
                  ? "border-red-500"
                  : "border-border"
              } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary`}
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground font-medium hover:bg-accent transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

