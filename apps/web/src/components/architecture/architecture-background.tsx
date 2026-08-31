export function ArchitectureBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Radial Ambient Gradient Orbs */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[800px] rounded-full bg-radial from-primary/15 via-primary/5 to-transparent blur-3xl" />
      <div className="absolute top-[35%] -left-40 size-[600px] rounded-full bg-radial from-blue-500/10 via-cyan-500/5 to-transparent blur-3xl" />
      <div className="absolute top-[65%] -right-40 size-[600px] rounded-full bg-radial from-purple-500/10 via-pink-500/5 to-transparent blur-3xl" />

      {/* Futuristic Animated SVG Grid Matrix with Traveling Glowing Beams */}
      <svg className="absolute inset-0 size-full stroke-muted-foreground/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]">
        <defs>
          <pattern id="arch-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" strokeWidth="0.75" />
            <circle cx="48" cy="48" r="1" className="fill-muted-foreground/20" />
          </pattern>
          <linearGradient id="beam-gradient-h" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="beam-gradient-v" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" strokeWidth="0" fill="url(#arch-grid-pattern)" />

        {/* Animated Horizontal Beam 1 */}
        <line x1="-200" y1="192" x2="100" y2="192" stroke="url(#beam-gradient-h)" strokeWidth="1.5">
          <animate attributeName="x1" from="-200" to="1800" dur="7s" repeatCount="indefinite" />
          <animate attributeName="x2" from="100" to="2100" dur="7s" repeatCount="indefinite" />
        </line>

        {/* Animated Horizontal Beam 2 */}
        <line x1="-300" y1="576" x2="0" y2="576" stroke="url(#beam-gradient-h)" strokeWidth="1.5">
          <animate
            attributeName="x1"
            from="-300"
            to="1800"
            dur="9s"
            begin="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            from="0"
            to="2100"
            dur="9s"
            begin="2s"
            repeatCount="indefinite"
          />
        </line>

        {/* Animated Vertical Beam 1 */}
        <line x1="288" y1="-200" x2="288" y2="100" stroke="url(#beam-gradient-v)" strokeWidth="1.5">
          <animate
            attributeName="y1"
            from="-200"
            to="2400"
            dur="8s"
            begin="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            from="100"
            to="2700"
            dur="8s"
            begin="1s"
            repeatCount="indefinite"
          />
        </line>

        {/* Animated Vertical Beam 2 */}
        <line x1="864" y1="-200" x2="864" y2="100" stroke="url(#beam-gradient-v)" strokeWidth="1.5">
          <animate
            attributeName="y1"
            from="-200"
            to="2400"
            dur="10s"
            begin="3.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            from="100"
            to="2700"
            dur="10s"
            begin="3.5s"
            repeatCount="indefinite"
          />
        </line>
      </svg>
    </div>
  );
}
