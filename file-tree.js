import fs from "node:fs";
import path from "node:path";

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  ".idea",
  ".vscode",
]);

const IGNORE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".ico",
  ".svg",
  ".pdf",
  ".zip",
  ".gz",
  ".mp4",
  ".mp3",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".lock",
]);

function countLines(file) {
  try {
    const content = fs.readFileSync(file, "utf8");
    if (!content.trim()) return 0;
    return content.split(/\r?\n/).length;
  } catch {
    return 0;
  }
}

function buildTree(dir) {
  const stat = fs.statSync(dir);

  if (stat.isFile()) {
    return {
      name: path.basename(dir),
      type: "file",
      lines: countLines(dir),
    };
  }

  const children = [];
  let totalLines = 0;

  for (const entry of fs.readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;

    const full = path.join(dir, entry);
    const s = fs.statSync(full);

    if (s.isDirectory()) {
      const child = buildTree(full);
      children.push(child);
      totalLines += child.lines;
    } else {
      if (IGNORE_EXTENSIONS.has(path.extname(entry).toLowerCase())) {
        continue;
      }

      const lines = countLines(full);

      children.push({
        name: entry,
        type: "file",
        lines,
      });

      totalLines += lines;
    }
  }

  children.sort((a, b) => {
    if (a.type === b.type) return b.lines - a.lines;
    return a.type === "directory" ? -1 : 1;
  });

  return {
    name: path.basename(dir),
    type: "directory",
    lines: totalLines,
    children,
  };
}

function printTree(node, prefix = "") {
  const icon = node.type === "directory" ? "📁" : "📄";

  console.log(`${prefix}${icon} ${node.name} (${node.lines} LOC)`);

  if (!node.children) return;

  node.children.forEach((child, index) => {
    const last = index === node.children.length - 1;
    const branch = last ? "└── " : "├── ";
    const nextPrefix = prefix + (last ? "    " : "│   ");

    process.stdout.write(prefix + branch);
    printTree(child, nextPrefix);
  });
}

const target = process.argv[2] || process.cwd();

const tree = buildTree(target);

console.log(JSON.stringify(tree, null, 2));
printTree(tree);