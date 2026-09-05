const fs = require("fs");
const path = require("path");
const { writeFileIfMissing, appendExportIfMissing } = require("./utils");

function generateContracts({ contractsPath, feature, Feature, featurePlural, FeaturePlural }) {
  const schemaContent = `import { z } from "zod";

export const Create${Feature}Schema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
});

export const Update${Feature}Schema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
});

export const ${Feature}ResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdBy: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  tenantId: z.string().optional(),
});

export const ${Feature}ListResponseSchema = z.object({
  items: z.array(${Feature}ResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type Create${Feature}Dto = z.infer<typeof Create${Feature}Schema>;
export type Update${Feature}Dto = z.infer<typeof Update${Feature}Schema>;
export type ${Feature}ResponseDto = z.infer<typeof ${Feature}ResponseSchema>;
export type ${Feature}ListResponseDto = z.infer<typeof ${Feature}ListResponseSchema>;
`;

  const contractContent = `import { oc } from "@orpc/contract";
import { z } from "zod";
import { PaginationQuerySchema } from "../schemas/pagination.schema";
import {
  Create${Feature}Schema,
  ${Feature}ListResponseSchema,
  ${Feature}ResponseSchema,
  Update${Feature}Schema,
} from "../schemas/${feature}.schema";
import { EmptyResponseSchema } from "../schemas/common.schema";

export const ${featurePlural}Contract = oc.prefix("/${featurePlural}").router({
  list: oc
    .route({ method: "GET", path: "/" })
    .input(PaginationQuerySchema)
    .output(${Feature}ListResponseSchema),

  getById: oc
    .route({ method: "GET", path: "/{id}" })
    .input(z.object({ id: z.string().min(1) }))
    .output(${Feature}ResponseSchema),

  create: oc
    .route({ method: "POST", path: "/", successStatus: 201 })
    .input(Create${Feature}Schema)
    .output(${Feature}ResponseSchema),

  update: oc
    .route({ method: "PATCH", path: "/{id}" })
    .input(z.object({ id: z.string().min(1) }).and(Update${Feature}Schema))
    .output(${Feature}ResponseSchema),

  delete: oc
    .route({ method: "DELETE", path: "/{id}", successStatus: 204 })
    .input(z.object({ id: z.string().min(1) }))
    .output(EmptyResponseSchema),
});
`;

  writeFileIfMissing(
    path.join(contractsPath, "src", "schemas", `${feature}.schema.ts`),
    schemaContent,
  );
  writeFileIfMissing(
    path.join(contractsPath, "src", "contracts", `${featurePlural}.contract.ts`),
    contractContent,
  );

  appendExportIfMissing(
    path.join(contractsPath, "src", "schemas", "index.ts"),
    `export * from "./${feature}.schema";`,
  );
  appendExportIfMissing(
    path.join(contractsPath, "src", "contracts", "index.ts"),
    `export * from "./${featurePlural}.contract";`,
  );
  registerApiContract({ contractsPath, featurePlural });
}

function registerApiContract({ contractsPath, featurePlural }) {
  const registryPath = path.join(contractsPath, "src", "contracts", "index.ts");
  if (!fs.existsSync(registryPath)) return;

  let registry = fs.readFileSync(registryPath, "utf8");
  const importLine = `import { ${featurePlural}Contract } from "./${featurePlural}.contract";`;
  if (!registry.includes(importLine)) {
    const anchor = 'import { membershipsContract } from "./memberships.contract";';
    registry = registry.includes(anchor)
      ? registry.replace(anchor, `${importLine}\n${anchor}`)
      : `${importLine}\n${registry}`;
  }

  const routeLine = `  ${featurePlural}: ${featurePlural}Contract,`;
  if (!registry.includes(routeLine)) {
    const anchor = "  memberships: membershipsContract,";
    registry = registry.includes(anchor)
      ? registry.replace(anchor, `${routeLine}\n${anchor}`)
      : registry.replace(
          "export const apiContract = oc.router({",
          `export const apiContract = oc.router({\n${routeLine}`,
        );
  }

  fs.writeFileSync(registryPath, registry, "utf8");
}

module.exports = { generateContracts };
