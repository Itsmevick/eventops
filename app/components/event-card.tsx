import Link from "next/link";
import { Event } from "../lib/events-api";
import { FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";
import { formatDateRange } from "../lib/date-utils";

interface EventCardProps {
  event: Event;
}

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
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}


export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/dashboard/events/${event.id}`}
      className="block rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-foreground pr-4">
          {event.title}
        </h3>
        <StatusBadge status={event.status} />
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <FiCalendar className="h-4 w-4 flex-shrink-0" />
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
        </div>

        {event.location && (
          <div className="flex items-center gap-2">
            <FiMapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        )}

        {event.capacity !== undefined && (
          <div className="flex items-center gap-2">
            <FiUsers className="h-4 w-4 flex-shrink-0" />
            <span>Capacity: {event.capacity}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

