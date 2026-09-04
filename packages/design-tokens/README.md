# Design Tokens — Single Source of Truth

One file controls all surfaces: `src/presets/active.json`.

```bash
pnpm theme:generate # regenerate web + email + mobile
pnpm theme:check    # CI guard — fails if generated files are stale
```

## Source

`src/presets/active.json` (Zod `tokensSchema`):

```json
{
  "version": 1,
  "radius": "0.625rem",
  "fonts": { "sans": "...", "heading": "...", "mono": "..." },
  "shadows": { "layered": "...", "layered-strong": "...", "modal": "..." },
  "brand": { "purple": "#6366f1", "pink": "#ec4899", "blue": "#3b82f6", "orange": "#f59e0b", "green": "#10b981", "info": "#3b82f6", "warning": "#f59e0b", "success": "#10b981" },
  "light": { "background": "oklch(1 0 0)", "foreground": "oklch(0.145 0 0)", "primary": "oklch(0.205 0 0)", ... },
  "dark": { "background": "oklch(0.145 0 0)", ... }
}
```

## Mapping

| Token | Web | Mobile | Email |
|-------|-----|--------|-------|
| `light.background/foreground/card/...` | `packages/ui/src/styles/tokens.generated.css` `:root { --background }` | `apps/mobile/src/theme/tokens.generated.ts` `mobileTokens.light.background` → `#ffffff` hex | `packages/email/src/styles/tokens.ts` `emailTokens.light.background` |
| `dark.*` | `.dark { --background }` | `mobileTokens.dark` | `emailTokens.dark` |
| `brand.purple` | used for `sidebar-primary` variant | `brandPurple` in `tailwind.tokens.generated.js` | `emailTokens.light.primary/ring/sidebar-primary` derived from `brand.purple` via `hexToOklch` (CTA stays brand) |
| `radius/fonts/shadows` | CSS vars + `@theme inline` | `mobileTokens.radius/fonts/shadows` | `emailTokens.radius/fonts/shadows` |

## Reskin workflow

1. Edit `src/presets/active.json` — change `light.primary` to recolor web buttons, change `brand.purple` to recolor email CTA + mobile brand.
2. Run `pnpm theme:generate` — regenerates 4 files (never hand-edit them).
3. Rebuild `pnpm --filter web build && pnpm --filter mobile build` — no component code changes needed.
4. Commit `active.json` + generated files together.

Dark mode: web `ThemeProvider` (`localStorage` + `matchMedia` + `d` key), mobile `useThemeStore` (`SecureStore` + `useColorScheme`) + `ThemeProvider` (`dark` class for NativeWind). Both read same `light/dark` source.

## Guards

- `pnpm theme:check` is part of `pnpm rules:check` and CI.
- `scripts/check-rules.js` bans `slate-*/bg-white/@repo/ui-in-mobile` and checks generated headers.
- Generator validates contrast (WCAG 4.5) for `primary` vs `primary-foreground` and `foreground` vs `background` — fails if ratio < 4.5.
- Splash `apps/mobile/app.json` background is synced from `tokens.light.background` on generate.
