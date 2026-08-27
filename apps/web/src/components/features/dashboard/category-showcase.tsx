import { Layers, Shield, Activity, Zap, Sparkles } from "lucide-react";

export function CategoryShowcase() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="eyebrow">Core Architectural Capabilities</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          5-Stop Chromatic System
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* 1. Purple: Design & Contracts */}
        <div className="rounded-md bg-accent-purple text-white p-5 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Layers className="h-5 w-5 opacity-90" />
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Contracts
              </span>
            </div>
            <h3 className="font-semibold text-base leading-snug">Zod 4 & oRPC</h3>
          </div>
          <p className="text-xs text-white/85 leading-relaxed">
            End-to-end type safety with unified schemas & standard DTO contracts.
          </p>
        </div>

        {/* 2. Pink: Fine-Grained Authorization */}
        <div className="rounded-md bg-accent-pink text-white p-5 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Shield className="h-5 w-5 opacity-90" />
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Security
              </span>
            </div>
            <h3 className="font-semibold text-base leading-snug">Unified FGA</h3>
          </div>
          <p className="text-xs text-white/85 leading-relaxed">
            Granular ReBAC, ABAC & RBAC evaluation with declarative UI gating.
          </p>
        </div>

        {/* 3. Blue: Observability */}
        <div className="rounded-md bg-accent-blue text-white p-5 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 opacity-90" />
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Telemetry
              </span>
            </div>
            <h3 className="font-semibold text-base leading-snug">Observability</h3>
          </div>
          <p className="text-xs text-white/85 leading-relaxed">
            Grafana, Prometheus metrics, Loki logs & Jaeger OpenTelemetry traces.
          </p>
        </div>

        {/* 4. Orange: Realtime & Workers */}
        <div className="rounded-md bg-accent-orange text-white p-5 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Zap className="h-5 w-5 opacity-90" />
              <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
                Async
              </span>
            </div>
            <h3 className="font-semibold text-base leading-snug">Queues & Streams</h3>
          </div>
          <p className="text-xs text-white/85 leading-relaxed">
            BullMQ background jobs, Piscina worker pools & Redis realtime streams.
          </p>
        </div>

        {/* 5. Green: Optimistic UI */}
        <div className="rounded-md bg-accent-green text-white p-5 flex flex-col justify-between min-h-[160px] shadow-sm transition-transform hover:-translate-y-0.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Sparkles className="h-5 w-5 text-white" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/80">
                Frontend
              </span>
            </div>
            <h3 className="font-semibold text-base leading-snug text-white">Optimistic UI</h3>
          </div>
          <p className="text-xs text-white/90 font-medium leading-relaxed">
            0ms instant updates with auto rollback & 24h offline cache persistence.
          </p>
        </div>
      </div>
    </section>
  );
}
