import { Link } from "@tanstack/react-router";
import { Button, Card } from "@repo/ui";
import { Terminal, ExternalLink, ArrowRight } from "lucide-react";

export function DashboardStarterActions() {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-base text-foreground">Vertical Slice Generator</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Scaffold full-stack modules across all 7 layers (Contracts, CQRS, Drizzle, UI, and
            Tests).
          </p>
        </div>
        <div className="rounded-sm bg-secondary p-3 text-xs font-mono text-foreground border border-border">
          pnpm generate:feature &lt;module&gt; &lt;feature&gt;
        </div>
        <div className="flex gap-2">
          <Link to="/notes">
            <Button size="sm">
              View Example Slices <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-base text-foreground">Interactive API Reference</h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Explore live OpenAPI 3.1 endpoints, test queries, and generate multi-language SDKs with
            Scalar.
          </p>
        </div>
        <div className="rounded-sm bg-secondary p-3 text-xs font-mono text-foreground border border-border">
          http://localhost:3000/api/docs
        </div>
        <div>
          <a href="/api/docs" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              Open Scalar Docs <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </Card>
    </section>
  );
}
