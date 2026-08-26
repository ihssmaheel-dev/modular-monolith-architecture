# Theming & UI Architecture Rules

**ALL RULES ARE MANDATORY. VIOLATIONS ARE PROHIBITED.**

Rules governing design tokens, UI components, theming presets, and cross-platform visual consistency across `packages/ui`, `packages/design-tokens`, `apps/web`, and `apps/mobile`.

---

## 1. The Supreme Law of Semantic Theming

> [!CAUTION]
> **NEVER HARDCODE HEX/RGB COLORS IN UI COMPONENTS.**
> Every component in `packages/ui`, `apps/web`, and `apps/mobile` must consume **semantic theme variables**. Hardcoding arbitrary hex values (e.g., `bg-[#ffffff]`, `text-[#000000]`) breaks dynamic presets, dark mode, and tenant white-labeling.

---

## 2. Standard Semantic Token Vocabulary

All UI elements must map strictly to the standard shadcn token palette:

| Semantic Class | Purpose / Role |
| :--- | :--- |
| `bg-background` / `text-foreground` | Application canvas surface and default text body |
| `bg-card` / `text-card-foreground` | Elevated card surfaces and card content |
| `bg-popover` / `text-popover-foreground` | Dropdown menus, tooltips, dialogs, popovers |
| `bg-primary` / `text-primary-foreground` | Primary conversion CTAs, active pills, brand anchors |
| `bg-secondary` / `text-secondary-foreground` | Secondary buttons, subtle badges, auxiliary controls |
| `bg-muted` / `text-muted-foreground` | Inactive tabs, disabled states, subtle metadata, captions |
| `bg-accent` / `text-accent-foreground` | Hover highlights, list item focus states, row selection |
| `bg-destructive` / `text-destructive-foreground` | Dangerous actions, critical alerts, error states |
| `border-border` | Standard hairline boundary on cards, tables, dividers |
| `border-input` | Form input, textarea, and combobox boundaries |
| `ring-ring` | Focus outline rings for accessibility |

---

## 3. Interactive Opacity Modifiers

When styling hover and active states for semantic tokens, use **Tailwind opacity modifiers** rather than static color steps:

```tsx
// ❌ FORBIDDEN: Breaks when primary color changes to another hue
<button className="bg-primary hover:bg-[#222222] active:bg-[#000000]">

// ✅ MANDATORY: Dynamically adapts to any primary color preset (Violet, Emerald, etc.)
<button className="bg-primary hover:bg-primary/90 active:bg-primary/95">
```

---

## 4. Proportional Radius Engine

Border radii must never be hardcoded to static pixel values (`rounded-[4px]`). They must scale proportionally from the master `--radius` CSS variable:

```css
@theme inline {
  --radius-xs: calc(var(--radius) * 0.4);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
  --radius-2xl: calc(var(--radius) * 1.8);
}
```

- `rounded-sm`: Canonical radius for buttons, inputs, badges, checkboxes.
- `rounded-md`: Canonical radius for cards, dropdown menus, containers.
- `rounded-lg`: Canonical radius for modals and dialogs.
- `rounded-full`: Reserved **only** for circular avatars and status pills.

---

## 5. Self-Hosted Typography Policy (`@fontsource-variable`)

> [!IMPORTANT]
> **NO EXTERNAL GOOGLE FONTS CDN LINKS IN HTML.**
> All fonts must be installed as npm packages (`@fontsource-variable/geist`, `@fontsource-variable/geist-mono`) and imported into the bundle.
> - Guarantees **0ms external DNS/TLS latency**.
> - Guarantees **100% On-Premise & Air-Gapped Compliance** (zero external dependencies).
> - Fully GDPR compliant.

---

## 6. Compatibility with `ui.shadcn.com/create`

The design architecture must remain 100% compatible with official shadcn theme presets:

1. Any theme generated from **[ui.shadcn.com/create](https://ui.shadcn.com/create)** or **[ui.shadcn.com/themes](https://ui.shadcn.com/themes)** must work immediately upon pasting into `apps/web/src/index.css`.
2. Both **OKLCH** and **HSL** color spaces are supported via Tailwind v4 `@theme inline`.
3. The exact same tokens must synchronize with `apps/mobile/global.css` for React Native parity.

---

## 7. Role of `@repo/design-tokens`

`@repo/design-tokens` is the **typed TypeScript single source of truth** for non-browser runtimes:
- **`apps/mobile`**: React Native `StyleSheet` objects.
- **`packages/email`**: React Email inline CSS generation.
- **`apps/api`**: Automated PDF invoices, canvas image renderers, and SVG charts.
- **Backend Schema Validation**: Validating custom tenant themes stored in PostgreSQL.
