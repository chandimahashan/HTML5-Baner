#!/usr/bin/env node
/**
 * AdStudioLab banner builder.
 *
 * Generates every self-contained GDN banner in ads/<category>/<campaign>/<size>/index.html
 * plus the showcase registry in scripts/data.js (with measured file payloads).
 *
 * Edit the CAMPAIGNS list below, then run:  node tools/build-ads.mjs
 */
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const GSAP_URL = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
const GSAP_KB = { min: 69.8, gzip: 27.1 }; // measured from the cdnjs file above
const CLICK_URL = "https://www.google.com";

// Animation budget: 6s timeline, played twice with a 1s pause = 13s (< 15s max), then rests on the end frame.
const LOOP = 6;
const PLAYS = 2;
const GAP = 1;
const TOTAL = LOOP * PLAYS + GAP;

const SIZES = {
  "300x250": { w: 300, h: 250, name: "Medium Rectangle" },
  "728x90": { w: 728, h: 90, name: "Leaderboard" },
  "160x600": { w: 160, h: 600, name: "Wide Skyscraper" },
};

const CATEGORIES = [
  { slug: "ecommerce-retail", label: "E-Commerce & Retail" },
  { slug: "saas-tech", label: "SaaS & Tech" },
  { slug: "real-estate", label: "Real Estate & Architecture" },
  { slug: "finance-crypto", label: "Finance & Crypto" },
  { slug: "healthcare-fitness", label: "Healthcare & Fitness" },
];

/* ------------------------------------------------------------------ */
/* Icons (48x48, stroke-based, inherit currentColor)                   */
/* ------------------------------------------------------------------ */
const ICONS = {
  sneaker: '<path d="M4 34h40v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path d="M4 34l3-15 9 4 6-9 6 7c4 4 9 6 13 7 3 1 3 3 3 6"/><path d="M25 21l3 3M29 18l3 3"/>',
  gadget: '<rect x="9" y="9" width="30" height="21" rx="2"/><path d="M4 37h40"/><path d="M26 13l-5 7h6l-5 7"/>',
  fashion: '<path d="M10 18h28l-3 23H13z"/><path d="M18 18v-3a6 6 0 0 1 12 0v3"/>',
  coffee: '<path d="M8 20h26v8a11 11 0 0 1-11 11h-4A11 11 0 0 1 8 28z"/><path d="M34 22h3a5 5 0 0 1 0 10h-4"/><path d="M16 7c-2 3 2 5 0 8M24 7c-2 3 2 5 0 8"/>',
  cloud: '<path d="M14 37a8 8 0 0 1-1-16 11 11 0 0 1 21-3 9 9 0 0 1 1 19z"/><path d="M13 29h6l3-5 4 9 3-4h6"/>',
  tasks: '<rect x="9" y="6" width="30" height="36" rx="4"/><path d="M16 17l3 3 6-6M16 30l3 3 6-6"/><path d="M29 18h4M29 31h4"/>',
  shield: '<path d="M24 5l16 6v11c0 10-7 18-16 21C15 40 8 32 8 22V11z"/><path d="M17 24l5 5 9-10"/>',
  invoice: '<path d="M12 5h24v38l-4-3-4 3-4-3-4 3-4-3-4 3z"/><path d="M18 30v-5M24 30V19M30 30v-7"/>',
  tower: '<path d="M18 44V14l6-9 6 9v30"/><path d="M10 44V26h8M30 26h8v18"/><path d="M5 44h38"/><path d="M22 18h4M22 25h4M22 32h4"/>',
  villa: '<circle cx="24" cy="17" r="7"/><path d="M24 4v2M12 9l2 2M36 9l-2 2"/><path d="M4 32c5-4 9-4 13 0s9 4 14 0 9-4 13 0"/><path d="M4 40c5-4 9-4 13 0s9 4 14 0 9-4 13 0"/>',
  loft: '<rect x="8" y="9" width="32" height="35" rx="1"/><path d="M8 18h32M8 27h32M16 9v9M32 18v9M24 27v9"/><path d="M20 44v-8h8v8"/>',
  skyline: '<path d="M4 44h40"/><path d="M8 44V22h10v22M18 44V7h12v37M30 44V15h10v29"/><path d="M22 13h4M22 20h4M22 27h4"/>',
  trading: '<path d="M6 44h36"/><path d="M6 36l11-11 8 6 16-16"/><path d="M31 15h10v10"/>',
  card: '<rect x="5" y="11" width="38" height="26" rx="4"/><path d="M5 19h38"/><path d="M11 30h9"/><circle cx="35" cy="30" r="2"/>',
  funds: '<path d="M22 8a17 17 0 1 0 18 18H22z"/><path d="M28 4v16h16A16 16 0 0 0 28 4z"/>',
  umbrella: '<path d="M6 23a18 18 0 0 1 36 0z"/><path d="M24 5v2M24 23v15a4 4 0 0 1-8 0"/>',
  drop: '<path d="M24 6c7 9 12 15 12 22a12 12 0 0 1-24 0c0-7 5-13 12-22z"/><path d="M19 30a6 6 0 0 0 6 6"/><path d="M40 5v6M37 8h6"/>',
  watch: '<rect x="12" y="12" width="24" height="24" rx="6"/><path d="M18 12l2-7h8l2 7M18 36l2 7h8l2-7"/><path d="M15 25h5l2-4 4 8 2-4h5"/>',
  tooth: '<path d="M16 7c-6 0-9 5-8 11 1 5 3 8 4 14 1 5 2 10 5 10s3-6 4-10c1-3 5-3 6 0 1 4 1 10 4 10s4-5 5-10c1-6 3-9 4-14 1-6-2-11-8-11-4 0-6 2-8 2s-4-2-8-2z"/>',
  bowl: '<path d="M6 25h36a18 18 0 0 1-36 0z"/><path d="M24 21c0-8 6-13 14-13 0 8-6 13-14 13z"/><path d="M17 20c-4-2-6-6-6-10 4 0 8 2 9 7"/>',
};

