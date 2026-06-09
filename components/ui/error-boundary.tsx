"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  /** Translated strings — defaults to English if not provided. */
  title?: string;
  description?: string;
  refreshLabel?: string;
  dashboardLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const title = this.props.title ?? "Something went wrong";
      const description =
        this.props.description ??
        "An unexpected error occurred. Please try refreshing the page.";
      const refreshLabel = this.props.refreshLabel ?? "Refresh page";
      const dashboardLabel = this.props.dashboardLabel ?? "Go to dashboard";

      return (
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="size-5 text-destructive" />
                <CardTitle>{title}</CardTitle>
              </div>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="rounded-md bg-muted p-3 text-xs overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex gap-2">
                <Button onClick={() => window.location.reload()} variant="default">
                  {refreshLabel}
                </Button>
                <Button
                  onClick={() => (window.location.href = ROUTES.DASHBOARD)}
                  variant="outline"
                >
                  {dashboardLabel}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
