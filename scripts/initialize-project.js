const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9 ]{1,63}$/;
const SLUG_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
const LOCAL_ENV_FILES = ["apps/api/.env", "apps/web/.env", "apps/mobile/.env"];

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) return printHelp();
  validateOptions(options);
  printPlan(options);
  if (options.dryRun) return;
  if (!options.yes) {
    throw new Error("No changes made. Re-run with --yes after reviewing the plan.");
  }
  if (!options.allowDirty) assertCleanWorkingTree();
  applyProjectMetadata(options);
  if (options.resetLocalEnv) resetLocalEnvironment();
  process.stdout.write(`\nInitialized ${options.name} (${options.slug}).\n`);
  process.stdout.write("The notes feature remains available as the reference vertical slice.\n");
  process.stdout.write("Review docs/STARTING_A_NEW_PROJECT.md before adding product modules.\n");
}

function parseArguments(args) {
  const options = {
    name: getValue(args, "--name"),
    slug: getValue(args, "--slug"),
    dryRun: args.includes("--dry-run"),
    resetLocalEnv: args.includes("--reset-local-env"),
    allowDirty: args.includes("--allow-dirty"),
    yes: args.includes("--yes"),
    help: args.includes("--help") || args.includes("-h"),
  };
  if (!options.slug && options.name) options.slug = toSlug(options.name);
  return options;
}

function getValue(args, flag) {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function validateOptions(options) {
  if (!options.name || !NAME_PATTERN.test(options.name)) {
    throw new Error("--name must be 2-64 letters, numbers, and spaces.");
  }
  if (!options.slug || !SLUG_PATTERN.test(options.slug)) {
    throw new Error("--slug must use lowercase kebab-case.");
  }
  if (options.resetLocalEnv && !options.yes) {
    throw new Error("--reset-local-env requires --yes because it replaces local .env files.");
  }
}

function printHelp() {
  process.stdout.write(`Usage: pnpm project:init --name "Acme Portal" [options]\n\n`);
  process.stdout.write("Options:\n");
  process.stdout.write("  --slug <slug>          Lowercase kebab-case project slug\n");
  process.stdout.write(
    "  --reset-local-env      Recreate ignored .env files with fresh local secrets\n",
  );
  process.stdout.write("  --dry-run              Show planned changes without writing\n");
  process.stdout.write("  --yes                  Apply the planned changes\n");
  process.stdout.write(
    "  --allow-dirty          Allow running with unrelated working-tree changes\n",
  );
}

function printPlan(options) {
  process.stdout.write(`Project: ${options.name}\nSlug: ${options.slug}\n\nPlanned changes:\n`);
  for (const file of metadataFiles()) process.stdout.write(`  update ${file}\n`);
  if (options.resetLocalEnv) {
    for (const file of LOCAL_ENV_FILES) process.stdout.write(`  recreate ${file}\n`);
  }
  if (options.dryRun) process.stdout.write("\nDry run complete.\n");
}

function metadataFiles() {
  return [
    "package.json",
    "apps/mobile/app.json",
    "apps/web/.env.example",
    "apps/mobile/.env.example",
    "docker/docker-compose.yml",
    "docker/docker-compose.observability.yml",
    "docker/docker-compose.prod.yml",
    "docker/observability/prometheus/alerts.yml",
  ];
}

function applyProjectMetadata(options) {
  updateJson("package.json", (packageJson) => ({ ...packageJson, name: options.slug }));
  updateJson("apps/mobile/app.json", (appJson) => updateExpoMetadata(appJson, options));
  replaceInFile("apps/web/.env.example", (source) =>
    setEnvValue(source, "VITE_APP_NAME", options.name),
  );
  replaceInFile("apps/mobile/.env.example", (source) =>
    setEnvValue(source, "EXPO_PUBLIC_APP_NAME", options.name),
  );
  for (const file of [
    "docker/docker-compose.yml",
    "docker/docker-compose.observability.yml",
    "docker/docker-compose.prod.yml",
  ]) {
    replaceInFile(file, (source) =>
      source.replace(/container_name: monorepo-/g, `container_name: ${options.slug}-`),
    );
  }
  replaceInFile("docker/observability/prometheus/alerts.yml", (source) =>
    source.replace(/name: modular-monolith-reliability/g, `name: ${options.slug}-reliability`),
  );
}

function updateExpoMetadata(appJson, options) {
  const identifier = options.slug.replace(/-/g, "");
  return {
    ...appJson,
    expo: {
      ...appJson.expo,
      name: options.name,
      slug: options.slug,
      scheme: identifier,
      ios: { ...appJson.expo.ios, bundleIdentifier: `com.${identifier}.app` },
      android: { ...appJson.expo.android, package: `com.${identifier}.app` },
    },
  };
}

function resetLocalEnvironment() {
  for (const relativePath of LOCAL_ENV_FILES) {
    const target = path.join(ROOT, relativePath);
    if (fs.existsSync(target)) fs.rmSync(target);
  }
  createApiEnvironment();
  copyEnvironment("apps/web/.env.example", "apps/web/.env");
  copyEnvironment("apps/mobile/.env.example", "apps/mobile/.env");
}

function createApiEnvironment() {
  const source = readFile("apps/api/.env.example")
    .replace("your-super-secret-jwt-key-change-in-prod", generateSecret())
    .replace("your-separate-refresh-secret-change-in-prod", generateSecret())
    .replace("optional-development-metrics-token-32chars", generateSecret(32));
  writeFile("apps/api/.env", source);
}

function copyEnvironment(sourcePath, targetPath) {
  writeFile(targetPath, readFile(sourcePath));
}

function generateSecret(bytes = 48) {
  return crypto.randomBytes(bytes).toString("base64url").slice(0, 64);
}

function setEnvValue(source, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  return pattern.test(source) ? source.replace(pattern, line) : `${source.trimEnd()}\n${line}\n`;
}

function updateJson(relativePath, update) {
  const target = path.join(ROOT, relativePath);
  const value = update(JSON.parse(fs.readFileSync(target, "utf8")));
  writeFile(relativePath, `${JSON.stringify(value, null, 2)}\n`);
}

function replaceInFile(relativePath, transform) {
  const source = readFile(relativePath);
  writeFile(relativePath, transform(source));
}

function readFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function writeFile(relativePath, content) {
  fs.writeFileSync(path.join(ROOT, relativePath), content, "utf8");
}

function assertCleanWorkingTree() {
  const result = spawnSync("git", ["status", "--porcelain"], { cwd: ROOT, encoding: "utf8" });
  if (result.error || result.status !== 0)
    throw new Error("Unable to inspect the git working tree.");
  if (result.stdout.trim()) {
    throw new Error("Working tree is not clean. Commit or stash existing changes first.");
  }
}

function toSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

try {
  main();
} catch (error) {
  process.stderr.write(`\nProject initialization failed: ${error.message}\n`);
  process.exitCode = 1;
}
