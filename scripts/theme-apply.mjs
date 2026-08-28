#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const presetsDir = path.join(root, "packages/design-tokens/src/presets");
const activePath = path.join(presetsDir, "active.json");
const defaultPresetPath = path.join(presetsDir, "default.json");

function normalizeShadcnValue(v) {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (/^(oklch|hsl|rgb|#|var\()/.test(t)) return t;
  if (/^\d+(\.\d+)?\s+\d+%?\s+\d+%?/.test(t)) return `hsl(${t})`;
  return t;
}

function detectAndNormalize(raw) {
  if (raw.light && raw.dark && raw.radius) {
    const defaults = JSON.parse(fs.readFileSync(defaultPresetPath, "utf-8"));
    return {
      name: (raw.name || "custom").toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      label: raw.label || raw.name || "Custom (shadcn)",
      radius: raw.radius,
      fonts: raw.fonts || defaults.fonts,
      light: raw.light,
      dark: raw.dark,
      shadows: raw.shadows || defaults.shadows,
    };
  }
  let light = null;
  let dark = null;
  let radius = null;
  let name = raw.name || "shadcn-import";
  const label = raw.label || raw.title || name;
  const candidates = [raw.cssVars, raw.cssVars?.theme, raw.theme, raw.colors, raw.inlineColors, raw];
  for (const c of candidates) {
    if (!c) continue;
    if (c.light && typeof c.light === "object" && c.light.background) light = c.light;
    if (c.dark && typeof c.dark === "object" && c.dark.background) dark = c.dark;
    if (!radius && c.radius) radius = c.radius;
    if (!radius && c.light?.radius) radius = c.light.radius;
  }
  if (!light && raw.background) light = raw;
  if (!radius && raw.tailwind?.config?.theme?.extend?.borderRadius?.lg) radius = "0.5rem";
  if (!light || !dark) {
    const stack = [raw];
    const seen = new Set();
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
      seen.add(cur);
      if (cur.background && cur.foreground && cur.primary) {
        if (!light) light = cur;
        else if (!dark && cur !== light) dark = cur;
      }
      for (const v of Object.values(cur)) if (typeof v === "object") stack.push(v);
    }
  }
  if (!light || !dark) return null;
  const normalizeMap = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, normalizeShadcnValue(v)]));
  light = normalizeMap(light);
  dark = normalizeMap(dark);
  const defaults = JSON.parse(fs.readFileSync(defaultPresetPath, "utf-8"));
  const fallbackKeys = ["accent-purple", "accent-pink", "accent-blue", "accent-orange", "accent-green", "info", "warning", "success", "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground", "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring"];
  for (const k of fallbackKeys) {
    if (light[k] === undefined && defaults.light[k] !== undefined) light[k] = defaults.light[k];
    if (dark[k] === undefined && defaults.dark[k] !== undefined) dark[k] = defaults.dark[k];
  }
  return {
    name: name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    label,
    radius: typeof radius === "string" && radius.includes("rem") ? radius : radius || defaults.radius,
    fonts: defaults.fonts,
    light,
    dark,
    shadows: defaults.shadows,
  };
}

