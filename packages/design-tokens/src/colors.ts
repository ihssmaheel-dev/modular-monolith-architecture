/**
 * Design Tokens — Single source of truth for color decisions.
 *
 * Inspired by Webflow's confident, engineered visual language:
 * - Canvas: Pure White (#ffffff)
 * - Primary Conversion / Ink: Deep Near-Black (#080808)
 * - Hairline: 1px Solid Border (#d8d8d8)
 * - 5-Stop Chromatic Category Accents: Purple, Pink, Blue, Orange, Green
 */
export const colors = {
  light: {
    background: "0 0% 100%", // #ffffff
    foreground: "0 0% 3.1%", // #080808 ink
    primary: "0 0% 3.1%", // #080808 primary CTA
    "primary-foreground": "0 0% 100%", // #ffffff
    secondary: "0 0% 96.5%", // #f6f6f6
    "secondary-foreground": "0 0% 3.1%", // #080808
    muted: "0 0% 96.5%", // #f6f6f6
    "muted-foreground": "0 0% 35.3%", // #5a5a5a body-mid
    accent: "0 0% 96.5%", // #f6f6f6
    "accent-foreground": "0 0% 3.1%", // #080808
    destructive: "353 87% 52%", // #ee1d36
    "destructive-foreground": "0 0% 100%",
    border: "0 0% 84.7%", // #d8d8d8 hairline
    input: "0 0% 84.7%", // #d8d8d8 hairline
    ring: "0 0% 3.1%", // #080808
    card: "0 0% 100%", // #ffffff
    "card-foreground": "0 0% 3.1%", // #080808
    popover: "0 0% 100%",
    "popover-foreground": "0 0% 3.1%",
  },
  dark: {
    background: "0 0% 5%",
    foreground: "0 0% 98%",
    primary: "0 0% 98%",
    "primary-foreground": "0 0% 3.1%",
    secondary: "0 0% 12%",
    "secondary-foreground": "0 0% 98%",
    muted: "0 0% 12%",
    "muted-foreground": "0 0% 65%",
    accent: "0 0% 12%",
    "accent-foreground": "0 0% 98%",
    destructive: "353 87% 52%",
    "destructive-foreground": "0 0% 100%",
    border: "0 0% 20%",
    input: "0 0% 20%",
    ring: "0 0% 80%",
    card: "0 0% 7%",
    "card-foreground": "0 0% 98%",
    popover: "0 0% 7%",
    "popover-foreground": "0 0% 98%",
  },
} as const;

/**
 * 5-Stop Chromatic Category Accents & Brand Spectrum
 */
export const brandColors = {
  ink: "#080808",
  inkStrong: "#222222",
  body: "#363636",
  bodyMid: "#5a5a5a",
  mute: "#898989",
  muteSoft: "#ababab",
  canvas: "#ffffff",
  hairline: "#d8d8d8",
  // 5-Stop Chromatic Category Palette
  accentPurple: "#7a3dff",
  accentPink: "#ed52cb",
  accentBlue: "#3b89ff",
  accentOrange: "#ff6b00",
  accentGreen: "#00d722",
  // Semantic Accents
  accentBlueDeep: "#006acc",
  accentBlueInfo: "#146ef5",
  accentYellow: "#ffae13",
  accentRed: "#ee1d36",
} as const;

export type Theme = "light" | "dark";
export type ColorToken = keyof typeof colors.light;
