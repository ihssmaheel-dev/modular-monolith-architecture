const fs = require("fs");
const path = require("path");

function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function toCamelCase(str) {
  const p = toPascalCase(str);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function toPlural(str) {
  if (str.endsWith("y") && !str.endsWith("ey") && !str.endsWith("ay") && !str.endsWith("oy")) {
    return str.slice(0, -1) + "ies";
  }
  if (str.endsWith("s") || str.endsWith("x") || str.endsWith("ch") || str.endsWith("sh")) {
    return str + "es";
  }
  return str + "s";
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function writeFileIfMissing(filePath, content) {
  ensureDir(path.dirname(filePath));
  if (fs.existsSync(filePath)) {
    console.log(`  [skip] Already exists: ${path.relative(process.cwd(), filePath)}`);
    return false;
  }
  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
  console.log(`  [create] ${path.relative(process.cwd(), filePath)}`);
  return true;
}

function writeFileIfMissingOrScaffold(filePath, content, scaffoldMarker) {
  ensureDir(path.dirname(filePath));
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
    console.log(`  [create] ${path.relative(process.cwd(), filePath)}`);
    return true;
  }

  const existing = fs.readFileSync(filePath, "utf8");
  if (!existing.includes(scaffoldMarker)) {
    console.log(`  [skip] Existing customized file: ${path.relative(process.cwd(), filePath)}`);
    return false;
  }

  fs.writeFileSync(filePath, content.trim() + "\n", "utf8");
  console.log(`  [update] Replaced scaffold: ${path.relative(process.cwd(), filePath)}`);
  return true;
}

function appendExportIfMissing(filePath, exportStatement) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, exportStatement.trim() + "\n", "utf8");
    return;
  }
  const content = fs.readFileSync(filePath, "utf8");
  if (!content.includes(exportStatement.trim())) {
    fs.writeFileSync(filePath, content.trim() + "\n" + exportStatement.trim() + "\n", "utf8");
    console.log(`  [update] Added export to ${path.relative(process.cwd(), filePath)}`);
  }
}

module.exports = {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toPlural,
  ensureDir,
  writeFileIfMissing,
  writeFileIfMissingOrScaffold,
  appendExportIfMissing,
};
