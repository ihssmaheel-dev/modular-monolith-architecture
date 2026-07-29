# Internationalization (i18n) Rules

Rules for multi-language support across backend and frontend.

---

## Single Source of Truth

All translations live in `packages/shared/src/i18n/locales/`. One JSON file per language.

```
packages/shared/src/i18n/
├── locales/
│   ├── en.json    ← English (default)
│   ├── es.json    ← Spanish
│   └── fr.json    ← French
└── index.ts       ← Exports locales, DEFAULT_LOCALE, SUPPORTED_LOCALES
```

**Never** hardcode translations in service files, components, or anywhere else.

---

## Backend Rules (`apps/api`)

### I18n Service

- Use `I18nService` from `infrastructure/i18n/` for all translations.
- Translation keys use dot notation: `api.error.notFound`, `user.created`.
- Support variable interpolation: `t("dashboard.welcome", lang, { name: "Alice" })` → `"Welcome, Alice!"`.
- Always pass `Accept-Language` header from controllers to the service.

### Exception Filter

- All HTTP error messages **must** go through `I18nService`.
- Error keys follow the pattern: `api.error.{errorType}`.
- Never hardcode error messages in controllers or filters.

### Controller Pattern

```typescript
// Good
async createUser(body: CreateUserDto, req: FastifyRequest) {
  const acceptLanguage = req.headers["accept-language"];
  const result = await this.userService.createUser(body);
  
  if (result.isErr()) {
    const message = this.i18n.t("api.user.emailTaken", acceptLanguage);
    return { status: 409, body: { message } };
  }
  
  return { status: 201, body: result.value };
}

// Bad — hardcoded message
return { status: 409, body: { message: "Email already taken" } };
```

---

## Frontend Rules (`apps/web`, `apps/mobile`)

### Web (`apps/web`)

- Use `react-i18next` for all user-facing text.
- Import translations from `@repo/shared`.
- Store user language preference in `localStorage`.
- Auto-detect browser language on first visit.
- Never hardcode strings in components.

```tsx
// Good
import { useTranslation } from "react-i18next";

function Dashboard() {
  const { t } = useTranslation();
  return <h1>{t("dashboard.title")}</h1>;
}

// Bad
return <h1>Dashboard</h1>;
```

### Mobile (`apps/mobile`)

- Use `react-i18next` with `AsyncStorage` for persistence.
- Initialize i18n in root `_layout.tsx` before rendering.
- Same translation keys as web.

---

## Translation Key Structure

```json
{
  "common": { "loading", "error", "retry", "save", "cancel" },
  "auth": { "login", "register", "logout", "email", "password" },
  "dashboard": { "title", "welcome", "stats" },
  "users": { "title", "list", "create", "edit", "delete" },
  "settings": { "title", "language", "theme" },
  "errors": { "notFound", "unauthorized", "forbidden", "serverError" },
  "api": {
    "error": { "internal", "notFound", "unauthorized", "badRequest", "conflict" },
    "user": { "created", "updated", "deleted", "notFound", "emailTaken" }
  }
}
```

### Naming Convention

- `common.*` — Universal UI text
- `auth.*` — Authentication flows
- `dashboard.*` — Dashboard screens
- `users.*` — User management
- `settings.*` — Settings screens
- `errors.*` — User-facing error pages
- `api.error.*` — Backend API error messages
- `api.user.*` — User-related API messages

---

## Adding a New Language

1. Create `packages/shared/src/i18n/locales/{locale}.json`.
2. Copy structure from `en.json`.
3. Translate all values (not keys).
4. Add locale to `SUPPORTED_LOCALES` in `packages/shared/src/i18n/index.ts`.
5. Add locale to resources in `apps/web/src/lib/i18n/index.ts`.
6. Add locale to resources in `apps/mobile/lib/i18n/index.ts`.

---

## Adding a New Translation Key

1. Add key to `en.json` first.
2. Add same key to all other locale files (use English as placeholder if needed).
3. Use the key in code via `I18nService.t()` (backend) or `useTranslation().t()` (frontend).

---

## Anti-Patterns

| Violation | Correct Approach |
|-----------|------------------|
| Hardcoded string in component | Use `t("key")` |
| Hardcoded error in controller | Use `I18nService.t("api.error.*")` |
| Translations in service file | Use files in `packages/shared` |
| Missing locale file | Add to all supported locales |
| Console.log for debugging | Use logger, never expose to users |
| Translation key typo | Keys are type-checked via TypeScript |
