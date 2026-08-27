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

  fs.writeFileSync(webCssPath, buildWebCss(preset), "utf-8");
  fs.writeFileSync(mobileCssPath, buildMobileCss(preset), "utf-8");
  fs.writeFileSync(emailTokensPath, buildEmailTokens(preset), "utf-8");

  console.log(`✓ Generated tokens for preset "${preset.name}" (${preset.label})`);
  console.log(`  → ${path.relative(root, webCssPath)}`);
  console.log(`  → ${path.relative(root, mobileCssPath)}`);
  console.log(`  → ${path.relative(root, emailTokensPath)}`);
}

main();
