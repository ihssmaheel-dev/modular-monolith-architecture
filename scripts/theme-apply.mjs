#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const presetsDir = path.join(root, "packages/design-tokens/src/presets");
const activePath = path.join(presetsDir, "active.json");

const name = process.argv[2]?.replace(/\.json$/, "") || "default";

if (process.argv.includes("--list") || name === "list") {
  const files = fs.readdirSync(presetsDir).filter((f) => f.endsWith(".json") && f !== "active.json");
  console.log("Available presets:");
  for (const f of files) {
    const p = JSON.parse(fs.readFileSync(path.join(presetsDir, f), "utf-8"));
    console.log(`  - ${f.replace(".json", "")} : ${p.label || ""} (radius ${p.radius})`);
  }
  process.exit(0);
}

const src = path.join(presetsDir, `${name}.json`);
if (!fs.existsSync(src)) {
  console.error(`Preset "${name}" not found: ${src}`);
  console.error(`Available: ${fs.readdirSync(presetsDir).filter((f) => f.endsWith(".json")).join(", ")}`);
  process.exit(1);
}

fs.copyFileSync(src, activePath);
console.log(`✓ Active preset → ${name} (${src} → active.json)`);

const gen = spawnSync("node", [path.join(root, "scripts/generate-tokens.mjs")], { stdio: "inherit" });
if (gen.status !== 0) process.exit(gen.status ?? 1);

const fmt = spawnSync("npx", ["prettier", "--write", "apps/web/src/index.css", "apps/mobile/global.css", "packages/email/src/styles/tokens.ts"], {
  cwd: root,
  stdio: "inherit",
  shell: true,
});
if (fmt.status !== 0) {
  console.warn("prettier failed (non-fatal), generated files remain valid");
}

console.log(`\n✅ Theme "${name}" applied — commit:`);
console.log(`   packages/design-tokens/src/presets/active.json`);
console.log(`   apps/web/src/index.css`);
console.log(`   apps/mobile/global.css`);
console.log(`   packages/email/src/styles/tokens.ts`);
