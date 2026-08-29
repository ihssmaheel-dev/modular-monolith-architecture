const path = require("path");
const { writeFileIfMissing, appendExportIfMissing } = require("./utils");

function generateClient({ clientPath, feature, Feature, featurePlural, FeaturePlural }) {
  const subclientContent = `import type {
  Create${Feature}Dto,
  ${Feature}ListResponseDto,
  ${Feature}ResponseDto,
  PaginationQuery,
  Update${Feature}Dto,
} from "@repo/contracts";
import type { FetchFn } from "../types";

export function create${FeaturePlural}Client(fetchFn: FetchFn) {
  return {
    list: (req: { query?: PaginationQuery } = {}) => {
      const sp = new URLSearchParams();
      if (req.query?.page) sp.set("page", String(req.query.page));
      if (req.query?.limit) sp.set("limit", String(req.query.limit));
      const qs = sp.toString();
      return fetchFn<${Feature}ListResponseDto>(\`/${featurePlural}\${qs ? \`?\${qs}\` : ""}\`);
    },
    getById: (req: { params: { id: string } }) =>
      fetchFn<${Feature}ResponseDto>(\`/${featurePlural}/\${encodeURIComponent(req.params.id)}\`),
    create: (req: { body: Create${Feature}Dto }) =>
      fetchFn<${Feature}ResponseDto>("/${featurePlural}", {
        method: "POST",
        body: JSON.stringify(req.body),
      }),
    update: (req: { params: { id: string }; body: Update${Feature}Dto }) =>
      fetchFn<${Feature}ResponseDto>(\`/${featurePlural}/\${encodeURIComponent(req.params.id)}\`, {
        method: "PATCH",
        body: JSON.stringify(req.body),
      }),
    delete: (req: { params: { id: string } }) =>
      fetchFn<void>(\`/${featurePlural}/\${encodeURIComponent(req.params.id)}\`, {
        method: "DELETE",
      }),
  };
}
`;

  writeFileIfMissing(
    path.join(clientPath, "src", "subclients", `${featurePlural}.ts`),
    subclientContent,
  );
  appendExportIfMissing(
    path.join(clientPath, "src", "subclients", "index.ts"),
    `export * from "./${featurePlural}";`,
  );
}

module.exports = { generateClient };
