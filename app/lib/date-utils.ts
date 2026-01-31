/**
 * Simple date formatting utilities
 */

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

export function formatDateRange(startDate: string, endDate: string): string {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDateStr = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const startTimeStr = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    
    // If same day, show single date with time range
    if (start.toDateString() === end.toDateString()) {
      const endTimeStr = end.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${startDateStr}, ${start.getFullYear()} • ${startTimeStr} - ${endTimeStr}`;
    }
    
    // Different days
    const endDateStr = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startDateStr} - ${endDateStr}`;
  } catch {
    return `${startDate} - ${endDate}`;
  }
}

