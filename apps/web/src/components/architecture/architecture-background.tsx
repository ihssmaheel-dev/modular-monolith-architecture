export function ArchitectureBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[900px] rounded-full bg-radial from-primary/12 via-primary/4 to-transparent blur-3xl" />
      <div className="absolute top-[30%] -left-40 size-[600px] rounded-full bg-radial from-blue-500/8 via-cyan-500/3 to-transparent blur-3xl" />
      <div className="absolute top-[60%] -right-40 size-[600px] rounded-full bg-radial from-purple-500/8 via-pink-500/3 to-transparent blur-3xl" />
      <div className="absolute top-[85%] left-1/3 size-[500px] rounded-full bg-radial from-emerald-500/6 via-teal-500/2 to-transparent blur-3xl" />

      <svg className="absolute inset-0 size-full stroke-muted-foreground/8 [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_75%)]">
        <defs>
          <pattern id="arch-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="0.6" />
            <circle cx="48" cy="48" r="0.8" className="fill-muted-foreground/15" />
          </pattern>
          <linearGradient id="beam-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="beam-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" strokeWidth="0" fill="url(#arch-grid)" />

        <line x1="-200" y1="192" x2="100" y2="192" stroke="url(#beam-h)" strokeWidth="1.2">
          <animate attributeName="x1" from="-200" to="2000" dur="8s" repeatCount="indefinite" />
          <animate attributeName="x2" from="100" to="2300" dur="8s" repeatCount="indefinite" />
        </line>

        <line x1="-300" y1="576" x2="0" y2="576" stroke="url(#beam-h)" strokeWidth="1.2">
          <animate
            attributeName="x1"
            from="-300"
            to="2000"
            dur="10s"
            begin="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            from="0"
            to="2300"
            dur="10s"
            begin="3s"
            repeatCount="indefinite"
          />
        </line>

        <line x1="288" y1="-200" x2="288" y2="100" stroke="url(#beam-v)" strokeWidth="1.2">
          <animate
            attributeName="y1"
            from="-200"
            to="3000"
            dur="9s"
            begin="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            from="100"
            to="3300"
            dur="9s"
            begin="1s"
            repeatCount="indefinite"
          />
        </line>

        <line x1="864" y1="-200" x2="864" y2="100" stroke="url(#beam-v)" strokeWidth="1.2">
          <animate
            attributeName="y1"
            from="-200"
            to="3000"
            dur="11s"
            begin="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            from="100"
            to="3300"
            dur="11s"
            begin="4s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
    </div>
  );
}
