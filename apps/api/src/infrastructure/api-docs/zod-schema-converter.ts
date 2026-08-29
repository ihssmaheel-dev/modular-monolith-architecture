import { z } from "zod";

export class Zod4SchemaConverter {
  condition(schema: unknown): boolean {
    return schema !== undefined && schema !== null;
  }

  convert(schema: unknown): [boolean, Record<string, unknown>] {
    const s = schema as {
      def?: { type?: string; options?: unknown[] };
      isOptional?: () => boolean;
    };

    const type = s?.def?.type;
    if (type === "undefined" || type === "void" || type === "never") {
      return [false, { type: "null" }];
    }

    try {
      const json = z.toJSONSchema(schema as z.ZodType);
      const clean = { ...(json as Record<string, unknown>) };
      delete clean["$schema"];
      const isOptional =
        type === "optional" || (typeof s.isOptional === "function" && s.isOptional());
      return [!isOptional, clean];
    } catch {
      return this.handleFallback(s);
    }
  }

  private handleFallback(s: {
    def?: { type?: string; options?: unknown[] };
  }): [boolean, Record<string, unknown>] {
    if (s.def?.type === "union" && Array.isArray(s.def.options)) {
      const filtered = s.def.options.filter(
        (opt: unknown) =>
          (opt as { def?: { type?: string } })?.def?.type !== "undefined" &&
          (opt as { def?: { type?: string } })?.def?.type !== "void",
      );
      if (filtered.length === 1) {
        return this.convert(filtered[0]);
      }
      if (filtered.length > 1) {
        return this.convert(z.union(filtered as [z.ZodType, z.ZodType, ...z.ZodType[]]));
      }
    }
    return [false, {}];
  }
}
