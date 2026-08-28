import { Link } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Button } from "@repo/ui";
import { Users, FileText, Shield, Building2, Package, Layers, ArrowRight } from "lucide-react";

const modules = [
  { key: "users", icon: Users, color: "bg-primary", desc: "Identity + RBAC, 5 queries + 6 commands", to: "/users" as const },
  { key: "auth", icon: Shield, color: "bg-accent-purple", desc: "JWT + 6 commands, argon2, lockout", to: "/" as const },
  { key: "notes", icon: FileText, color: "bg-accent-blue", desc: "Tenant-scoped CRUD, realtime, soft-delete", to: "/notes" as const },
  { key: "files", icon: Package, color: "bg-accent-orange", desc: "S3 + presign + magic-bytes + cleanup", to: "/notes" as const },
  { key: "tenancy", icon: Building2, color: "bg-accent-green", desc: "Orgs + memberships + invitations + RLS", to: "/settings" as const },
];

export function ModuleGrid() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" /> Domain Modules
        </h2>
        <Badge variant="outline" className="text-[11px]">5 isolated</Badge>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((m) => (
          <Card key={m.key} className="border-border/60 shadow-sm hover:shadow-md hover:border-border transition-all group flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${m.color} text-white shadow-sm`}>
                  <m.icon className="h-4.5 w-4.5" />
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">module</Badge>
              </div>
              <CardTitle className="text-sm capitalize">{m.key}</CardTitle>
              <CardDescription className="text-xs leading-relaxed line-clamp-2">{m.desc}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 mt-auto">
              <Link to={m.to}>
                <Button variant="ghost" size="sm" className="h-8 w-full justify-between text-xs group-hover:bg-accent">
                  Open <span className="capitalize">{m.key}</span> <ArrowRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
        <Card className="border-dashed border-border bg-muted/20 flex flex-col items-center justify-center p-6 text-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-background shadow-sm">
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium">Your module</p>
          <p className="text-xs text-muted-foreground">pnpm generate:feature &lt;name&gt; &lt;feature&gt;</p>
        </Card>
      </div>
    </div>
  );
}
