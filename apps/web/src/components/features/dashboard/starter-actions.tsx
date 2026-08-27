import { Link } from "@tanstack/react-router";
import { Button, Card } from "@repo/ui";
import { Terminal, ExternalLink, ArrowRight } from "lucide-react";

export function DashboardStarterActions() {
  return (
    <section className="grid gap-6 md:grid-cols-2 auto-rows-fr">
      <Card className="flex h-full flex-col p-6">
        <div className="flex flex-1 flex-col space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-base text-foreground">Vertical Slice Generator</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scaffold full-stack modules across all 7 layers (Contracts, CQRS, Drizzle, UI, and Tests).
            </p>
          </div>
          <div className="rounded-md bg-secondary p-3 text-xs font-mono text-foreground border border-border break-all">
            pnpm generate:feature &lt;module&gt; &lt;feature&gt;
          </div>
        </div>
        <div className="mt-auto pt-6">
          <Link to="/notes">
            <Button size="sm" className="h-9 px-4 font-medium">
              View Example Slices <ArrowRight className="ml-2 size-3.5" />
            </Button>
          </Link>
        </div>
      </Card>

      <Card className="flex h-full flex-col p-6">
        <div className="flex flex-1 flex-col space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-base text-foreground">Interactive API Reference</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Explore live OpenAPI 3.1 endpoints, test queries, and generate multi-language SDKs with Scalar.
            </p>
          </div>
          <div className="rounded-md bg-secondary p-3 text-xs font-mono text-foreground border border-border break-all">
            http://localhost:3000/api/docs
          </div>
        </div>
        <div className="mt-auto pt-6">
          <a href="/api/docs" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="h-9 px-4 font-medium border-input bg-background hover:bg-accent">
              Open Scalar Docs <ExternalLink className="ml-2 size-3.5" />
            </Button>
          </a>
        </div>
      </Card>
    </section>
  );
}
