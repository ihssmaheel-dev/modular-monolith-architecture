# Theming & Reskin Guide — 1-Click Preset System

> **SSOT:** `packages/design-tokens/src/presets/active.json` → `scripts/generate-tokens.mjs` → `apps/web/src/index.css` + `apps/mobile/global.css` + `packages/email/src/styles/tokens.ts` + `packages/design-tokens/src/colors.ts` (JS fallback for RN). Never edit generated CSS manually.

## 30-Second Reskin (Any shadcn Preset)

```bash
# Built-in presets
pnpm theme:list           # default, rose, slate
pnpm theme:apply rose     # copies rose.json → active.json + regenerates all
pnpm dev:web              # instant new palette

# ANY shadcn preset — auto-converted (ui.shadcn.com, tweakcn.com, v0, etc.)
# Option A: paste file
pnpm theme:apply ./my-shadcn.json          # raw JSON from shadcn → auto-normalized
# Option B: fetch URL
pnpm theme:apply https://tweakcn.com/themes/slate.json
# Option C: manual save
# 1. ui.shadcn.com/themes → pick → Copy JSON  (or tweakcn.com → Export → JSON)
# 2. Save as packages/design-tokens/src/presets/my.json
# 3. pnpm theme:apply my

# Commit (all 6 files)
git add packages/design-tokens/src/presets/active.json apps/web/src/index.css apps/mobile/global.css packages/design-tokens/src/colors.ts packages/design-tokens/src/tokens.ts packages/email/src/styles/tokens.ts
git commit -m "feat(theme): apply slate shadcn preset"
```

Supported shadcn shapes (auto-detected): `{ light, dark, radius }` (ours), `{ cssVars: { light, dark } }` (registry theme), `{ theme: { light, dark } }`, or flat `{ background, foreground, primary, ... }`. Bare HSL `"0 0% 100%"` is auto-wrapped to `hsl(0 0% 100%)`. Missing `accent-purple/pink/blue/orange/green` + `info/warning/success` + `chart-1…5` + `sidebar-*` auto-filled from `default.json` — so any shadcn theme reskins standard tokens and keeps category palette working.

Via `pnpm theme:import ./shadcn.json` (alias for `theme:apply` file import).

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
| `packages/design-tokens/src/colors.ts` | same | `colors.light/dark` + `brandColors` JS mirror (RN `hsl()` fallback) |
| `packages/design-tokens/src/tokens.ts` | same | `radius` `shadows` `typography` JS mirror (calc(var(--radius)*0.6) etc.) |

Header: `// GENERATED — do not edit manually — source: packages/design-tokens/src/presets/active.json — run pnpm theme:generate` (JS) and `/* GENERATED */` (CSS)

## Component Contract

*   Use semantic tokens only: `bg-primary`, `bg-card`, `bg-muted`, `text-foreground`, `border-border`, `bg-accent-purple`, `bg-info`, `shadow-layered`, `shadow-modal`, `rounded-sm/md/lg`, `text-muted-foreground`.
*   **Forbidden:** `bg-[#7a3dff]`, `text-[#080808]`, `shadow-[0_84px_rgba(0,0,0]` outside `index.css`/`colors.ts`. Enforced by `scripts/check-rules.js` `checkThemingGuardrails()` — CI fails.
*   Use `cn()` from `packages/ui/src/lib/utils.ts` for all class merges.

## Adding a New Preset

1. Visit https://ui.shadcn.com/themes or https://tweakcn.com → choose → Copy JSON (light/dark + radius). Or `ui.shadcn.com/create` → Copy Code → JSON.
2. Run `pnpm theme:apply ./downloaded.json` — converter handles `cssVars.light` / `theme` / flat shapes and fills `accent-*` fallbacks automatically. No manual merge needed (custom palette can be overridden later in the generated preset file if you want).
3. Or manually: save `packages/design-tokens/src/presets/<name>.json` then `pnpm theme:apply <name>` + visual QA `pnpm dev:web` → light/dark toggle.

## Troubleshooting

*   `generated CSS does not match active preset` — run `pnpm theme:generate`.
*   Preset JSON missing keys → `scripts/generate-tokens.mjs` exits `Invalid preset: missing "light"`.
*   Hard hex CI error → replace with `bg-accent-*` / `bg-info` etc.

## Cross-Platform Notes

*   Web reads CSS vars `var(--primary)`; Mobile reads same `global.css` via NativeWind + JS fallback `brandColors` for `StyleSheet` where CSS var not supported.
*   Email must import `emailTokens.light.primary` for inline styles.
*   Dark mode via `class="dark"` on `document.documentElement` (`hooks/use-theme.ts`), both apps share `:root/.dark`.
