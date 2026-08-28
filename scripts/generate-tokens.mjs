#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const presetPath = path.join(root, "packages/design-tokens/src/presets/active.json");
const webCssPath = path.join(root, "apps/web/src/index.css");
const mobileCssPath = path.join(root, "apps/mobile/global.css");
const emailTokensPath = path.join(root, "packages/email/src/styles/tokens.ts");
const colorsPath = path.join(root, "packages/design-tokens/src/colors.ts");
const tokensPath = path.join(root, "packages/design-tokens/src/tokens.ts");

function loadPreset() {
  if (!fs.existsSync(presetPath)) {
    console.error(`Missing preset: ${presetPath}. Run pnpm theme:apply <name>`);
    process.exit(1);
  }
  const raw = fs.readFileSync(presetPath, "utf-8");
  const preset = JSON.parse(raw);
  const required = ["light", "dark", "radius", "fonts", "shadows"];
  for (const k of required) {
    if (!preset[k]) {
      console.error(`Invalid preset: missing "${k}" in ${presetPath}`);
      process.exit(1);
    }
  }
  // Fallback: ensure custom 5-stop + semantic keys exist even for raw shadcn presets that lacked them
  try {
    const defaults = JSON.parse(fs.readFileSync(path.join(root, "packages/design-tokens/src/presets/default.json"), "utf-8"));
    const fallbackKeys = ["accent-purple", "accent-pink", "accent-blue", "accent-orange", "accent-green", "info", "warning", "success", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring"];
    for (const k of fallbackKeys) {
      if (preset.light[k] === undefined && defaults.light[k] !== undefined) preset.light[k] = defaults.light[k];
      if (preset.dark[k] === undefined && defaults.dark[k] !== undefined) preset.dark[k] = defaults.dark[k];
    }
    if (!preset.fonts) preset.fonts = defaults.fonts;
    if (!preset.shadows) preset.shadows = defaults.shadows;
    if (!preset.radius) preset.radius = defaults.radius;
  } catch {}
  return preset;
}

function orderLightDarkTokens(obj) {
  const order = [
    "background",
    "foreground",
    "card",
    "card-foreground",
    "popover",
    "popover-foreground",
    "primary",
    "primary-foreground",
    "secondary",
    "secondary-foreground",
    "muted",
    "muted-foreground",
    "accent",
    "accent-foreground",
    "destructive",
    "destructive-foreground",
    "border",
    "input",
    "ring",
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
    "sidebar",
    "sidebar-foreground",
    "sidebar-primary",
    "sidebar-primary-foreground",
    "sidebar-accent",
    "sidebar-accent-foreground",
    "sidebar-border",
    "sidebar-ring",
    "accent-purple",
    "accent-pink",
    "accent-blue",
    "accent-orange",
    "accent-green",
    "info",
    "warning",
    "success",
  ];
  const out = {};
  for (const key of order) if (obj[key] !== undefined) out[key] = obj[key];
  for (const [k, v] of Object.entries(obj)) if (!(k in out)) out[k] = v;
  return out;
}

function cssVarsBlock(obj, indent = "  ") {
  const ordered = orderLightDarkTokens(obj);
  return Object.entries(ordered)
    .map(([k, v]) => `${indent}--${k}: ${v};`)
    .join("\n");
}

function buildWebCss(preset) {
  const lightVars = cssVarsBlock(preset.light);
  const darkVars = cssVarsBlock(preset.dark);
  return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-xs: calc(var(--radius) * 0.4);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* 5-Stop Chromatic Category Palette — generated from preset */
  --color-accent-purple: var(--accent-purple);
  --color-accent-pink: var(--accent-pink);
  --color-accent-blue: var(--accent-blue);
  --color-accent-orange: var(--accent-orange);
  --color-accent-green: var(--accent-green);
  --color-info: var(--info);
  --color-warning: var(--warning);
  --color-success: var(--success);

  /* Typography Fonts — generated */
  --font-sans: ${preset.fonts.sans};
  --font-heading: ${preset.fonts.heading};
  --font-mono: ${preset.fonts.mono};
}

/* GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate */
:root {
${lightVars}
  --radius: ${preset.radius};
}

.dark {
${darkVars}
}

@layer utilities {
  .shadow-layered {
    box-shadow: ${preset.shadows.layered};
  }
  .shadow-layered-strong {
    box-shadow: ${preset.shadows["layered-strong"]};
  }
  .shadow-modal {
    box-shadow: ${preset.shadows.modal};
  }
  .eyebrow {
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--muted-foreground);
  }
  .eyebrow-sm {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--muted-foreground);
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
    letter-spacing: -0.015em;
  }
  code, kbd, samp, pre {
    font-family: var(--font-mono);
  }
  button:not(:disabled), [role="button"]:not(:disabled) {
    cursor: pointer;
  }
}
`;
}

function buildMobileCss(preset) {
  const lightVars = cssVarsBlock(preset.light);
  const darkVars = cssVarsBlock(preset.dark);
  return `@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-xs: calc(var(--radius) * 0.4);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
  --radius-3xl: calc(var(--radius) * 2.2);
  --radius-4xl: calc(var(--radius) * 2.6);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* 5-Stop Chromatic Category Palette — generated from preset */
  --color-accent-purple: var(--accent-purple);
  --color-accent-pink: var(--accent-pink);
  --color-accent-blue: var(--accent-blue);
  --color-accent-orange: var(--accent-orange);
  --color-accent-green: var(--accent-green);
  --color-info: var(--info);
  --color-warning: var(--warning);
  --color-success: var(--success);

  /* Typography Fonts — generated */
  --font-sans: ${preset.fonts.sans};
  --font-heading: ${preset.fonts.heading};
  --font-mono: ${preset.fonts.mono};
}

/* GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate */
:root {
${lightVars}
  --radius: ${preset.radius};
}

.dark {
${darkVars}
}

@layer utilities {
  .shadow-layered {
    box-shadow: ${preset.shadows.layered};
  }
  .shadow-layered-strong {
    box-shadow: ${preset.shadows["layered-strong"]};
  }
  .shadow-modal {
    box-shadow: ${preset.shadows.modal};
  }
  .eyebrow {
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--muted-foreground);
  }
  .eyebrow-sm {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: var(--muted-foreground);
  }
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
}
`;
}

function buildColors(preset) {
  return `// GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate
/**
 * Design Tokens — Single source of truth for color decisions.
 * Generated from preset "${preset.name}" (${preset.label}).
 * Chromatic category accents are semantic (category status) not raw hex.
 */
export const colors = ${JSON.stringify({ light: orderLightDarkTokens(preset.light), dark: orderLightDarkTokens(preset.dark) }, null, 2)} as const;

/**
 * 5-Stop Chromatic Category Accents & Brand Spectrum — mirrors preset accent-* + info/warning/success
 * Semantic: use bg-accent-purple / bg-info via CSS var, or brandColors.accentPurple for JS fallbacks (RN StyleSheet, PDF).
 */
export const brandColors = {
  ink: "#080808",
  inkStrong: "#222222",
  body: "#363636",
  bodyMid: "#5a5a5a",
  mute: "#898989",
  muteSoft: "#ababab",
  canvas: "#ffffff",
  hairline: "#d8d8d8",
  accentPurple: "${preset.light["accent-purple"]}",
  accentPink: "${preset.light["accent-pink"]}",
  accentBlue: "${preset.light["accent-blue"]}",
  accentOrange: "${preset.light["accent-orange"]}",
  accentGreen: "${preset.light["accent-green"]}",
  accentBlueDeep: "${preset.light["accent-blue"]}",
  accentBlueInfo: "${preset.light.info}",
  accentYellow: "${preset.light.warning}",
  accentRed: "${preset.dark.destructive}",
  info: "${preset.light.info}",
  warning: "${preset.light.warning}",
  success: "${preset.light.success}",
} as const;

export type Theme = "light" | "dark";
export type ColorToken = keyof typeof colors.light;
`;
}

function buildTokens(preset) {
  return `// GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate
export const radius = {
  none: "0px",
  xs: "calc(${preset.radius} * 0.4)", // = var(--radius-xs)
  sm: "calc(${preset.radius} * 0.6)", // canonical button/input/badge
  md: "calc(${preset.radius} * 0.8)", // canonical card/modal
  lg: "${preset.radius}", // canonical dialog
  xl: "calc(${preset.radius} * 1.4)",
  "2xl": "calc(${preset.radius} * 1.8)",
  "3xl": "calc(${preset.radius} * 2.2)",
  full: "9999px",
} as const;

export const shadows = {
  flat: "none",
  hairline: "0 0 0 1px var(--border)",
  layeredDrop: "${preset.shadows.layered.replace(/"/g, '\\"')}",
  layeredDropStrong: "${preset.shadows["layered-strong"].replace(/"/g, '\\"')}",
  modalHeavy: "${preset.shadows.modal.replace(/"/g, '\\"')}",
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
    sans: ${JSON.stringify(preset.fonts.sans)},
    heading: ${JSON.stringify(preset.fonts.heading)},
    mono: ${JSON.stringify(preset.fonts.mono)},
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
`;
}

function buildEmailTokens(preset) {
  return `// GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate
export const emailTokens = ${JSON.stringify(
    {
      light: preset.light,
      dark: preset.dark,
      radius: preset.radius,
      fonts: preset.fonts,
      shadows: preset.shadows,
      brand: {
        purple: preset.light["accent-purple"],
        pink: preset.light["accent-pink"],
        blue: preset.light["accent-blue"],
        orange: preset.light["accent-orange"],
        green: preset.light["accent-green"],
        info: preset.light.info,
        warning: preset.light.warning,
        success: preset.light.success,
      },
    },
    null,
    2,
  )} as const;

export type EmailTokens = typeof emailTokens;
`;
}

function main() {
  const preset = loadPreset();
  fs.mkdirSync(path.dirname(webCssPath), { recursive: true });
  fs.mkdirSync(path.dirname(mobileCssPath), { recursive: true });
  fs.mkdirSync(path.dirname(emailTokensPath), { recursive: true });
  fs.mkdirSync(path.dirname(colorsPath), { recursive: true });

  fs.writeFileSync(webCssPath, buildWebCss(preset), "utf-8");
  fs.writeFileSync(mobileCssPath, buildMobileCss(preset), "utf-8");
  fs.writeFileSync(emailTokensPath, buildEmailTokens(preset), "utf-8");
  fs.writeFileSync(colorsPath, buildColors(preset), "utf-8");
  fs.writeFileSync(tokensPath, buildTokens(preset), "utf-8");

  console.log(`✓ Generated tokens for preset "${preset.name}" (${preset.label})`);
  console.log(`  → ${path.relative(root, webCssPath)}`);
  console.log(`  → ${path.relative(root, mobileCssPath)}`);
  console.log(`  → ${path.relative(root, emailTokensPath)}`);
  console.log(`  → ${path.relative(root, colorsPath)}`);
  console.log(`  → ${path.relative(root, tokensPath)}`);
}

main();
