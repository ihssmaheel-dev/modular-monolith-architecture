const fs = require("fs");
const path = require("path");

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Please provide a module name. Usage: pnpm generate:module <name>");
  process.exit(1);
}

if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(moduleName)) {
  console.error("Module names must use lowercase kebab-case.");
  process.exit(1);
}

const basePath = path.join(__dirname, "../apps/api/src/modules", moduleName);
const pascalName = toPascalCase(moduleName);

if (fs.existsSync(basePath)) {
  console.error(`Module '${moduleName}' already exists.`);
  process.exit(1);
}

const folders = [
  "presentation",
  "application/commands",
  "application/queries",
  "application/listeners",
  "domain/entities",
  "domain/value-objects",
  "domain/events",
  "domain/errors",
  "infrastructure/schemas",
];

folders.forEach((folder) => {
  fs.mkdirSync(path.join(basePath, folder), { recursive: true });
});

const moduleFileContent = `import { Module } from "@nestjs/common";
import { ${pascalName}Controller } from "./presentation/${moduleName}.controller";
import { ${pascalName}Repository } from "./infrastructure/${moduleName}.repository";
import { Create${pascalName}Command } from "./application/commands/create-${moduleName}.command";
import { Get${pascalName}Query } from "./application/queries/get-${moduleName}.query";

@Module({
  controllers: [${pascalName}Controller],
  providers: [
    ${pascalName}Repository,
    Create${pascalName}Command,
    Get${pascalName}Query,
  ],
  exports: [
    Create${pascalName}Command,
    Get${pascalName}Query,
  ],
})
export class ${pascalName}Module {}
`;

fs.writeFileSync(path.join(basePath, `${moduleName}.module.ts`), moduleFileContent);

const controllerContent = `import { Controller } from "@nestjs/common";

@Controller("${moduleName}")
export class ${pascalName}Controller {}
`;
fs.writeFileSync(
  path.join(basePath, "presentation", `${moduleName}.controller.ts`),
  controllerContent,
);

const commandContent = `import { Injectable } from "@nestjs/common";
import { ok, type Result } from "neverthrow";

@Injectable()
export class Create${pascalName}Command {
  async execute(): Promise<Result<void, never>> {
    return ok(undefined);
  }
}
`;
fs.writeFileSync(
  path.join(basePath, "application/commands", `create-${moduleName}.command.ts`),
  commandContent,
);

const queryContent = `import { Injectable } from "@nestjs/common";
import { ok, type Result } from "neverthrow";

@Injectable()
export class Get${pascalName}Query {
  async execute(): Promise<Result<void, never>> {
    return ok(undefined);
  }
}
`;
fs.writeFileSync(
  path.join(basePath, "application/queries", `get-${moduleName}.query.ts`),
  queryContent,
);

const repositoryContent = `import { Injectable } from "@nestjs/common";

@Injectable()
export class ${pascalName}Repository {}
`;
fs.writeFileSync(
  path.join(basePath, "infrastructure", `${moduleName}.repository.ts`),
  repositoryContent,
);

console.log(`Successfully generated strict architecture for module '${moduleName}'!`);

function toPascalCase(value) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