async function importShadcn(source) {
  let raw;
  if (/^https?:\/\//.test(source)) {
    console.log(`Fetching shadcn preset from ${source} ...`);
    const res = await fetch(source);
    if (!res.ok) throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
    const text = await res.text();
    try {
      raw = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) raw = JSON.parse(m[0]);
      else throw new Error("Response is not JSON");
    }
  } else {
    const file = path.isAbsolute(source) ? source : path.resolve(root, source);
    const alt = path.join(presetsDir, source);
    const target = fs.existsSync(file) ? file : fs.existsSync(alt) ? alt : null;
    if (!target) throw new Error(`File not found: ${source}`);
    const text = fs.readFileSync(target, "utf-8");
    if (text.includes("--background") && !text.trim().startsWith("{")) {
      throw new Error("CSS file detected. Paste JSON from ui.shadcn.com/create → 'Copy Code' → JSON, not CSS.");
    }
    raw = JSON.parse(text);
  }
  const normalized = detectAndNormalize(raw);
  if (!normalized) {
    console.error("Could not detect shadcn theme shape. Expected { light, dark } or { cssVars: { light, dark } }.");
    console.error("Tip: https://ui.shadcn.com/themes → pick theme → Copy JSON, or tweakcn.com → Export → JSON");
    process.exit(1);
  }
  const outFile = path.join(presetsDir, `${normalized.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(normalized, null, 2), "utf-8");
  console.log(`✓ Imported shadcn preset → ${path.relative(root, outFile)} (${normalized.label})`);
  return normalized.name;
}

const args = process.argv.slice(2);

if (args.includes("--list") || args[0] === "list") {
  const files = fs.readdirSync(presetsDir).filter((f) => f.endsWith(".json") && f !== "active.json");
  console.log("Available presets:");
  for (const f of files) {
    try {
      const p = JSON.parse(fs.readFileSync(path.join(presetsDir, f), "utf-8"));
      console.log(`  - ${f.replace(".json", "")} : ${p.label || ""} (radius ${p.radius})`);
    } catch {
      console.log(`  - ${f.replace(".json", "")} : (invalid)`);
    }
  }
  console.log("\nUsage:");
  console.log("  pnpm theme:apply <preset>              # built-in default/rose/slate");
  console.log("  pnpm theme:apply ./my-shadcn.json      # any shadcn JSON (ui.shadcn.com / tweakcn.com)");
  console.log("  pnpm theme:apply https://.../theme.json # fetch remote shadcn preset");
  console.log("  pnpm theme:import ./shadcn.json        # alias");
  console.log("  pnpm theme:list                        # list presets");
  process.exit(0);
}

let effective = null;

if (args[0] === "import" && args[1]) {
  effective = await importShadcn(args[1]);
} else if (args[0] && (args[0].includes("/") || args[0].includes("\\") || args[0].endsWith(".json") || /^https?:\/\//.test(args[0]))) {
  effective = await importShadcn(args[0]);
} else {
  const name = (args[0] || "default").replace(/\.json$/, "");
  const src = path.join(presetsDir, `${name}.json`);
  if (!fs.existsSync(src)) {
    console.error(`Preset "${name}" not found: ${src}`);
    console.error(`Available: ${fs.readdirSync(presetsDir).filter((f) => f.endsWith(".json")).join(", ")}`);
    console.error(`Tip: pnpm theme:apply ./my-shadcn.json to import raw shadcn JSON`);
    process.exit(1);
  }
  effective = name;
}

// Copy effective preset to active.json (if not already)
const effectiveFile = path.join(presetsDir, `${effective}.json`);
if (fs.existsSync(effectiveFile)) {
  const activeContent = fs.existsSync(activePath) ? fs.readFileSync(activePath, "utf-8") : "";
  const nextContent = fs.readFileSync(effectiveFile, "utf-8");
  if (activeContent !== nextContent) {
    fs.copyFileSync(effectiveFile, activePath);
    console.log(`✓ Active preset → ${effective} (${effectiveFile} → active.json)`);
  } else {
    console.log(`✓ Active preset already ${effective}`);
  }
}

const gen = spawnSync("node", [path.join(root, "scripts/generate-tokens.mjs")], { stdio: "inherit" });
if (gen.status !== 0) process.exit(gen.status ?? 1);

const fmt = spawnSync("npx", ["prettier", "--write", "apps/web/src/index.css", "apps/mobile/global.css", "packages/email/src/styles/tokens.ts", "packages/design-tokens/src/colors.ts", "packages/design-tokens/src/tokens.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
if (fmt.status !== 0) console.warn("prettier failed (non-fatal)");

console.log(`\n✅ Theme "${effective}" applied — commit:`);
console.log(`   packages/design-tokens/src/presets/active.json`);
console.log(`   apps/web/src/index.css`);
console.log(`   apps/mobile/global.css`);
console.log(`   packages/design-tokens/src/colors.ts + tokens.ts`);
console.log(`   packages/email/src/styles/tokens.ts`);
