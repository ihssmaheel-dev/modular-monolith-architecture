export const radius = {
  none: "0px",
  xs: "2px",
  sm: "4px", // 0.25rem - Canonical button, input, badge radius
  md: "8px", // 0.5rem - Canonical card, modal, container radius
  lg: "12px",
  xl: "16px",
  full: "9999px", // Reserved for circular icons only
} as const;

export const shadows = {
  flat: "none",
  hairline: "0 0 0 1px #d8d8d8",
  layeredDrop:
    "0 84px 24px rgba(0,0,0,0), 0 54px 22px rgba(0,0,0,0.01), 0 30px 18px rgba(0,0,0,0.04), 0 13px 13px rgba(0,0,0,0.08), 0 3px 7px rgba(0,0,0,0.09)",
  layeredDropStrong:
    "0 84px 24px rgba(0,0,0,0.02), 0 54px 22px rgba(0,0,0,0.04), 0 30px 18px rgba(0,0,0,0.07), 0 13px 13px rgba(0,0,0,0.10), 0 3px 7px rgba(0,0,0,0.12)",
  modalHeavy: "0 24px 24px rgba(0,0,0,0.16), 0 6px 13px rgba(0,0,0,0.20)",
} as const;

export const spacing = {
  px: "1px",
  0: "0px",
  0.5: "0.125rem",
  1: "0.25rem",
  1.5: "0.375rem",
  2: "0.5rem",
  2.5: "0.625rem",
  3: "0.75rem",
  3.5: "0.875rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  7: "1.75rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const typography = {
  fontFamily: {
    sans: "'Geist', Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Geist Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }],
    sm: ["0.875rem", { lineHeight: "1.25rem" }],
    base: ["1rem", { lineHeight: "1.5rem" }],
    lg: ["1.125rem", { lineHeight: "1.75rem" }],
    xl: ["1.25rem", { lineHeight: "1.75rem" }],
    "2xl": ["1.5rem", { lineHeight: "2rem" }],
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
  },
} as const;
