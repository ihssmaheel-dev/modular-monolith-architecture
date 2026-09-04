import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tokensSchema } from "../src/tokens.schema.js";
import { converter, parse } from "culori";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..", "..");
const activePath = resolve(__dirname, "../src/presets/active.json");

const args = process.argv.slice(2);
const isCheck = args.includes("--check");

function oklchToHex(oklch: string): string {
  const c = parse(oklch);
  if (!c) return "#000000";
  // culori parse handles "oklch(...)" strings
  const toRgb = converter("rgb");
  const rgb = toRgb(c);
  if (!rgb) return "#000000";
  const toHex = formatHexSafe(rgb);
  return toHex;
}

function formatHexSafe(rgb: any): string {
  const r = Math.round((rgb.r ?? 0) * 255);
  const g = Math.round((rgb.g ?? 0) * 255);
  const b = Math.round((rgb.b ?? 0) * 255);
  const clamp = (n: number) => Math.max(0, Math.min(255, n));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToOklch(hex: string): string {
  try {
    const c = parse(hex);
    if (!c) return hex;
    const toOklch = converter("oklch");
    const oklch = toOklch(c);
    if (!oklch) return hex;
    const l = oklch.l ?? 0;
    const cVal = oklch.c ?? 0;
    const h = oklch.h ?? 0;
    // Format with limited precision
    return `oklch(${l.toFixed(3)} ${cVal.toFixed(3)} ${h.toFixed(1)})`;
  } catch {
    return hex;
  }
}

function loadTokens() {
  const raw = readFileSync(activePath, "utf-8");
  const json = JSON.parse(raw);
  const parsed = tokensSchema.safeParse(json);
  if (!parsed.success) {
    console.error("Invalid active.json", parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}

function generateWebCss(tokens: NonNullable<ReturnType<typeof loadTokens>>): string {
  const lightEntries = Object.entries(tokens.light);
  const darkEntries = Object.entries(tokens.dark);
  const lightVars = lightEntries.map(([k, v]) => `    --${k}: ${v};`).join("\n");
  const darkVars = darkEntries.map(([k, v]) => `    --${k}: ${v};`).join("\n");
  return `/* GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate */
:root {
${lightVars}
    --radius: ${tokens.radius};
}

.dark {
${darkVars}
}
`;
}

function generateEmailTs(tokens: NonNullable<ReturnType<typeof loadTokens>>): string {
  // Email keeps brand as hex, but semantic tokens from active.json
  // For email, we want brand-derived primary to preserve colorful CTA while still single-file reskin via brand.
  // We map email primary/ring/sidebar-primary to brand purple oklch, rest from active.
  const brandPrimaryOklch = hexToOklch(tokens.brand.purple);
  // For email light primary, use brand
  const emailLight = { ...tokens.light, primary: brandPrimaryOklch, ring: brandPrimaryOklch, "sidebar-primary": brandPrimaryOklch, "sidebar-ring": brandPrimaryOklch } as any;
  const emailDark = { ...tokens.dark, primary: hexToOklch(tokens.brand.purple), ring: hexToOklch(tokens.brand.purple), "sidebar-primary": hexToOklch(tokens.brand.purple), "sidebar-ring": hexToOklch(tokens.brand.purple) } as any;

  // Keep email's previous chart/accent mapping but from active
  const shadows = tokens.shadows;
  const fonts = tokens.fonts;
  const brand = tokens.brand;

  return `// GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate
export const emailTokens = {
  light: {
${Object.entries(emailLight)
  .map(([k, v]) => `    "${k}": "${v}",`)
  .join("\n")}
    "accent-purple": "${brand.purple}",
    "accent-pink": "${brand.pink}",
    "accent-blue": "${brand.blue}",
    "accent-orange": "${brand.orange}",
    "accent-green": "${brand.green}",
    info: "${brand.info}",
    warning: "${brand.warning}",
    success: "${brand.success}",
  },
  dark: {
${Object.entries(emailDark)
  .map(([k, v]) => `    "${k}": "${v}",`)
  .join("\n")}
    "accent-purple": "${brand.purple}",
    "accent-pink": "${brand.pink}",
    "accent-blue": "${brand.blue}",
    "accent-orange": "${brand.orange}",
    "accent-green": "${brand.green}",
    info: "${brand.info}",
    warning: "${brand.warning}",
    success: "${brand.success}",
  },
  radius: "${tokens.radius}",
  fonts: {
    sans: "${fonts.sans}",
    heading: "${fonts.heading}",
    mono: "${fonts.mono}",
  },
  shadows: {
    layered: "${shadows.layered}",
    "layered-strong": "${shadows["layered-strong"]}",
    modal: "${shadows.modal}",
  },
  brand: {
    purple: "${brand.purple}",
    pink: "${brand.pink}",
    blue: "${brand.blue}",
    orange: "${brand.orange}",
    green: "${brand.green}",
    info: "${brand.info}",
    warning: "${brand.warning}",
    success: "${brand.success}",
  },
} as const;

export type EmailTokens = typeof emailTokens;
`;
}

function generateMobileTokens(tokens: NonNullable<ReturnType<typeof loadTokens>>): string {
  const toHexMap = (obj: Record<string, string>) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      // v is oklch string, convert to hex; if already hex or slash syntax, keep as is or convert
      if (v.startsWith("#")) out[k] = v;
      else if (v.startsWith("oklch")) out[k] = oklchToHex(v);
      else out[k] = v; // e.g. "oklch(1 0 0 / 10%)" -> try parse, fallback
    }
    return out;
  };

  const lightHex = toHexMap(tokens.light as any);
  const darkHex = toHexMap(tokens.dark as any);

  // Handle alpha variants: "oklch(1 0 0 / 10%)" -> opaque fallback for RN
  for (const [k, v] of Object.entries(tokens.light as any) as [string, string][]) {
    if (v.includes("/")) {
      // light alpha on white -> subtle gray border
      lightHex[k] = "#e5e5e5";
    }
  }
  for (const [k, v] of Object.entries(tokens.dark as any) as [string, string][]) {
    if (v.includes("/")) {
      // dark alpha on black -> subtle dark gray
      darkHex[k] = k.includes("sidebar") ? "#2a2a2a" : "#262626";
    }
  }

  return `// GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate
export const mobileTokens = {
  light: ${JSON.stringify(lightHex, null, 2)},
  dark: ${JSON.stringify(darkHex, null, 2)},
  radius: "${tokens.radius}",
  fonts: ${JSON.stringify(tokens.fonts, null, 2)},
  shadows: ${JSON.stringify(tokens.shadows, null, 2)},
  brand: ${JSON.stringify(tokens.brand, null, 2)},
} as const;

export type MobileTokens = typeof mobileTokens;
export const lightHex = mobileTokens.light;
export const darkHex = mobileTokens.dark;
`;
}

function generateTailwindTokens(tokens: NonNullable<ReturnType<typeof loadTokens>>): string {
  const toHexMap = (obj: Record<string, string>) => {
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v.startsWith("#")) out[k] = v;
      else if (v.startsWith("oklch")) out[k] = oklchToHex(v);
      else out[k] = v;
    }
    return out;
  };
  const lightHex = toHexMap(tokens.light as any);
  const darkHex = toHexMap(tokens.dark as any);
  for (const [k, v] of Object.entries(tokens.light as any) as [string, string][]) {
    if (v.includes("/")) lightHex[k] = "#e5e5e5";
  }
  for (const [k, v] of Object.entries(tokens.dark as any) as [string, string][]) {
    if (v.includes("/")) darkHex[k] = k.includes("sidebar") ? "#2a2a2a" : "#262626";
  }
  // Tailwind needs flat color map for NativeWind; we expose light as primary, dark via separate key
  return `// GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate
module.exports = {
  light: ${JSON.stringify(lightHex, null, 2)},
  dark: ${JSON.stringify(darkHex, null, 2)},
  brand: ${JSON.stringify(tokens.brand, null, 2)},
  radius: "${tokens.radius}",
};
`;
}

