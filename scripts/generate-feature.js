const path = require("path");
const { toPascalCase, toKebabCase, toPlural, ensureDir } = require("./generators/utils");
const { generateDomain } = require("./generators/domain.generator");
const { generateInfrastructure } = require("./generators/infrastructure.generator");
const { generateApplication } = require("./generators/application.generator");
const { generateContracts } = require("./generators/contracts.generator");
const { generateClient } = require("./generators/client.generator");
const { generatePresentation } = require("./generators/presentation.generator");
const { generateFrontend } = require("./generators/frontend.generator");

const rawModule = process.argv[2];
const rawFeature = process.argv[3] || rawModule;

if (!rawModule) {
  console.error("Error: Module name is required.");
  console.error("Usage: pnpm generate:feature <module> [feature]");
  console.error("Example: pnpm generate:feature tasks task");
  process.exit(1);
}

const moduleName = toKebabCase(rawModule);
const ModuleName = toPascalCase(moduleName);

const feature = toKebabCase(rawFeature);
const Feature = toPascalCase(feature);
const featurePlural = toPlural(feature);
const FeaturePlural = toPascalCase(featurePlural);

console.log("\n=======================================================");
console.log("  Full-Stack Vertical Slice Generator");
console.log(`  Module:  ${moduleName} (${ModuleName}Module)`);
console.log(`  Feature: ${feature} (${Feature} / ${FeaturePlural})`);
console.log("=======================================================\n");

const rootPath = path.resolve(__dirname, "..");
const modulePath = path.join(rootPath, "apps", "api", "src", "modules", moduleName);
const contractsPath = path.join(rootPath, "packages", "contracts");
const clientPath = path.join(rootPath, "packages", "api-client");
const webPath = path.join(rootPath, "apps", "web");

const context = {
  modulePath,
  moduleName,
  ModuleName,
  feature,
  Feature,
  featurePlural,
  FeaturePlural,
  contractsPath,
  clientPath,
  webPath,
};

console.log("1. Generating Domain Layer...");
generateDomain(context);

console.log("\n2. Generating Infrastructure Layer...");
generateInfrastructure(context);

console.log("\n3. Generating Application Layer (Commands, Queries, Listeners, Vitest Tests)...");
generateApplication(context);

console.log("\n4. Generating Contracts & Schemas (@repo/contracts)...");
generateContracts(context);

console.log("\n5. Generating API Client SDK (@repo/api-client)...");
generateClient(context);

console.log("\n6. Generating Presentation Layer (Fastify Controller, Mapper, NestJS Module)...");
generatePresentation(context);

console.log("\n7. Generating Frontend Layer (TanStack Query hooks, React UI Form & List)...");
generateFrontend(context);

console.log("\n=======================================================");
console.log(`  Successfully generated vertical slice for '${feature}'!`);
console.log("=======================================================");
console.log("\nNext Steps:");
console.log(` 1. Register ${ModuleName}Module in 'apps/api/src/app.module.ts'.`);
console.log(` 2. Run 'pnpm db:generate && pnpm db:migrate' to create table migrations.`);
console.log(` 3. Run 'pnpm test:unit' to run the new Vitest unit test suite.`);
console.log(" 4. Run 'pnpm build' to verify end-to-end type safety.\n");
