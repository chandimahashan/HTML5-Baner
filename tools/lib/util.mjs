// Shared helpers for the banner generator.
import { ICONS } from "./icons.mjs";

export const GSAP_URL = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
export const GSAP_KB = { min: 69.8, gzip: 27.1 }; // measured from the cdnjs file above
export const CLICK_URL = "https://www.google.com";

// Animation budget: 6s timeline, played twice with a 1s pause = 13s (< 15s max), then rests on the end frame.
export const LOOP = 6;
export const PLAYS = 2;
export const GAP = 1;
export const TOTAL = LOOP * PLAYS + GAP;

export const SIZES = {
  "300x250": { w: 300, h: 250, name: "Medium Rectangle" },
  "728x90": { w: 728, h: 90, name: "Leaderboard" },
  "160x600": { w: 160, h: 600, name: "Wide Skyscraper" },
};

export const SANS = '"Helvetica Neue",Helvetica,Arial,sans-serif';
export const SERIF = 'Georgia,"Times New Roman",serif';

const hex = (h) => {
  const n = parseInt(h.slice(1, 7), 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
};
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("").toUpperCase();

export const rgba = (h, alpha) => `rgba(${hex(h).join(",")},${alpha})`;
export const mix = (a, b, amount) => {
  const [x, y] = [hex(a), hex(b)];
  return toHex(x.map((v, i) => v + (y[i] - v) * amount));
};
// Relative luminance (0 = black, 1 = white)
export const lum = (h) => {
  const [r, g, b] = hex(h).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const isDark = (h) => lum(h) < 0.3;
export const onColor = (h) => (lum(h) > 0.45 ? "#0B0F19" : "#FFFFFF");

export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const lines = (s) => esc(s).split("|");
export const plain = (s) => s.replace("|", " ");

export const svgIcon = (name, cls = "") => {
  if (!ICONS[name]) throw new Error(`Unknown icon "${name}"`);
  return `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
};
export const CHECK =
  '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Largest font size (px) that fits `text` into `width`, using an average glyph width ratio
export const fitFont = (text, width, max, ratio = 0.62) => Math.min(max, Math.floor(width / (Math.max(1, text.length) * ratio)));
export const longestWord = (s) => plain(s).split(/\s+/).reduce((a, b) => (b.length > a.length ? b : a), "");

// Deterministic pseudo-random generator so rebuilds are stable
export const rng = (seed) => () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);

/**
 * Fill in theme defaults from a few key colours.
 * Required: base, text, accent, accent2. Everything else is derived unless given.
 */
export function theme(t) {
  const dark = isDark(t.base);
  const onAccent = t.onAccent || onColor(t.accent);
  return {
    dark,
    bg: `linear-gradient(160deg,${mix(t.base, t.accent, dark ? 0.14 : 0.07)} 0%,${t.base} 72%)`,
    muted: mix(t.text, t.base, 0.38),
    onAccent,
    cta: [t.accent, onAccent],
    badge: [t.accent2, onColor(t.accent2)],
    border: dark ? "#333" : "#e2e8f0",
    radius: "10px",
    serif: false,
    ...t,
  };
}