function ensureDir(p: string) {
  mkdirSync(dirname(p), { recursive: true });
}

function main() {
  const tokens = loadTokens();

  const webCss = generateWebCss(tokens);
  const emailTs = generateEmailTs(tokens);
  const mobileTs = generateMobileTokens(tokens);
  const tailwindTokens = generateTailwindTokens(tokens);

  const webPath = resolve(root, "packages/ui/src/styles/tokens.generated.css");
  const emailPath = resolve(root, "packages/email/src/styles/tokens.ts");
  const mobilePath = resolve(root, "apps/mobile/src/theme/tokens.generated.ts");
  const tailwindPath = resolve(root, "apps/mobile/src/theme/tailwind.tokens.generated.js");

  if (isCheck) {
    let ok = true;
    const checks: Array<[string, string]> = [
      [webPath, webCss],
      [emailPath, emailTs],
      [mobilePath, mobileTs],
      [tailwindPath, tailwindTokens],
    ];
    for (const [p, expected] of checks) {
      if (!existsSync(p)) {
        console.error(`Missing generated file: ${p}`);
        ok = false;
        continue;
      }
      const actual = readFileSync(p, "utf-8");
      if (actual !== expected) {
        console.error(`Out of date: ${p} — run pnpm theme:generate`);
        ok = false;
      }
    }
    if (!ok) process.exit(1);
    console.log("All generated tokens up to date.");
    return;
  }

  ensureDir(webPath);
  ensureDir(emailPath);
  ensureDir(mobilePath);
  ensureDir(tailwindPath);
  writeFileSync(webPath, webCss);
  writeFileSync(emailPath, emailTs);
  writeFileSync(mobilePath, mobileTs);
  writeFileSync(tailwindPath, tailwindTokens);
  console.log(`Generated:
  - ${webPath}
  - ${emailPath}
  - ${mobilePath}
  - ${tailwindPath}`);
}

main();
