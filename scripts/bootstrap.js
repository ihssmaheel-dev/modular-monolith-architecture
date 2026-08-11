const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const MINIMUM_NODE_MAJOR = 20;
const ENV_FILES = [
  ["apps/api/.env.example", "apps/api/.env"],
  ["apps/web/.env.example", "apps/web/.env"],
  ["apps/mobile/.env.example", "apps/mobile/.env"],
];

function main() {
  try {
    verifyPrerequisites();
    createEnvironmentFiles();
    run("pnpm", ["install", "--frozen-lockfile"]);
    run("pnpm", ["docker:up"]);
    run("pnpm", ["docker:init"]);
    run("pnpm", ["db:migrate"]);
    run("pnpm", ["build"]);
    process.stdout.write("\nBootstrap complete. Run `pnpm dev` to start development.\n");
  } catch (error) {
    process.stderr.write(`\nBootstrap failed: ${error.message}\n`);
    process.exitCode = 1;
  }
}

function verifyPrerequisites() {
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  if (nodeMajor < MINIMUM_NODE_MAJOR) {
    throw new Error(`Node.js ${MINIMUM_NODE_MAJOR}+ is required.`);
  }
  verifyPnpm();
  verifyCompose();
}

function verifyPnpm() {
  const result = execute("pnpm", ["--version"], "pipe");
  const major = Number(result.stdout?.toString().trim().split(".")[0]);
  if (result.error || result.status !== 0 || major !== 9) {
    throw new Error("pnpm 9 is required. Enable the repository version with Corepack.");
  }
}

function verifyCompose() {
  const version = execute("docker", ["compose", "version"], "ignore");
  const help = execute("docker", ["compose", "up", "--help"], "pipe");
  const supportsWait = help.stdout?.toString().includes("--wait");
  if (version.error || version.status !== 0 || !supportsWait) {
    throw new Error("Docker with Compose v2.17+ is required.");
  }
}

function createEnvironmentFiles() {
  for (const [template, destination] of ENV_FILES) {
    const target = path.join(ROOT, destination);
    if (fs.existsSync(target)) {
      process.stdout.write(`Preserved ${destination}\n`);
      continue;
    }
    fs.copyFileSync(path.join(ROOT, template), target);
    process.stdout.write(`Created ${destination}\n`);
  }
}

function run(command, args) {
  process.stdout.write(`\n> ${command} ${args.join(" ")}\n`);
  const result = execute(command, args, "inherit");
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} exited with code ${result.status}.`);
}

function execute(command, args, stdio) {
  return spawnSync(command, args, {
    cwd: ROOT,
    stdio,
    shell: process.platform === "win32",
  });
}

main();
