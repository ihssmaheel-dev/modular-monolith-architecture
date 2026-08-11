import { Component, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Button } from "@repo/ui";

interface BoundaryProps {
  children: ReactNode;
  t: TFunction;
}

interface BoundaryState {
  hasError: boolean;
}

class Boundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): BoundaryState {
    void error;
    return { hasError: true };
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground">
            {this.props.t("errors.serverError")}
          </h2>
          <Button onClick={() => this.setState({ hasError: false })} className="mt-4">
            {this.props.t("common.retry")}
          </Button>
        </div>
      </div>
    );
  }
}

export function ErrorBoundary({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  return <Boundary t={t}>{children}</Boundary>;
}
