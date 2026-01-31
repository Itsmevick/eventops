"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { Shell } from "../../components/shell";
import { useTheme } from "../../components/theme-provider";
import { FiSun, FiMoon, FiMonitor, FiLogOut, FiUser, FiMail } from "react-icons/fi";

export default function SettingsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

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

  const handleLogout = () => {
    logout();
  };

  return (
    <Shell pageTitle="Settings">
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Theme Settings */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Appearance
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose your preferred theme
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                theme === "light"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <FiSun className="h-5 w-5 text-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">Light</div>
                <div className="text-xs text-muted-foreground">Light mode</div>
              </div>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                theme === "dark"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <FiMoon className="h-5 w-5 text-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">Dark</div>
                <div className="text-xs text-muted-foreground">Dark mode</div>
              </div>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                theme === "system"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <FiMonitor className="h-5 w-5 text-foreground" />
              <div className="text-left">
                <div className="text-sm font-medium text-foreground">System</div>
                <div className="text-xs text-muted-foreground">Use system theme</div>
              </div>
            </button>
          </div>
          {theme === "system" && (
            <p className="text-xs text-muted-foreground mt-3">
              Currently using {resolvedTheme} mode based on your system preferences
            </p>
          )}
        </div>

        {/* Account Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Account
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Name
              </label>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                <FiUser className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {user?.name || "N/A"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                Email
              </label>
              <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
                <FiMail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">
                  {user?.email || "N/A"}
                </span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">
                User ID
              </label>
              <div className="p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-sm text-muted-foreground font-mono">
                  {user?.id || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Danger Zone
          </h2>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
          >
            <FiLogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </Shell>
  );
}

