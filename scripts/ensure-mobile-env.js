const fs = require("node:fs");
const path = require("node:path");

const mobileDirectory = path.resolve(__dirname, "../apps/mobile");
const source = path.join(mobileDirectory, ".env.example");
const destination = path.join(mobileDirectory, ".env");

if (!fs.existsSync(destination)) {
  fs.copyFileSync(source, destination);
  process.stdout.write("Created apps/mobile/.env from .env.example\n");
}
