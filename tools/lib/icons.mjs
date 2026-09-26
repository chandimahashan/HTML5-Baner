// All icons: 48x48 viewBox, stroke-based, inherit currentColor.
import { ICONS_BASE } from "./icons-base.mjs";

const ICONS_NEW = {
  // E-commerce & retail
  sofa: '<path d="M8 22v-6a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v6"/><path d="M4 26a4 4 0 0 1 8 0v4h24v-4a4 4 0 0 1 8 0v10H4z"/><path d="M8 36v4M40 36v4"/>',
  gamepad: '<path d="M14 14h20a10 10 0 0 1 9.6 12.8l-2 7A5 5 0 0 1 33 35l-4-5H19l-4 5a5 5 0 0 1-8.6-1.2l-2-7A10 10 0 0 1 14 14z"/><path d="M15 21v6M12 24h6"/><circle cx="32" cy="22" r="1.5"/><circle cx="35" cy="26" r="1.5"/>',
  flower: '<circle cx="24" cy="18" r="4"/><path d="M24 14c0-5 6-7 6-2s-6 6-6 6M24 14c0-5-6-7-6-2s6 6 6 6M28 18c5 0 7 6 2 6s-6-6-6-6M20 18c-5 0-7 6-2 6s6-6 6-6"/><path d="M24 24v18M24 34c-4-4-9-3-10 0M24 38c4-4 9-3 10 0"/>',
  tag: '<path d="M6 8h16l20 20-14 14L8 22z"/><circle cx="15" cy="17" r="3"/><path d="M22 30l8-8"/>',
  diamond: '<path d="M12 6h24l8 12-20 24L4 18z"/><path d="M4 18h40M18 6l-4 12 10 24 10-24-4-12"/>',
  glasses: '<circle cx="13" cy="28" r="8"/><circle cx="35" cy="28" r="8"/><path d="M21 27c2-2 4-2 6 0M5 26l-1-10h6M43 26l1-10h-6"/>',
  paw: '<ellipse cx="24" cy="32" rx="9" ry="8"/><circle cx="12" cy="20" r="4"/><circle cx="20" cy="12" r="4"/><circle cx="28" cy="12" r="4"/><circle cx="36" cy="20" r="4"/>',
  bike: '<circle cx="11" cy="33" r="7"/><circle cx="37" cy="33" r="7"/><path d="M11 33l8-14h12l6 14M19 19l5 14h-13M29 12h5l-3 7"/><path d="M24 10l-3 6h5l-3 6"/>',
  mountain: '<path d="M3 40l14-24 8 12 6-8 14 20z"/><path d="M13 23l4 3 4-3M27 26l4-4"/>',
  bulb: '<path d="M18 34v-4a12 12 0 1 1 12 0v4z"/><path d="M19 39h10M21 44h6"/><path d="M24 22l-3 5h6l-3 5"/>',
  // SaaS & tech
  bars: '<path d="M6 42h36"/><path d="M11 42V30h6v12M21 42V20h6v22M31 42V10h6v32"/>',
  code: '<path d="M16 14L6 24l10 10M32 14l10 10-10 10M27 8l-6 32"/>',
  video: '<rect x="4" y="12" width="28" height="24" rx="4"/><path d="M32 21l12-7v20l-12-7z"/>',
  mail: '<rect x="5" y="10" width="38" height="28" rx="4"/><path d="M6 13l18 14 18-14"/><path d="M36 30l5 5"/>',
  users: '<circle cx="18" cy="16" r="6"/><path d="M6 40c0-7 5-12 12-12s12 5 12 12"/><circle cx="34" cy="18" r="5"/><path d="M34 28c5 0 9 4 9 10"/>',
  server: '<rect x="8" y="6" width="32" height="14" rx="3"/><rect x="8" y="28" width="32" height="14" rx="3"/><path d="M14 13h2M14 35h2M24 20v8"/><circle cx="33" cy="13" r="1.5"/><circle cx="33" cy="35" r="1.5"/>',
  pen: '<path d="M8 40l4-12L32 8l8 8-20 20z"/><path d="M28 12l8 8M8 40l10-4"/><circle cx="14" cy="34" r="1.5"/>',
  globe: '<circle cx="24" cy="24" r="18"/><path d="M6 24h36M24 6c6 6 6 30 0 36M24 6c-6 6-6 30 0 36"/>',
  lock: '<rect x="9" y="21" width="30" height="21" rx="4"/><path d="M15 21v-6a9 9 0 0 1 18 0v6"/><path d="M24 29v6"/>',
  blocks: '<rect x="6" y="6" width="15" height="15" rx="3"/><rect x="27" y="6" width="15" height="15" rx="3"/><rect x="6" y="27" width="15" height="15" rx="3"/><path d="M34.5 27v15M27 34.5h15"/>',
  // Real estate & architecture
  ecohouse: '<path d="M6 22L24 8l18 14"/><path d="M10 19v23h28V19"/><path d="M24 36c0-7 4-11 9-11 0 6-4 11-9 11zM24 36v6"/>',
  marina: '<path d="M16 38V10l8-4v32M24 16h8v22"/><path d="M4 40c4-3 8-3 12 0s8 3 12 0 8-3 12 0 4 0 4 0"/>',
  compass: '<circle cx="24" cy="9" r="3"/><path d="M22 12L10 42M26 12l12 30M14 32h20"/>',
  cabin: '<path d="M4 26L24 8l20 18"/><path d="M9 22v20h30V22"/><path d="M20 42V32h8v10M32 12v-4h4v8"/><path d="M4 44h40"/>',
  key: '<circle cx="16" cy="24" r="9"/><path d="M25 24h18M37 24v6M42 24v4"/><circle cx="16" cy="24" r="3"/>',
  crane: '<path d="M10 44V8h4v36M12 8h28M14 8l8 8M32 8v10"/><path d="M28 18h8v6h-8zM4 44h40"/><path d="M22 44V28h14v16"/>',
  house: '<path d="M5 24L24 8l19 16"/><path d="M10 20v22h28V20"/><path d="M19 42V30h10v12"/><path d="M33 13V8h4v9"/>',
  nightcity: '<path d="M4 42h40"/><path d="M8 42V24h8v18M16 42V14h10v28M26 42V20h8v22M34 42V28h6v14"/><path d="M36 6a5 5 0 1 0 5 7 4 4 0 0 1-5-7z"/>',
  desk: '<rect x="12" y="8" width="24" height="16" rx="2"/><path d="M24 24v5M18 29h12"/><path d="M4 33h40M8 33v9M40 33v9"/>',
  columns: '<path d="M4 16L24 6l20 10z"/><path d="M4 42h40M8 38h32"/><path d="M11 20v18M19 20v18M29 20v18M37 20v18"/>',
  // Finance & crypto
  bitcoin: '<circle cx="24" cy="24" r="19"/><path d="M19 14h8a5 5 0 0 1 0 10h-8zM19 24h9a5 5 0 0 1 0 10h-9zM19 14v20M22 11v3M26 11v3M22 34v3M26 34v3"/>',
  coins: '<ellipse cx="18" cy="12" rx="12" ry="5"/><path d="M6 12v8c0 3 5 5 12 5s12-2 12-5v-8"/><path d="M6 20v8c0 3 5 5 12 5"/><ellipse cx="32" cy="30" rx="10" ry="4.5"/><path d="M22 30v7c0 2.5 4.5 4.5 10 4.5s10-2 10-4.5v-7"/>',
  mortgage: '<path d="M6 22L24 8l18 14"/><path d="M10 19v23h28V19"/><circle cx="20" cy="26" r="2"/><circle cx="28" cy="36" r="2"/><path d="M29 25l-10 12"/>',
  cardstar: '<rect x="4" y="10" width="40" height="28" rx="4"/><path d="M4 18h40"/><path d="M33 23l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"/><path d="M10 30h10"/>',
  calendar: '<rect x="6" y="9" width="36" height="33" rx="4"/><path d="M6 18h36M16 5v8M32 5v8"/><path d="M17 30l5 5 9-10"/>',
  leafchart: '<path d="M6 42h36"/><path d="M8 34l10-9 8 5 14-15"/><path d="M40 6c-9 0-14 5-14 12 7 0 14-4 14-12z"/>',
  plane: '<path d="M44 4L4 20l16 6 6 16z"/><path d="M44 4L20 26"/>',
  briefcase: '<rect x="4" y="14" width="40" height="26" rx="4"/><path d="M17 14V9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5"/><path d="M4 25h40M22 25v4h4v-4"/>',
  pulsecoin: '<circle cx="24" cy="24" r="19"/><path d="M9 25h7l3-8 5 15 4-11 2 4h9"/>',
  hourglass: '<path d="M12 5h24M12 43h24"/><path d="M15 5c0 10 9 13 9 19s-9 9-9 19M33 5c0 10-9 13-9 19s9 9 9 19"/><path d="M19 38h10"/>',
  // Healthcare & fitness
  lotus: '<path d="M24 38c-5-5-7-11-7-16 3 2 5 3 7 6 2-3 4-4 7-6 0 5-2 11-7 16z"/><path d="M24 38c-9 0-16-4-18-11 5-1 9 0 13 3M24 38c9 0 16-4 18-11-5-1-9 0-13 3"/><path d="M24 22c0-6 2-11 0-14-2 3 0 8 0 14"/>',
  dumbbell: '<path d="M16 24h16"/><rect x="8" y="14" width="8" height="20" rx="2"/><rect x="32" y="14" width="8" height="20" rx="2"/><path d="M4 19v10M44 19v10"/>',
  chatheart: '<path d="M8 8h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H22l-10 8v-8H8a4 4 0 0 1-4-4V12a4 4 0 0 1 4-4z"/><path d="M24 28s-7-4-7-9a3.5 3.5 0 0 1 7-1 3.5 3.5 0 0 1 7 1c0 5-7 9-7 9z"/>',
  bottle: '<path d="M19 4h10v7l3 5v26a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V16l3-5z"/><path d="M16 22h16M16 34h16"/><path d="M24 26c2 2.5 3 4 3 5a3 3 0 0 1-6 0c0-1 1-2.5 3-5z"/>',
  stetho: '<path d="M10 6v10a8 8 0 0 0 16 0V6"/><path d="M18 24v6a10 10 0 0 0 20 0v-6"/><circle cx="38" cy="20" r="4"/><path d="M7 6h6M23 6h6"/>',
  runner: '<circle cx="30" cy="8" r="4"/><path d="M16 20l8-4 6 4 4 8h6M24 16l-4 12 8 6-2 10M20 28l-8 4-4 8"/>',
  capsule: '<rect x="5" y="17" width="38" height="14" rx="7" transform="rotate(-40 24 24)"/><path d="M19 18.5l10 11"/><path d="M36 38l3 3M40 34l3 3"/>',
  moon: '<path d="M30 6a18 18 0 1 0 12 28A15 15 0 0 1 30 6z"/><path d="M37 8v6M34 11h6"/>',
  spin: '<circle cx="12" cy="36" r="6"/><path d="M12 36l12-14h10M24 22l-6-10h8M34 22l4 14H22"/><path d="M28 12h6"/><path d="M6 44h36"/>',
  smile: '<path d="M16 7c-6 0-9 5-8 11 1 5 3 8 4 14 1 5 2 10 5 10s3-6 4-10c1-3 5-3 6 0 1 4 1 10 4 10s4-5 5-10c1-6 3-9 4-14 1-6-2-11-8-11-4 0-6 2-8 2s-4-2-8-2z"/><path d="M36 4l1.5 3 3 1.5-3 1.5L36 13l-1.5-3-3-1.5 3-1.5z"/>',
};

export const ICONS = { ...ICONS_BASE, ...ICONS_NEW };
