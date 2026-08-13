const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const failures = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (["dist", "node_modules", ".turbo", ".vite"].includes(entry.name)) return [];
      return walk(target);
    }
    return [target];
  });
}

function relative(file) {
  return path.relative(ROOT, file).replaceAll("\\", "/");
}

function report(file, message) {
  failures.push(`${relative(file)}: ${message}`);
}

function isTest(file) {
  return /\.(test|spec)\.[jt]sx?$/.test(file);
}

function checkFile(file) {
  const name = relative(file);
  const fileName = path.basename(file);
  const source = fs.readFileSync(file, "utf8");
  const lineCount = source.split(/\r?\n/).length;
  const limit = isTest(file) ? 300 : 150;
  if (!name.endsWith("routeTree.gen.ts") && lineCount > limit) {
    report(file, `${lineCount} lines exceeds the ${limit}-line limit`);
  }
  if (name.endsWith("routeTree.gen.ts")) return;
  if (name.endsWith(".d.ts")) return;
  if (
    name.includes("/infrastructure/schemas/") &&
    fileName.includes("mongoose") &&
    !fileName.endsWith(".mongoose.schema.ts")
  ) {
    report(file, "Mongoose schema files must use the .mongoose.schema.ts suffix");
  }

  const forbidden = [
    [/\bas\s+any\b|:\s*any\b|<any>|\bany\[\]/, "explicit any is forbidden"],
    [/@ts-ignore|@ts-nocheck/, "TypeScript suppression is forbidden"],
    [/_unsafeUnwrap/, "unsafe Result unwrapping is forbidden"],
    [/console\.log\s*\(/, "console.log is forbidden"],
  ];
  for (const [pattern, message] of forbidden) {
    if (pattern.test(source)) report(file, message);
  }
  if (isTest(file)) return;
  if (/\/(application|domain)\//.test(`/${name}`) && /\bthrow\b/.test(source)) {
    report(file, "application/domain code must return Result instead of throwing");
  }
  if (name.endsWith("mongoose.schema.ts")) {
    if (/\b(index|unique)\s*:\s*true|Schema\.index\s*\(/.test(source)) {
      report(file, "database indexes must be declared only in migrations");
    }
  }
  if (name.startsWith("apps/mobile/") && /from\s+["']@repo\/ui/.test(source)) {
    report(file, "mobile must not import the web-only UI package");
  }
  if (!name.includes("/infrastructure/database/") && /from\s+["'][^"']*database\//.test(source)) {
    report(file, "database consumers must import from the public database barrel");
  }
}

function leafKeys(value, prefix = "") {
  return Object.entries(value).flatMap(([key, child]) => {
    const next = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "object" && child !== null) return leafKeys(child, next);
    return [next];
  });
}

function checkLocaleParity() {
  const localeDirectory = path.join(ROOT, "packages/shared/src/i18n/locales");
  const locales = ["en", "es", "fr"].map((locale) => {
    const file = path.join(localeDirectory, `${locale}.json`);
    return { locale, file, keys: new Set(leafKeys(JSON.parse(fs.readFileSync(file, "utf8")))) };
  });
  const expected = locales[0].keys;
  for (const current of locales.slice(1)) {
    const missing = [...expected].filter((key) => !current.keys.has(key));
    const extra = [...current.keys].filter((key) => !expected.has(key));
    if (missing.length) report(current.file, `missing locale keys: ${missing.join(", ")}`);
    if (extra.length) report(current.file, `unexpected locale keys: ${extra.join(", ")}`);
  }
}

function checkTranslationUsage() {
  const englishFile = path.join(ROOT, "packages/shared/src/i18n/locales/en.json");
  const englishKeys = new Set(leafKeys(JSON.parse(fs.readFileSync(englishFile, "utf8"))));
  const translationPattern = /\b(?:t|translate)\(\s*["'`]([^"'`]+)["'`]/g;

  for (const directory of ["apps", "packages"]) {
    for (const file of walk(path.join(ROOT, directory))) {
      if (!CODE_EXTENSIONS.has(path.extname(file)) || isTest(file)) continue;
      const source = fs.readFileSync(file, "utf8");
      for (const match of source.matchAll(translationPattern)) {
        const key = match[1];
        if (key && !englishKeys.has(key)) report(file, `unknown translation key: ${key}`);
      }
    }
  }
}

function checkTenantRepositories() {
  const modulesDirectory = path.join(ROOT, "apps/api/src/modules");
  for (const entry of fs.readdirSync(modulesDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "tenancy") continue;
    const infrastructure = path.join(modulesDirectory, entry.name, "infrastructure");
    if (!fs.existsSync(infrastructure)) continue;
    const files = walk(infrastructure);
    const schemas = files.filter((file) => file.endsWith("mongoose.schema.ts"));
    const isTenantOwned = schemas.some((file) =>
      fs.readFileSync(file, "utf8").includes("tenantId"),
    );
    if (!isTenantOwned) continue;
    for (const file of files.filter((value) => value.endsWith(".repository.ts"))) {
      const source = fs.readFileSync(file, "utf8");
      if (!/extends\s+TenantScopedRepository/.test(source)) {
        report(file, "tenant-owned repositories must extend TenantScopedRepository");
      }
      if (/this\.model\./.test(source)) {
        report(file, "tenant-owned repositories must not bypass scoped base methods");
      }
    }
  }
}

for (const directory of ["apps", "packages"]) {
  for (const file of walk(path.join(ROOT, directory))) {
    if (CODE_EXTENSIONS.has(path.extname(file))) checkFile(file);
  }
}
checkLocaleParity();
checkTranslationUsage();
checkTenantRepositories();

if (failures.length) {
  process.stderr.write(
    `Architecture rule violations (${failures.length}):\n${failures.join("\n")}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write("Architecture rules check passed.\n");
}
