import { ExternalLink } from "lucide-react";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import type { ServiceItem } from "./services-data";

export function ServiceCard({ service }: { service: ServiceItem }) {
  const Icon = service.icon;
  const isLink = service.url.startsWith("http");

  return (
    <Card className="flex flex-col border-muted/60 bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300">
      <CardHeader className="p-4 space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-4.5" />
          </div>
          <Badge variant="secondary" className="font-mono text-[10px]">
            Port {service.port}
          </Badge>
        </div>
        <div className="space-y-0.5">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>{service.name}</span>
            {isLink && (
              <a
                href={service.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors p-1"
                aria-label={`Open ${service.name}`}
              >
                <ExternalLink className="size-3.5" />
              </a>
            )}
          </CardTitle>
          <p className="text-[11px] font-mono text-primary/80 font-medium">{service.protocol}</p>
        </div>
        <CardDescription className="text-xs leading-relaxed text-muted-foreground">
          {service.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto p-4 pt-2 space-y-2 text-xs">
        <div className="rounded-md border border-muted/60 bg-muted/20 p-2 text-[11px] space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Credentials:</span>
            <span className="font-mono text-foreground font-medium">{service.credentials}</span>
          </div>
        </div>
        {isLink && (
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs h-7 gap-1.5"
            render={<a href={service.url} target="_blank" rel="noreferrer" />}
          >
            <span>Launch {service.name.split(" ")[0]}</span>
            <ExternalLink className="size-3" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
