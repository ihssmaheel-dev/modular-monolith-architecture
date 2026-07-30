import { Component } from "react";
import { Button } from "@repo/ui";
import { withTranslation, WithTranslation } from "react-i18next";

interface ErrorBoundaryProps extends WithTranslation {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryComponent extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const { t } = this.props;
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-foreground">{t("errors.serverError")}</h2>
            <p className="mt-2 text-muted-foreground">{this.state.error?.message}</p>
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-4"
            >
              {t("common.retry")}
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryComponent as any) as any;
