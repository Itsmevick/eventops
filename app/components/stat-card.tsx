import { ReactNode } from "react";
import { FiTrendingUp, FiTrendingDown } from "react-icons/fi";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
  description?: string;
}

export function StatCard({ title, value, change, icon, description }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          {change && (
            <div className="mt-2 flex items-center gap-1 text-sm">
              {change.isPositive ? (
                <FiTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <FiTrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span
                className={
                  change.isPositive
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {Math.abs(change.value)}%
              </span>
              <span className="text-muted-foreground">vs last month</span>
            </div>
          )}
          {description && (
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