/* ------------------------------------------------------------------ */
/* Campaigns                                                           */
/* headline/intro: "Line one|Line two" (second line is accented)       */
/* ------------------------------------------------------------------ */
const CAMPAIGNS = [
  {
    slug: "sneaker-drop", category: "ecommerce-retail", title: "Sneaker Drop", brand: "Stride",
    industry: "Footwear Retail", icon: "sneaker",
    value: "Limited-edition runner launch driven by flash pricing and scarcity messaging.",
    keywords: ["sneakers", "discount", "flash sale", "fashion", "retail"],
    intro: "The Drop|Is Live", headline: "Flat 40% Off|Velocity X", sub: "Limited pairs · Ends at midnight",
    offer: ["40%", "OFF"], cta: "Shop Now",
    features: ["Free express shipping", "30-day free returns", "Members shop first"],
    theme: { base: "#0A0A10", bg: "radial-gradient(120% 90% at 80% 20%,#2A1838 0%,#0A0A10 60%)", text: "#FFFFFF", muted: "#A5A5BC",
      accent: "#FF3D5A", accent2: "#FFD23F", onAccent: "#FFFFFF", cta: ["linear-gradient(135deg,#FF5470,#E8213F)", "#FFFFFF"],
      badge: ["#FFD23F", "#1A1A22"], border: "#333", motif: "stripes", radius: "18px" },
  },
  {
    slug: "cyber-monday-gadgets", category: "ecommerce-retail", title: "Cyber Monday Gadgets", brand: "Voltix",
    industry: "Consumer Electronics", icon: "gadget",
    value: "Doorbuster electronics event with bold neon styling and deep-discount hooks.",
    keywords: ["cyber monday", "discount", "electronics", "gadgets", "deals"],
    intro: "Cyber|Monday", headline: "Tech Deals|Up to 60% Off", sub: "Laptops, audio & smart home",
    offer: ["60%", "OFF"], cta: "Grab the Deal",
    features: ["Top brands in stock", "Price-match promise", "Next-day delivery"],
    theme: { base: "#070B1F", bg: "linear-gradient(135deg,#0B1026 0%,#1B1040 100%)", text: "#F8FAFC", muted: "#9AA5CE",
      accent: "#22D3EE", accent2: "#A855F7", onAccent: "#FFFFFF", cta: ["linear-gradient(90deg,#0EA5E9,#A855F7)", "#FFFFFF"],
      badge: ["#A855F7", "#FFFFFF"], border: "#333", motif: "grid", radius: "8px" },
  },
  {
    slug: "luxury-fashion-autumn", category: "ecommerce-retail", title: "Luxury Fashion Autumn", brand: "Maison Aurèle",
    industry: "Luxury Apparel", icon: "fashion",
    value: "Editorial, serif-led seasonal campaign for a premium cashmere collection.",
    keywords: ["luxury", "fashion", "autumn", "apparel", "premium"],
    intro: "The Autumn|Edit", headline: "Tailored for|the Season", sub: "New cashmere & wool collection",
    offer: null, cta: "Discover Now",
    features: ["Italian cashmere", "Complimentary tailoring", "Free returns"],
    theme: { base: "#F5EFE6", bg: "linear-gradient(160deg,#FAF6F0 0%,#EADFCF 100%)", text: "#2B2320", muted: "#7A6A5E",
      accent: "#8C5A3C", accent2: "#C9A45C", onAccent: "#FFFFFF", cta: ["#2B2320", "#F5EFE6"],
      border: "#e2e8f0", serif: true, motif: "frame", radius: "0px" },
  },
  {
    slug: "organic-coffee-roasters", category: "ecommerce-retail", title: "Organic Coffee Roasters", brand: "Ember & Oak",
    industry: "Food & Beverage D2C", icon: "coffee",
    value: "Warm, craft-led subscription offer for fresh-roasted single-origin beans.",
    keywords: ["coffee", "organic", "subscription", "discount", "d2c"],
    intro: "Roasted|This Morning", headline: "Single-Origin|Organic Beans", sub: "Roasted to order, shipped in 48h",
    offer: ["20%", "1ST ORDER"], cta: "Order Fresh",
    features: ["Fair-trade certified", "Roasted to order", "Pause anytime"],
    theme: { base: "#150E0A", bg: "linear-gradient(160deg,#2B1A12 0%,#150E0A 100%)", text: "#FBF3E9", muted: "#C9B29B",
      accent: "#E0A96D", accent2: "#7FB069", onAccent: "#150E0A", cta: ["#E0A96D", "#150E0A"],
      badge: ["#7FB069", "#10200C"], border: "#333", serif: true, motif: "waves", radius: "6px" },
  },
  {
    slug: "cloudops-monitoring", category: "saas-tech", title: "CloudOps Monitoring", brand: "CloudOps",
    industry: "DevOps SaaS", icon: "cloud",
    value: "Developer-focused trial acquisition for a full-stack observability platform.",
    keywords: ["saas", "monitoring", "devops", "cloud", "b2b"],
    intro: "Know Before|Users Do", headline: "Full-Stack|Observability", sub: "Metrics, logs & traces in one view",
    offer: null, cta: "Start Free Trial",
    features: ["Real-time alerting", "99.99% uptime SLA", "Set up in 5 minutes"],
    theme: { base: "#06111C", bg: "radial-gradient(120% 120% at 85% 10%,#0B2A3A 0%,#06111C 60%)", text: "#F0FDF9", muted: "#8FB3C4",
      accent: "#34D399", accent2: "#38BDF8", onAccent: "#06111C", cta: ["linear-gradient(90deg,#34D399,#38BDF8)", "#06111C"],
      border: "#333", motif: "grid", radius: "8px" },
  },
  {
    slug: "taskflow-ai", category: "saas-tech", title: "TaskFlow AI Productivity", brand: "TaskFlow AI",
    industry: "AI Productivity SaaS", icon: "tasks",
    value: "Problem-to-solution storytelling that converts busy teams into free-trial users.",
    keywords: ["saas", "ai", "productivity", "automation", "b2b"],
    intro: "Still Doing|Busywork?", headline: "Automate Your|Workflow", sub: "AI that sorts, schedules & ships",
    offer: null, cta: "Start Free Trial",
    features: ["Smart task triage", "Auto-scheduling", "2,000+ integrations"],
    theme: { base: "#0E1024", bg: "linear-gradient(100deg,#0E1024 0%,#171B45 100%)", text: "#F8FAFC", muted: "#A5ABD6",
      accent: "#818CF8", accent2: "#22D3EE", onAccent: "#FFFFFF", cta: ["linear-gradient(90deg,#6366F1,#22D3EE)", "#FFFFFF"],
      border: "#333", motif: "orbs", radius: "8px" },
  },
  {
    slug: "cybershield-endpoint", category: "saas-tech", title: "CyberShield Endpoint Defense", brand: "CyberShield",
    industry: "Cybersecurity", icon: "shield",
    value: "Enterprise demo-request campaign positioning zero-trust endpoint protection.",
    keywords: ["saas", "security", "cyber", "enterprise", "b2b"],
    intro: "Every Device|Is a Door", headline: "Zero-Trust|Endpoints", sub: "Stop threats before they execute",
    offer: null, cta: "Get a Demo",
    features: ["AI threat detection", "Ransomware rollback", "SOC 2 compliant"],
    theme: { base: "#050A07", bg: "radial-gradient(120% 120% at 80% 0%,#0F2A1A 0%,#050A07 60%)", text: "#ECFDF5", muted: "#86A694",
      accent: "#22C55E", accent2: "#A3E635", onAccent: "#050A07", cta: ["#22C55E", "#04130A"],
      border: "#333", motif: "grid", radius: "4px" },
  },
  {
    slug: "finflow-accounting", category: "saas-tech", title: "FinFlow Stripe Accounting", brand: "FinFlow",
    industry: "Fintech SaaS", icon: "invoice",
    value: "Clean light-mode campaign selling automated Stripe reconciliation to founders.",
    keywords: ["saas", "accounting", "stripe", "fintech", "startups"],
    intro: "Books Closed|in Minutes", headline: "Stripe-Synced|Accounting", sub: "Auto-reconcile every payout",
    offer: null, cta: "Try It Free",
    features: ["Real-time Stripe sync", "Auto reconciliation", "Tax-ready reports"],
    theme: { base: "#F8FAFC", bg: "linear-gradient(135deg,#FFFFFF 0%,#EEF2FF 100%)", text: "#0F172A", muted: "#5B6478",
      accent: "#635BFF", accent2: "#0EA5E9", onAccent: "#FFFFFF", cta: ["linear-gradient(90deg,#635BFF,#7C74FF)", "#FFFFFF"],
      border: "#e2e8f0", motif: "orbs", radius: "8px" },
  },
  {
    slug: "the-grand-penthouse", category: "real-estate", title: "The Grand Penthouse", brand: "The Grand",
    industry: "Luxury Residential", icon: "tower",
    value: "Charcoal-and-gold prestige creative driving private viewing appointments.",
    keywords: ["luxury", "real estate", "penthouse", "residential", "premium"],
    intro: "Life Above|the Skyline", headline: "The Grand|Penthouse", sub: "Private residences from the 60th floor",
    offer: null, cta: "Book Private Tour",
    features: ["Private sky terrace", "24/7 concierge", "Panoramic city views"],
    theme: { base: "#141416", bg: "linear-gradient(180deg,#111113 0%,#1F1F23 100%)", text: "#F3E9D2", muted: "#A89F8C",
      accent: "#C9A45C", accent2: "#E8CF8E", onAccent: "#141416", cta: ["linear-gradient(135deg,#EED79C,#C9A45C 50%,#A8843F)", "#141416"],
      border: "#333", serif: true, motif: "frame", radius: "2px" },
  },
  {
    slug: "azure-coastal-villas", category: "real-estate", title: "Azure Coastal Villas", brand: "Azure Coast",
    industry: "Resort Real Estate", icon: "villa",
    value: "Aspirational ocean-toned creative selling beachfront villa site visits.",
    keywords: ["luxury", "real estate", "villa", "beach", "resort"],
    intro: "Wake Up to|the Ocean", headline: "Beachfront|Villas", sub: "Private pools · Direct beach access",
    offer: null, cta: "Reserve a Visit",
    features: ["Infinity pools", "Private beach club", "Turnkey furnished"],
    theme: { base: "#082F49", bg: "linear-gradient(180deg,#0C4A6E 0%,#082F49 100%)", text: "#F0F9FF", muted: "#A5CDE3",
      accent: "#FCD34D", accent2: "#67E8F9", onAccent: "#082F49", cta: ["#FCD34D", "#082F49"],
      border: "#333", serif: true, motif: "waves", radius: "22px" },
  },
  {
    slug: "urban-loft-living", category: "real-estate", title: "Urban Loft Living", brand: "Foundry Lofts",
    industry: "Urban Rentals", icon: "loft",
    value: "Industrial-chic leasing campaign with a move-in incentive for young renters.",
    keywords: ["real estate", "rental", "loft", "urban", "discount"],
    intro: "Industrial|Soul", headline: "Urban Loft|Living", sub: "Exposed brick, 14ft ceilings, downtown",
    offer: ["1 MO", "FREE RENT"], cta: "View Floor Plans",
    features: ["14ft ceilings", "Rooftop lounge", "Steps from transit"],
    theme: { base: "#121212", bg: "linear-gradient(135deg,#1F1B19 0%,#121212 100%)", text: "#FAFAF9", muted: "#A8A29E",
      accent: "#F97316", accent2: "#FDBA74", onAccent: "#121212", cta: ["#F97316", "#121212"],
      badge: ["#FDBA74", "#121212"], border: "#333", motif: "stripes", radius: "4px" },
  },
  {
    slug: "skyline-commercial-hub", category: "real-estate", title: "Skyline Commercial Hub", brand: "Skyline Hub",
    industry: "Commercial Office", icon: "skyline",
    value: "B2B leasing creative marketing Grade-A, sustainability-certified office floors.",
    keywords: ["real estate", "commercial", "office", "b2b", "architecture"],
    intro: "Your Next HQ|Awaits", headline: "Grade-A|Office Space", sub: "Flexible floors from 2,000 sq ft",
    offer: null, cta: "Schedule a Tour",
    features: ["Smart building tech", "LEED Platinum", "Metro-connected"],
    theme: { base: "#0F172A", bg: "linear-gradient(160deg,#1E293B 0%,#0F172A 100%)", text: "#F8FAFC", muted: "#94A3B8",
      accent: "#60A5FA", accent2: "#BFDBFE", onAccent: "#0F172A", cta: ["#60A5FA", "#0B1220"],
      border: "#333", motif: "grid", radius: "6px" },
  },
  {
    slug: "apex-prime-trading", category: "finance-crypto", title: "Apex Prime Trading", brand: "Apex Prime",
    industry: "Brokerage & Crypto", icon: "trading",
    value: "High-energy account-opening creative for a zero-commission trading platform.",
    keywords: ["finance", "crypto", "trading", "stocks", "fintech"],
    intro: "Markets Never|Sleep", headline: "Trade Crypto|& Stocks", sub: "Zero-commission trades, pro tools",
    offer: ["$0", "FEES"], cta: "Open Account", legal: "Capital at risk.",
    features: ["Advanced charting", "200+ assets", "Bank-grade security"],
    theme: { base: "#05070D", bg: "radial-gradient(120% 120% at 90% 10%,#0B2A22 0%,#05070D 55%)", text: "#F8FAFC", muted: "#8B95A7",
      accent: "#10B981", accent2: "#F59E0B", onAccent: "#05070D", cta: ["#10B981", "#04110C"],
      badge: ["#F59E0B", "#1A1204"], border: "#333", motif: "grid", radius: "6px" },
  },
  {
    slug: "nova-digital-bank", category: "finance-crypto", title: "Nova Digital Bank", brand: "Nova",
    industry: "Neobank", icon: "card",
    value: "Vibrant mobile-first acquisition ad for a fee-free digital bank account.",
    keywords: ["finance", "bank", "fintech", "mobile", "neobank"],
    intro: "Banking,|Reimagined", headline: "Open an Account|in Minutes", sub: "No fees. No branches. No hassle.",
    offer: null, cta: "Get Nova Free",
    features: ["Instant virtual card", "High-yield savings", "Fee-free abroad"],
    theme: { base: "#120B2E", bg: "linear-gradient(135deg,#120B2E 0%,#2A1363 100%)", text: "#FAF5FF", muted: "#C4B5FD",
      accent: "#C084FC", accent2: "#F0ABFC", onAccent: "#120B2E", cta: ["linear-gradient(90deg,#C084FC,#F0ABFC)", "#1E0B3A"],
      border: "#333", motif: "orbs", radius: "20px" },
  },
  {
    slug: "wealthwise-mutual-funds", category: "finance-crypto", title: "WealthWise Mutual Funds", brand: "WealthWise",
    industry: "Asset Management", icon: "funds",
    value: "Trust-building light creative that lowers the barrier to first-time investing.",
    keywords: ["finance", "investing", "mutual funds", "wealth", "sip"],
    intro: "Let Your Money|Work Harder", headline: "Diversified|Mutual Funds", sub: "Start investing from $100/month",
    offer: null, cta: "Start Investing", legal: "Investments are subject to market risk.",
    features: ["Expert-managed funds", "Low expense ratios", "Auto-invest plans"],
    theme: { base: "#FFFFFF", bg: "linear-gradient(160deg,#FFFFFF 0%,#ECFDF3 100%)", text: "#052E16", muted: "#4B6B57",
      accent: "#16A34A", accent2: "#CA8A04", onAccent: "#FFFFFF", cta: ["#16A34A", "#FFFFFF"],
      border: "#e2e8f0", motif: "frame", radius: "6px" },
  },
  {
    slug: "safeguard-life-insurance", category: "finance-crypto", title: "SafeGuard Life Insurance", brand: "SafeGuard Life",
    industry: "Insurance", icon: "umbrella",
    value: "Reassuring family-protection message optimised for quick quote requests.",
    keywords: ["finance", "insurance", "life", "family", "quote"],
    intro: "Protect What|Matters Most", headline: "Affordable|Life Cover", sub: "Get a quote in 60 seconds",
    offer: null, cta: "Get a Free Quote", legal: "T&Cs apply.",
    features: ["No-exam options", "Flexible terms", "Fast claims support"],
    theme: { base: "#F8FAFC", bg: "linear-gradient(160deg,#FFFFFF 0%,#E0F2FE 100%)", text: "#0C2340", muted: "#4A607A",
      accent: "#0369A1", accent2: "#F43F5E", onAccent: "#FFFFFF", cta: ["#0369A1", "#FFFFFF"],
      border: "#e2e8f0", motif: "rings", radius: "22px" },
  },
  {
    slug: "pureglow-skincare", category: "healthcare-fitness", title: "PureGlow Skincare", brand: "PureGlow",
    industry: "Beauty & Wellness", icon: "drop",
    value: "Soft, premium beauty creative launching a clean vitamin C serum.",
    keywords: ["beauty", "skincare", "wellness", "discount", "vegan"],
    intro: "Your Skin,|Radiant", headline: "Vitamin C|Glow Serum", sub: "Clean, vegan & dermatologist tested",
    offer: ["25%", "OFF"], cta: "Shop the Serum",
    features: ["Vegan & cruelty-free", "Lightweight daily formula", "Free samples"],
    theme: { base: "#FFF1F2", bg: "linear-gradient(160deg,#FFF7F9 0%,#FCE7F3 100%)", text: "#4A1D2F", muted: "#8A5A6E",
      accent: "#DB2777", accent2: "#F9A8D4", onAccent: "#FFFFFF", cta: ["#DB2777", "#FFFFFF"],
      badge: ["#4A1D2F", "#FFF1F2"], border: "#e2e8f0", serif: true, motif: "orbs", radius: "22px" },
  },
  {
    slug: "fitpulse-smartwatch", category: "healthcare-fitness", title: "FitPulse Gym Smartwatch", brand: "FitPulse",
    industry: "Fitness Wearables", icon: "watch",
    value: "High-intensity product launch creative built around pre-order urgency.",
    keywords: ["fitness", "health", "smartwatch", "wearable", "gym"],
    intro: "Every Beat|Counts", headline: "Train Smarter|Every Day", sub: "Heart rate, VO₂ max & built-in GPS",
    offer: ["NEW", "SERIES 5"], cta: "Pre-Order Now",
    features: ["7-day battery", "Built-in GPS", "Water resistant 50m"],
    theme: { base: "#0A0A0A", bg: "radial-gradient(120% 120% at 80% 10%,#2A0D0D 0%,#0A0A0A 60%)", text: "#FAFAFA", muted: "#A3A3A3",
      accent: "#EF4444", accent2: "#F97316", onAccent: "#FFFFFF", cta: ["linear-gradient(90deg,#EF4444,#F97316)", "#FFFFFF"],
      badge: ["#F97316", "#FFFFFF"], border: "#333", motif: "rings", radius: "8px" },
  },
  {
    slug: "dentalpro-clinics", category: "healthcare-fitness", title: "DentalPro Modern Clinics", brand: "DentalPro",
    industry: "Healthcare Clinics", icon: "tooth",
    value: "Clinical, calming creative that drives new-patient appointment bookings.",
    keywords: ["health", "dental", "clinic", "healthcare", "appointment"],
    intro: "Smile With|Confidence", headline: "Modern|Dental Care", sub: "Same-week appointments",
    offer: ["$49", "CHECK-UP"], cta: "Book Appointment", legal: "New patients only.",
    features: ["Digital X-rays", "Clear aligners", "Evening & weekend hours"],
    theme: { base: "#FFFFFF", bg: "linear-gradient(160deg,#FFFFFF 0%,#ECFEFF 100%)", text: "#083344", muted: "#3F6673",
      accent: "#0891B2", accent2: "#22D3EE", onAccent: "#FFFFFF", cta: ["#0891B2", "#FFFFFF"],
      badge: ["#083344", "#ECFEFF"], border: "#e2e8f0", motif: "rings", radius: "22px" },
  },
  {
    slug: "nutrifuel-meal-prep", category: "healthcare-fitness", title: "NutriFuel Meal Prep", brand: "NutriFuel",
    industry: "Health Food Delivery", icon: "bowl",
    value: "Fresh, energetic subscription offer for macro-balanced meal delivery.",
    keywords: ["health", "fitness", "meal prep", "food", "discount"],
    intro: "Eat Clean.|Zero Prep.", headline: "Chef-Made|Healthy Meals", sub: "Macro-balanced, delivered weekly",
    offer: ["50%", "1ST BOX"], cta: "Claim 50% Off", legal: "New customers only.",
    features: ["High-protein menus", "Fresh, never frozen", "Skip or pause anytime"],
    theme: { base: "#0C160C", bg: "linear-gradient(160deg,#16311A 0%,#0C160C 100%)", text: "#F7FEE7", muted: "#A3B899",
      accent: "#84CC16", accent2: "#FACC15", onAccent: "#0C160C", cta: ["#84CC16", "#0C160C"],
      badge: ["#FACC15", "#1A1A05"], border: "#333", motif: "waves", radius: "20px" },
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const SANS = '"Helvetica Neue",Helvetica,Arial,sans-serif';
const SERIF = 'Georgia,"Times New Roman",serif';

const rgba = (hex, alpha) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${alpha})`;
};
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const lines = (s) => esc(s).split("|");
const svgIcon = (name, cls) =>
  `<svg class="${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
const CHECK = '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5 5 9l5-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// Where the hero icon sits in each size (also centres the "rings" motif)
const heroBox = (key, c) =>
  ({
    "300x250": { x: 204, y: c.offer ? 84 : 66, s: 80 },
    "728x90": { x: 502, y: 16, s: 56 },
    "160x600": { x: 38, y: 136, s: 84 },
  })[key];

/* ------------------------------------------------------------------ */
/* Background motifs: markup + css + timeline tweens                   */
/* ------------------------------------------------------------------ */
const MOTIFS = {
  orbs(t, { w, h }) {
    const s = Math.round(Math.min(Math.max(w, h) * 0.6, 220));
    return {
      html: '<i id="o1" class="orb"></i><i id="o2" class="orb"></i>',
      css: `.orb{width:${s}px;height:${s}px;border-radius:50%;filter:blur(${Math.round(s / 7)}px)}
#o1{left:${Math.round(-s * 0.35)}px;top:${Math.round(-s * 0.45)}px;background:${rgba(t.accent, 0.38)}}
#o2{left:${Math.round(w - s * 0.6)}px;top:${Math.round(h - s * 0.55)}px;background:${rgba(t.accent2, 0.3)}}`,
      tl: [
        `.to("#o1",{x:${Math.round(w * 0.18)},y:${Math.round(h * 0.12)},duration:${LOOP},ease:"sine.inOut"},0)`,
        `.to("#o2",{x:${-Math.round(w * 0.15)},y:${-Math.round(h * 0.1)},duration:${LOOP},ease:"sine.inOut"},0)`,
      ],
    };
  },
  grid(t) {
    const line = rgba(t.accent, 0.12);
    return {
      html: '<i id="grid"></i>',
      css: `#grid{left:0;top:-24px;width:100%;height:calc(100% + 48px);background-image:linear-gradient(${line} 1px,transparent 1px),linear-gradient(90deg,${line} 1px,transparent 1px);background-size:24px 24px;-webkit-mask-image:radial-gradient(ellipse at 75% 25%,#000,transparent 75%);mask-image:radial-gradient(ellipse at 75% 25%,#000,transparent 75%)}`,
      tl: [`.to("#grid",{y:24,duration:${LOOP},ease:"none"},0)`],
    };
  },
  stripes(t) {
    return {
      html: '<i id="stripes"></i>',
      css: `#stripes{left:-40px;top:0;width:calc(100% + 80px);height:100%;background:repeating-linear-gradient(135deg,${rgba(t.accent, 0.08)} 0 2px,transparent 2px 14px)}`,
      tl: [`.to("#stripes",{x:40,duration:${LOOP},ease:"none"},0)`],
    };
  },
  frame(t, { h }) {
    const inset = h < 100 ? 5 : 7;
    return {
      html: '<i id="frm"></i>',
      css: `#frm{left:${inset}px;top:${inset}px;right:${inset}px;bottom:${inset}px;border:1px solid ${rgba(t.accent, 0.4)}}`,
      tl: [`.from("#frm",{scale:1.04,autoAlpha:0,duration:1,ease:"power2.out"},0)`],
    };
  },
  waves(t, { w, h }) {
    const wh = h < 100 ? 34 : Math.round(h * 0.3);
    return {
      html: `<svg id="waves" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20C50 8 100 8 150 20S250 32 300 20 400 8 400 8V40H0Z" fill="${rgba(t.accent, 0.16)}"/><path d="M0 28C60 18 110 18 170 28S290 38 340 28 400 22 400 22V40H0Z" fill="${rgba(t.accent2, 0.14)}"/></svg>`,
      css: `#waves{left:-15%;bottom:0;width:130%;height:${wh}px}`,
      tl: [`.to("#waves",{x:${Math.round(w * 0.12)},duration:${LOOP},ease:"sine.inOut"},0)`],
    };
  },
  rings(t, { hero }) {
    const R = Math.round(hero.s * 2.6);
    const left = Math.round(hero.x + hero.s / 2 - R / 2);
    const top = Math.round(hero.y + hero.s / 2 - R / 2);
    return {
      html: `<svg id="rings" viewBox="0 0 200 200" fill="none" aria-hidden="true"><circle cx="100" cy="100" r="46" stroke="${rgba(t.accent, 0.35)}"/><circle cx="100" cy="100" r="70" stroke="${rgba(t.accent, 0.25)}" stroke-dasharray="4 6"/><circle cx="100" cy="100" r="96" stroke="${rgba(t.accent2, 0.2)}"/></svg>`,
      css: `#rings{left:${left}px;top:${top}px;width:${R}px;height:${R}px}`,
      tl: [
        `.from("#rings",{scale:.5,duration:1.2,ease:"power2.out"},0)`,
        `.to("#rings",{rotation:60,duration:${LOOP},ease:"none"},0)`,
      ],
    };
  },
};

/* ------------------------------------------------------------------ */
/* Size-specific layout CSS                                            */
/* ------------------------------------------------------------------ */
const LAYOUT = {
  "300x250": (c, hero) => `
#logo{left:14px;top:12px}
.mk{width:24px;height:24px;border-radius:6px}
.bn{font-size:13px}
#badge{right:10px;top:10px;width:58px;height:58px}
#badge b{font-size:17px}
#hero{left:${hero.x}px;top:${hero.y}px;width:${hero.s}px;height:${hero.s}px}
#content{left:16px;top:56px;width:184px}
#hl{font-size:21px}
#sub{margin-top:8px;font-size:11.5px;line-height:1.4}
#cta{left:16px;bottom:16px;height:36px;padding:0 20px;font-size:13px}
#legal{right:12px;bottom:8px;max-width:108px;text-align:right}
#intro .ii{width:56px;height:56px}
#intro .il{display:block;font-size:28px}`,

  "728x90": (c) => `
#logo{left:16px;top:0;height:88px}
.mk{width:38px;height:38px;border-radius:10px}
.bn{font-size:17px}
#div{left:200px;top:20px;width:1px;height:48px}
#content{left:216px;top:0;width:272px;height:88px;display:flex;flex-direction:column;justify-content:center}
#hl{font-size:19px;white-space:nowrap}
#sub{margin-top:4px;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#badge,#hero{left:502px;top:16px;width:56px;height:56px}
#badge b{font-size:15px}
#cta{left:576px;top:${c.legal ? 18 : 24}px;width:136px;height:40px;font-size:13px}
#legal{left:566px;top:64px;width:156px;text-align:center}
#intro{flex-direction:row;gap:14px}
#intro .ii{width:40px;height:40px}
#intro .il{font-size:24px}`,

  "160x600": (c, hero) => `
#logo{left:0;top:22px;width:100%;flex-direction:column;gap:8px}
.mk{width:40px;height:40px;border-radius:11px}
.bn{font-size:13px;text-align:center}
#hero{left:${hero.x}px;top:${hero.y}px;width:${hero.s}px;height:${hero.s}px}
#badge{right:8px;top:118px;width:54px;height:54px}
#badge b{font-size:15px}
#content{left:14px;top:256px;width:132px}
#hl{font-size:18px}
#sub{margin-top:10px;font-size:11px;line-height:1.45}
#rule{width:24px;height:2px;margin:16px 0;background:${c.theme.accent}}
#feats{list-style:none;display:grid;gap:12px}
.feat{display:flex;align-items:flex-start;gap:7px;font-size:11px;line-height:1.3}
.feat svg{flex:0 0 12px;width:12px;height:12px;margin-top:1px;color:${c.theme.accent}}
#cta{left:14px;bottom:48px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}
#intro{padding:0 14px}
#intro .ii{width:64px;height:64px}
#intro .il{display:block;font-size:22px}`,
};

/* ------------------------------------------------------------------ */
/* Banner builder                                                      */
/* ------------------------------------------------------------------ */
function buildBanner(c, key) {
  const { w, h } = SIZES[key];
  const t = c.theme;
  const wide = key === "728x90";
  const tall = key === "160x600";
  const hero = heroBox(key, c);
  const showHero = !(wide && c.offer);
  const motif = MOTIFS[t.motif](t, { w, h, hero });

  const [h1, h2] = lines(c.headline);
  const headline = h2 ? `${h1}${wide ? " " : "<br>"}<em>${h2}</em>` : h1;
  const [i1, i2] = lines(c.intro);

  const css = `*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${t.base}}
#ad{position:relative;width:${w}px;height:${h}px;overflow:hidden;cursor:pointer;border:1px solid ${t.border};background:${t.bg};font-family:${SANS};color:${t.text};-webkit-font-smoothing:antialiased;user-select:none}
#ad>*,#deco>*{position:absolute}
#deco{inset:0;overflow:hidden}
${motif.css}
.hd{font-family:${t.serif ? SERIF : SANS};font-weight:${t.serif ? 400 : 800};letter-spacing:${t.serif ? "0" : "-.5px"};line-height:1.1}
.hd em{font-style:${t.serif ? "italic" : "normal"};color:${t.accent}}
#logo{display:flex;align-items:center;gap:8px}
.mk{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${t.accent},${t.accent2});color:${t.onAccent}}
.mk svg{width:62%;height:62%}
.bn{font-family:${t.serif ? SERIF : SANS};font-weight:${t.serif ? 400 : 800};letter-spacing:${t.serif ? ".5px" : "-.2px"};white-space:nowrap}
#div{background:linear-gradient(180deg,transparent,${rgba(t.accent, 0.5)},transparent)}
#hero{display:flex;align-items:center;justify-content:center;border-radius:50%;background:${rgba(t.accent, 0.12)};border:1px solid ${rgba(t.accent, 0.35)};color:${t.accent}}
#hero svg{width:56%;height:56%}
#badge{z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;transform:rotate(10deg)${c.offer ? `;background:${t.badge[0]};color:${t.badge[1]};box-shadow:0 6px 16px ${rgba(t.badge[0].slice(0, 7), 0.4)}` : ""}}
#badge::before{content:"";position:absolute;inset:3px;border-radius:50%;border:1px dashed currentColor;opacity:.45}
#badge b{font-weight:900;line-height:1}
#badge span{margin-top:2px;font-size:6.5px;font-weight:800;letter-spacing:.8px}
#sub{color:${t.muted}}
#cta{z-index:2;display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap;border-radius:${t.radius};background:${t.cta[0]};color:${t.cta[1]};font-weight:700;letter-spacing:.2px;box-shadow:0 6px 16px ${rgba(t.accent, 0.3)}}
#cta span{position:relative;z-index:1}
#shine{position:absolute;left:0;top:-10px;width:30px;height:70px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-60px) skewX(-20deg)}
#legal{font-size:8px;line-height:1.3;color:${t.muted}}
#intro{inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;text-align:center;visibility:hidden}
#intro .ii{color:${t.accent}}
#intro .il{font-family:${t.serif ? SERIF : SANS};font-weight:${t.serif ? 400 : 900};letter-spacing:${t.serif ? "0" : "-.8px"};line-height:1.05}
#intro .il2{color:${t.accent};${t.serif ? "font-style:italic" : ""}}
${LAYOUT[key](c, hero)}`;

  const body = [
    `<div id="deco">${motif.html}</div>`,
    `<div id="logo"><span class="mk">${svgIcon(c.icon, "")}</span><span class="bn">${esc(c.brand)}</span></div>`,
    wide ? '<i id="div"></i>' : "",
    showHero ? `<div id="hero">${svgIcon(c.icon, "")}</div>` : "",
    c.offer ? `<div id="badge"><b>${esc(c.offer[0])}</b><span>${esc(c.offer[1])}</span></div>` : "",
    `<div id="content"><div id="hl" class="hd">${headline}</div><p id="sub">${esc(c.sub)}</p>${
      tall
        ? `<i id="rule" style="display:block"></i><ul id="feats">${c.features.map((f) => `<li class="feat">${CHECK}<span>${esc(f)}</span></li>`).join("")}</ul>`
        : ""
    }</div>`,
    `<div id="cta"><span>${esc(c.cta)}</span><i id="shine"></i></div>`,
    c.legal ? `<p id="legal">${esc(c.legal)}</p>` : "",
    `<div id="intro">${svgIcon(c.icon, "ii")}<div class="it"><span class="il">${i1}</span>${i2 ? ` <span class="il il2">${i2}</span>` : ""}</div></div>`,
  ].filter(Boolean);

  // Timeline uses absolute positions so every loop is exactly LOOP seconds
  const tl = [
    `.set("#intro",{autoAlpha:1},0)`,
    `.from("#deco",{autoAlpha:0,duration:.8},0)`,
    ...motif.tl,
    `.from("#intro .ii",{scale:0,rotation:-25,duration:.6,ease:"back.out(2)"},.15)`,
    `.from("#intro .il",{autoAlpha:0,y:18,stagger:.15,duration:.5,ease:"power3.out"},.4)`,
    `.to("#intro",{autoAlpha:0,duration:.35,ease:"power2.in"},2.1)`,
    `.from("#logo",{autoAlpha:0,${tall ? "y:-10" : "x:-12"},duration:.4},2.35)`,
    wide ? `.from("#div",{scaleY:0,duration:.3},2.5)` : "",
    showHero ? `.from("#hero",{scale:0,autoAlpha:0,duration:.55,ease:"back.out(1.8)"},2.45)` : "",
    `.from("#hl",{autoAlpha:0,y:14,duration:.45,ease:"power3.out"},2.6)`,
    `.from("#sub",{autoAlpha:0,y:8,duration:.4},2.85)`,
    tall ? `.from("#rule",{scaleX:0,transformOrigin:"left center",duration:.4},3)` : "",
    tall ? `.from(".feat",{autoAlpha:0,x:-10,stagger:.15,duration:.35},3.1)` : "",
    c.offer ? `.from("#badge",{scale:0,rotation:-160,duration:.55,ease:"back.out(2)"},3.05)` : "",
    `.from("#cta",{autoAlpha:0,scale:.6,duration:.45,ease:"back.out(2)"},3.6)`,
    c.legal ? `.from("#legal",{autoAlpha:0,duration:.3},3.85)` : "",
    `.to("#cta",{scale:1.06,duration:.25,yoyo:true,repeat:3,ease:"sine.inOut"},4.3)`,
    `.to("#shine",{x:220,duration:.8,ease:"power2.inOut"},4.45)`,
    `.set({},{},${LOOP})`,
  ].filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="ad.size" content="width=${w},height=${h}">
<title>${esc(c.brand)} — ${esc(c.title)} | ${key}</title>
<script type="text/javascript">var clickTag = "${CLICK_URL}";</script>
<script src="${GSAP_URL}"></script>
<style>
${css}
</style>
</head>
<body>
<div id="ad" onclick="window.open(window.clickTag)">
${body.join("\n")}
</div>
<script type="text/javascript">
(function () {
  if (!window.gsap) return; // fallback: the static end frame stays visible
  // ${LOOP}s loop x ${PLAYS} plays + ${GAP}s pause = ${TOTAL}s total, then rests on the end frame
  gsap.timeline({ repeat: ${PLAYS - 1}, repeatDelay: ${GAP} })
    ${tl.join("\n    ")};
})();
</script>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Write banners + registry                                            */
/* ------------------------------------------------------------------ */
const catLabel = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c.label]));

