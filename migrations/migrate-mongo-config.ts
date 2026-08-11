import "dotenv/config";

const mongoUrl = process.env.MONGODB_URI ?? "mongodb://localhost:27017/monorepo";
const databaseName = decodeURIComponent(new URL(mongoUrl).pathname.slice(1)) || "monorepo";

const config = {
  mongodb: {
    url: mongoUrl,
    databaseName,
  },
  migrationsDir: __dirname,
  changelogCollectionName: "migration_changelog",
  migrationFileExtension: ".ts",
  useFileHash: false,
  moduleSystem: "commonjs",
};

module.exports = config;
