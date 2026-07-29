import { describe, it, expect, vi, beforeEach } from "vitest";
import { I18nService } from "./i18n.service";

describe("I18nService", () => {
  let service: I18nService;

  beforeEach(() => {
    service = new I18nService({
      child: () => ({ info: vi.fn(), debug: vi.fn(), error: vi.fn(), warn: vi.fn() }),
    } as any);
  });

  it("should return default locale when no accept-language header", () => {
    const locale = service.getLocale();
    expect(locale).toBe("en");
  });

  it("should parse locale from accept-language header", () => {
    const locale = service.getLocale("es-ES,es;q=0.9,en;q=0.8");
    expect(locale).toBe("es");
  });

  it("should fallback to default for unsupported locale", () => {
    const locale = service.getLocale("pt-BR,pt;q=0.9");
    expect(locale).toBe("en");
  });

  it("should translate nested key to english", () => {
    const msg = service.translate("api.error.internal", "en");
    expect(msg).toBe("Internal server error");
  });

  it("should translate nested key to spanish", () => {
    const msg = service.translate("api.error.internal", "es");
    expect(msg).toBe("Error interno del servidor");
  });

  it("should translate using t() method", () => {
    const msg = service.t("api.error.notFound", "fr");
    expect(msg).toBe("Ressource non trouvée");
  });

  it("should return key if translation not found", () => {
    const msg = service.t("nonexistent.key");
    expect(msg).toBe("nonexistent.key");
  });

  it("should return supported locales", () => {
    const locales = service.getSupportedLocales();
    expect(locales).toContain("en");
    expect(locales).toContain("es");
    expect(locales).toContain("fr");
  });

  it("should interpolate variables in translation", () => {
    const msg = service.t("dashboard.welcome", "en", { name: "Alice" });
    expect(msg).toBe("Welcome, Alice!");
  });

  it("should keep placeholder if param missing", () => {
    const msg = service.t("dashboard.welcome", "en", {});
    expect(msg).toBe("Welcome, {{name}}!");
  });

  it("should handle multiple interpolation params", () => {
    const msg = service.t("dashboard.welcome", "en", { name: "Bob" });
    expect(msg).toContain("Bob");
  });
});
