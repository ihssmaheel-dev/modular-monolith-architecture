const fs = require("node:fs");
const path = require("node:path");

const webDirectory = path.resolve(__dirname, "../apps/web");
const source = path.join(webDirectory, ".env.example");
const destination = path.join(webDirectory, ".env");

if (!fs.existsSync(destination)) {
  fs.copyFileSync(source, destination);
  process.stdout.write("Created apps/web/.env from .env.example\n");
}