const campaigns = CAMPAIGNS.map((c, i) => {
  const sizes = {};
  for (const key of Object.keys(SIZES)) {
    const rel = `ads/${c.category}/${c.slug}/${key}/index.html`;
    const file = join(ROOT, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buildBanner(c, key));
    const kb = +(statSync(file).size / 1024).toFixed(1);
    sizes[key] = { w: SIZES[key].w, h: SIZES[key].h, name: SIZES[key].name, path: rel, kb };
  }
  return {
    id: i + 1,
    slug: c.slug,
    title: c.title,
    brand: c.brand,
    category: c.category,
    categoryLabel: catLabel[c.category],
    industry: c.industry,
    value: c.value,
    keywords: c.keywords,
    cta: c.cta,
    accent: c.theme.accent,
    border: c.theme.border,
    sizes,
  };
});

const registry = {
  gsap: { version: "3.12.2", url: GSAP_URL, kb: GSAP_KB },
  clickTag: CLICK_URL,
  animation: { loop: LOOP, plays: PLAYS, pause: GAP, total: TOTAL },
  categories: CATEGORIES,
  campaigns,
};

mkdirSync(join(ROOT, "scripts"), { recursive: true });
writeFileSync(
  join(ROOT, "scripts/data.js"),
  `/* Generated by tools/build-ads.mjs — edit campaigns there and re-run: node tools/build-ads.mjs */\n` +
    `window.ADSTUDIO = ${JSON.stringify(registry, null, 2)};\n`
);

const all = campaigns.flatMap((c) => Object.values(c.sizes).map((s) => s.kb));
console.log(`Built ${all.length} banners for ${campaigns.length} campaigns.`);
console.log(`HTML payload: min ${Math.min(...all)} KB, max ${Math.max(...all)} KB (+ GSAP ${GSAP_KB.gzip} KB gzipped).`);
