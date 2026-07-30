const fs = require('fs');
const path = require('path');

const moduleName = process.argv[2];

if (!moduleName) {
  console.error("Please provide a module name. Usage: npm run generate:module <name>");
  process.exit(1);
}

const basePath = path.join(__dirname, '../apps/api/src/modules', moduleName);

if (fs.existsSync(basePath)) {
  console.error(`Module '${moduleName}' already exists.`);
  process.exit(1);
}

const folders = [
  'presentation',
  'application/commands',
  'application/queries',
  'application/listeners',
  'domain/entities',
  'domain/value-objects',
  'domain/events',
  'domain/errors',
  'infrastructure/schemas'
];

folders.forEach(folder => {
  fs.mkdirSync(path.join(basePath, folder), { recursive: true });
});

// Create Module File
const moduleFileContent = `import { Module } from "@nestjs/common";
import { ${capitalize(moduleName)}Controller } from "./presentation/${moduleName}.controller";
import { ${capitalize(moduleName)}Repository } from "./infrastructure/${moduleName}.repository";
import { Create${capitalize(moduleName)}Command } from "./application/commands/create-${moduleName}.command";
import { Get${capitalize(moduleName)}Query } from "./application/queries/get-${moduleName}.query";

@Module({
  controllers: [${capitalize(moduleName)}Controller],
  providers: [
    ${capitalize(moduleName)}Repository,
    Create${capitalize(moduleName)}Command,
    Get${capitalize(moduleName)}Query
  ],
  exports: [
    ${capitalize(moduleName)}Repository,
    Create${capitalize(moduleName)}Command,
    Get${capitalize(moduleName)}Query
  ],
})
export class ${capitalize(moduleName)}Module {}
`;

fs.writeFileSync(path.join(basePath, `${moduleName}.module.ts`), moduleFileContent);

// Create Controller File
const controllerContent = `import { Controller } from "@nestjs/common";
import { I18nService } from "../../../infrastructure/i18n/i18n.service";
import { Create${capitalize(moduleName)}Command } from "../application/commands/create-${moduleName}.command";
import { Get${capitalize(moduleName)}Query } from "../application/queries/get-${moduleName}.query";

@Controller("${moduleName}")
export class ${capitalize(moduleName)}Controller {
  constructor(
    private readonly createCommand: Create${capitalize(moduleName)}Command,
    private readonly getQuery: Get${capitalize(moduleName)}Query,
    private readonly i18n: I18nService
  ) {}
}
`;
fs.writeFileSync(path.join(basePath, 'presentation', `${moduleName}.controller.ts`), controllerContent);

// Create Command File
const commandContent = `import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { ${capitalize(moduleName)}Repository } from "../../infrastructure/${moduleName}.repository";

@Injectable()
export class Create${capitalize(moduleName)}Command {
  constructor(private readonly repository: ${capitalize(moduleName)}Repository) {}

  async execute(): Promise<Result<void, never>> {
    return ok(undefined);
  }
}
`;
fs.writeFileSync(path.join(basePath, 'application/commands', `create-${moduleName}.command.ts`), commandContent);

// Create Query File
const queryContent = `import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";
import { ${capitalize(moduleName)}Repository } from "../../infrastructure/${moduleName}.repository";

@Injectable()
export class Get${capitalize(moduleName)}Query {
  constructor(private readonly repository: ${capitalize(moduleName)}Repository) {}

  async execute(): Promise<Result<void, never>> {
    return ok(undefined);
  }
}
`;
fs.writeFileSync(path.join(basePath, 'application/queries', `get-${moduleName}.query.ts`), queryContent);

// Create Repository File
const repoContent = `import { Injectable } from "@nestjs/common";
import { ok, err, Result } from "neverthrow";

@Injectable()
export class ${capitalize(moduleName)}Repository {
  constructor() {}
}
`;
fs.writeFileSync(path.join(basePath, 'infrastructure', `${moduleName}.repository.ts`), repoContent);

console.log(`Successfully generated strict architecture for module '${moduleName}'!`);

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
