# Theming & Reskin Guide — 1-Click Preset System

> **SSOT:** `packages/design-tokens/src/presets/active.json` → `scripts/generate-tokens.mjs` → `apps/web/src/index.css` + `apps/mobile/global.css` + `packages/email/src/styles/tokens.ts` + `packages/design-tokens/src/colors.ts` (JS fallback for RN). Never edit generated CSS manually.

## 30-Second Reskin

```bash
# 1. Pick a preset from ui.shadcn.com/themes (Copy → JSON) or use built-ins
pnpm theme:list           # lists default, rose, slate
# 2. Apply
pnpm theme:apply rose     # copies rose.json → active.json + regenerates all
pnpm dev:web              # instant new palette
# 3. Commit
git add packages/design-tokens/src/presets/active.json apps/web/src/index.css apps/mobile/global.css packages/email/src/styles/tokens.ts
git commit -m "feat(theme): apply rose preset"
```

Paste any `ui.shadcn.com/create` JSON: save as `packages/design-tokens/src/presets/my.json` then `pnpm theme:apply my`.

## Preset JSON Shape (`active.json`)

```json
{
  "name": "default",
  "label": "Default",
  "radius": "0.5rem",
  "fonts": { "sans": "'Geist', ...", "heading": "...", "mono": "..." },
  "light": { "background": "oklch(1 0 0)", "primary": "oklch(0.145 0 0)", "accent-purple": "#7a3dff", "info": "#146ef5", ... },
  "dark": { "background": "oklch(0.145 0 0)", ... },
  "shadows": { "layered": "0 84px...", "modal": "0 24px..." }
}
```

*   `light`/`dark` — OKLCH/HSL/RGB/hex all supported via `@theme inline` (Tailwind v4).
*   `accent-*` + `info/warning/success` — 5-stop chromatic + semantic badge colors → `--color-accent-purple` etc.
*   `radius` — master `--radius` scales `--radius-sm: calc(var(--radius)*0.6)` etc. across 27+ ui components.
*   `fonts` — `--font-sans/heading/mono` → `body { font-family: var(--font-sans) }` `index.css:162`.

## Generated Files — Do Not Edit

| File | Generated From | Contains |
|---|---|---|
| `apps/web/src/index.css` | `active.json` + `@theme inline` bridge | `:root` light vars, `.dark` vars, `--radius` calc, `--font-*`, `.shadow-layered` |
| `apps/mobile/global.css` | same | byte-identical core + `@layer utilities` shadows/eyebrow for RN parity |
| `packages/email/src/styles/tokens.ts` | same | `export const emailTokens` for React Email `Tailwind` config |
| `packages/design-tokens/src/colors.ts` header | same | `brandColors` mirrored for JS consumers (RN StyleSheet fallback) |

Header: `/* GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate */`

## Component Contract

*   Use semantic tokens only: `bg-primary`, `bg-card`, `bg-muted`, `text-foreground`, `border-border`, `bg-accent-purple`, `bg-info`, `shadow-layered`, `shadow-modal`, `rounded-sm/md/lg`, `text-muted-foreground`.
*   **Forbidden:** `bg-[#7a3dff]`, `text-[#080808]`, `shadow-[0_84px_rgba(0,0,0]` outside `index.css`/`colors.ts`. Enforced by `scripts/check-rules.js` `checkThemingGuardrails()` — CI fails.
*   Use `cn()` from `packages/ui/src/lib/utils.ts` for all class merges.

## Adding a New Preset

1. Visit https://ui.shadcn.com/themes → choose → Copy JSON (light/dark + radius).
2. Merge `accent-*` from default or pick new hex.
3. Save `packages/design-tokens/src/presets/<name>.json`.
4. `pnpm theme:apply <name>` + visual QA `pnpm dev:web` → light/dark toggle.

## Troubleshooting

*   `generated CSS does not match active preset` — run `pnpm theme:generate`.
*   Preset JSON missing keys → `scripts/generate-tokens.mjs` exits `Invalid preset: missing "light"`.
*   Hard hex CI error → replace with `bg-accent-*` / `bg-info` etc.

## Cross-Platform Notes

*   Web reads CSS vars `var(--primary)`; Mobile reads same `global.css` via NativeWind + JS fallback `brandColors` for `StyleSheet` where CSS var not supported.
*   Email must import `emailTokens.light.primary` for inline styles.
*   Dark mode via `class="dark"` on `document.documentElement` (`hooks/use-theme.ts`), both apps share `:root/.dark`.
