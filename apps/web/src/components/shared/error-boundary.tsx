import * as React from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) return <Fallback error={this.state.error} onReset={() => this.setState({ hasError: false })} />;
    return this.props.children;
  }
}

function Fallback({ error, onReset }: { error?: Error; onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
      <Card className="max-w-md w-full border-destructive/20 shadow-lg">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{t("errors.unexpected")}</CardTitle>
          <CardDescription className="text-xs font-mono break-all">{error?.message ?? t("errors.unknown")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onReset} className="w-full">
            {t("common.retry")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
