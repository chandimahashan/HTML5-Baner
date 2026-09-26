// Creative styles for the AdStudioLab banner generator.
// Each style returns { css, body[], tl[], js? } for one size; page() wraps it into a GDN-compliant file.
import {
  SIZES, SANS, SERIF, LOOP, PLAYS, GAP, TOTAL, CLICK_URL, GSAP_URL,
  rgba, mix, esc, lines, plain, svgIcon, CHECK, fitFont, longestWord, rng,
} from "./util.mjs";
import { ICONS } from "./icons.mjs";

export const STYLE_LABELS = {
  classic: "Classic Hero",
  split: "Split Panel",
  kinetic: "Kinetic Type",
  cards: "Card Stack",
  data: "Live Data Chart",
  spotlight: "Spotlight Burst",
  ticker: "Countdown Ticker",
  editorial: "Editorial Serif",
  neon: "Neon Glitch",
  blob: "Organic Blobs",
};

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */
const longest = (...xs) => xs.filter(Boolean).reduce((a, b) => (b.length > a.length ? b : a), "");
const hlHtml = (c, inline) => {
  const [a, b] = lines(c.headline);
  return b ? `${a}${inline ? " " : "<br>"}<em>${b}</em>` : a;
};
const featsHtml = (c) => `<ul class="fl">${c.features.map((f) => `<li>${CHECK}<span>${esc(f)}</span></li>`).join("")}</ul>`;
const flCss = (t, gap = 10, fs = 11) =>
  `.fl{list-style:none;display:grid;gap:${gap}px}
.fl li{display:flex;align-items:flex-start;gap:7px;font-size:${fs}px;line-height:1.3}
.fl svg{flex:0 0 12px;width:12px;height:12px;margin-top:1px;color:${t.accent}}`;
const logoHtml = (c) => `<div id="logo"><span class="mk">${svgIcon(c.icon)}</span><span class="bn">${esc(c.brand)}</span></div>`;
const ctaHtml = (c) => `<div id="cta"><span>${esc(c.cta)}</span><i id="shine"></i></div>`;
const legalHtml = (c) => (c.legal ? `<p id="legal">${esc(c.legal)}</p>` : "");
const badgeHtml = (c) => (c.offer ? `<div class="bdg"><b>${esc(c.offer[0])}</b><span>${esc(c.offer[1])}</span></div>` : "");
const badgeCss = (c, t, size, pos) => {
  if (!c.offer) return "";
  const big = fitFont(c.offer[0], size * 0.78, Math.round(size * 0.3), 0.62);
  const small = Math.min(6.5, Math.floor((size * 0.8) / (c.offer[1].length * 0.72)));
  return `.bdg{${pos};z-index:4;width:${size}px;height:${size}px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:50%;background:${t.badge[0]};color:${t.badge[1]};transform:rotate(10deg);box-shadow:0 6px 16px ${rgba(t.badge[0], 0.4)}}
.bdg::before{content:"";position:absolute;inset:3px;border-radius:50%;border:1px dashed currentColor;opacity:.45}
.bdg b{font-size:${big}px;font-weight:900;line-height:1}
.bdg span{margin-top:2px;font-size:${small}px;font-weight:800;letter-spacing:.6px;white-space:nowrap}`;
};
const tail = () => [
  `.to("#cta",{scale:1.06,duration:.25,yoyo:true,repeat:3,ease:"sine.inOut"},4.3)`,
  `.to("#shine",{x:220,duration:.8,ease:"power2.inOut"},4.45)`,
];
const legalTl = (c, at) => (c.legal ? `.from("#legal",{autoAlpha:0,duration:.3},${at})` : "");

function baseCss(c, key) {
  const { w, h } = SIZES[key];
  const t = c.theme;
  return `*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${w}px;height:${h}px;overflow:hidden;background:${t.base}}
#ad{position:relative;width:${w}px;height:${h}px;overflow:hidden;cursor:pointer;border:1px solid ${t.border};background:${t.bg};font-family:${SANS};color:${t.text};-webkit-font-smoothing:antialiased;user-select:none}
#ad>*{position:absolute}
.hd{font-family:${t.serif ? SERIF : SANS};font-weight:${t.serif ? 400 : 800};letter-spacing:${t.serif ? "0" : "-.5px"};line-height:1.1}
.hd em{font-style:${t.serif ? "italic" : "normal"};color:${t.accent}}
.mk{display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${t.accent},${t.accent2});color:${t.onAccent}}
.mk svg{width:62%;height:62%}
.bn{font-family:${t.serif ? SERIF : SANS};font-weight:${t.serif ? 400 : 800};letter-spacing:${t.serif ? ".5px" : "-.2px"};white-space:nowrap}
#sub{color:${t.muted}}
#cta{z-index:2;display:flex;align-items:center;justify-content:center;overflow:hidden;white-space:nowrap;border-radius:${t.radius};background:${t.cta[0]};color:${t.cta[1]};font-weight:700;letter-spacing:.2px;box-shadow:0 6px 16px ${rgba(t.accent, 0.3)}}
#cta span{position:relative;z-index:1}
#shine{position:absolute;left:0;top:-10px;width:30px;height:70px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-60px) skewX(-20deg)}
#legal{font-size:8px;line-height:1.3;color:${t.muted}}`;
}

export function page(c, key, s) {
  const { w, h } = SIZES[key];
  const tl = [...s.tl, `.set({},{},${LOOP})`].filter(Boolean);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="ad.size" content="width=${w},height=${h}">
<title>${esc(c.brand)} — ${esc(c.title)} | ${key}</title>
<script type="text/javascript">var clickTag = "${CLICK_URL}";</script>
<script src="${GSAP_URL}"></script>
<style>
${baseCss(c, key)}
${s.css.trim()}
</style>
</head>
<body>
<div id="ad" onclick="window.open(window.clickTag)">
${s.body.filter(Boolean).join("\n")}
</div>
<script type="text/javascript">
(function () {
  if (!window.gsap) return; // fallback: the static end frame stays visible${s.js ? `\n  ${s.js}` : ""}
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
/* 1. Split Panel — colour wipe that shrinks into a brand panel        */
/* ------------------------------------------------------------------ */
function split({ c, t, key, w, h, wide, tall }) {
  const flip = !!c.flip && key === "300x250";
  const [i1, i2 = ""] = lines(c.intro);
  const panelBg = `linear-gradient(${tall ? 180 : 135}deg,${t.accent},${mix(t.accent, t.accent2, 0.45)})`;
  const off = c.offer || ["", ""];
  let css, prop, from, to;

  if (key === "300x250") {
    const side = flip ? "right" : "left";
    const cx = flip ? 16 : 128;
    const pl = flip ? 188 : 0;
    css = `#pn{${side}:0;top:0;width:112px;height:100%}
#pint b{font-size:${fitFont(longest(i1, i2), 264, 36)}px}
#pbn{left:${pl}px;top:16px;width:112px;text-align:center;font-size:12px}
#pic{left:${pl + 26}px;top:${c.offer ? 54 : 84}px;width:60px;height:60px}
#pof{left:${pl}px;top:134px;width:112px;text-align:center}
#pof b{font-size:${fitFont(off[0], 96, 28)}px}
#pof span{font-size:8px}
#ct{left:${cx}px;top:24px;width:156px}
#hl{font-size:19px}
#sub{margin-top:8px;font-size:11px;line-height:1.4}
#cta{left:${cx}px;bottom:${c.legal ? 22 : 16}px;height:34px;padding:0 16px;font-size:12.5px}
#legal{left:${cx}px;bottom:6px;width:156px;font-size:7px}`;
    [prop, from, to] = ["width", w, 112];
  } else if (wide) {
    css = `#pn{left:0;top:0;width:190px;height:100%}
#pint{flex-direction:row;gap:.3em}
#pint b{font-size:${fitFont(`${i1} ${i2}`, 680, 40, 0.6)}px}
#pic{left:18px;top:26px;width:36px;height:36px}
#pbn{left:62px;top:0;height:88px;display:flex;align-items:center;font-size:${fitFont(c.brand, 118, 17, 0.58)}px}
#pof{left:486px;top:0;width:82px;height:88px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:${t.accent}}
#pof b{font-size:${fitFont(off[0], 78, 24)}px}
#pof span{font-size:7px}
#ct{left:206px;top:0;width:270px;height:88px;display:flex;flex-direction:column;justify-content:center}
#hl{font-size:19px;white-space:nowrap}
#sub{margin-top:4px;font-size:11.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cta{left:576px;top:${c.legal ? 18 : 24}px;width:136px;height:40px;font-size:13px}
#legal{left:566px;top:64px;width:156px;text-align:center}`;
    [prop, from, to] = ["width", w, 190];
  } else {
    css = `#pn{left:0;top:0;width:100%;height:240px}
#pint{padding:0 12px}
#pint b{font-size:${fitFont(longestWord(c.intro), 136, 36, 0.64)}px}
#pbn{left:0;top:22px;width:100%;text-align:center;font-size:13px}
#pic{left:44px;top:${c.offer ? 60 : 84}px;width:72px;height:72px}
#pof{left:0;top:148px;width:100%;text-align:center}
#pof b{font-size:${fitFont(off[0], 130, 34)}px}
#pof span{font-size:8.5px}
#ct{left:14px;top:262px;width:132px}
#hl{font-size:18px}
#sub{margin-top:10px;font-size:11px;line-height:1.45}
.fl{margin-top:16px}
#cta{left:14px;bottom:48px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}
${flCss(t)}`;
    [prop, from, to] = ["height", h, 240];
  }

  return {
    css: `#pn{z-index:3;background:${panelBg}}
#pint{inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:${t.onAccent};visibility:hidden}
#pint b{display:block;font-weight:900;letter-spacing:-1px;line-height:1}
#pbn,#pic,#pof{z-index:4;color:${t.onAccent}}
#pbn{font-weight:800}
#pic svg{width:100%;height:100%}
#pof b{display:block;font-weight:900;line-height:1;letter-spacing:-.5px}
#pof span{font-weight:800;letter-spacing:1.5px;white-space:nowrap}
${css}`,
    body: [
      '<div id="pn"></div>',
      `<div id="pint"><b>${i1}</b>${i2 ? `<b>${i2}</b>` : ""}</div>`,
      `<span id="pbn" class="bn">${esc(c.brand)}</span>`,
      `<div id="pic">${svgIcon(c.icon)}</div>`,
      c.offer ? `<div id="pof"><b>${esc(off[0])}</b><span>${esc(off[1])}</span></div>` : "",
      `<div id="ct"><div id="hl" class="hd">${hlHtml(c, wide)}</div><p id="sub">${esc(c.sub)}</p>${tall ? featsHtml(c) : ""}</div>`,
      ctaHtml(c),
      legalHtml(c),
    ],
    tl: [
      `.set("#pint",{autoAlpha:1},0)`,
      `.from("#pint b",{y:28,autoAlpha:0,stagger:.15,duration:.45,ease:"power3.out"},.15)`,
      `.to("#pint",{autoAlpha:0,duration:.3},1.7)`,
      `.fromTo("#pn",{${prop}:${from}},{${prop}:${to},duration:.7,ease:"power3.inOut"},1.95)`,
      `.from("#pbn",{autoAlpha:0,y:-8,duration:.35},2.5)`,
      `.from("#pic",{autoAlpha:0,scale:.4,rotation:-20,duration:.5,ease:"back.out(2)"},2.55)`,
      c.offer ? `.from("#pof",{autoAlpha:0,y:10,duration:.4},2.7)` : "",
      `.from("#hl",{autoAlpha:0,x:${flip ? -20 : 20},duration:.45,ease:"power3.out"},2.6)`,
      `.from("#sub",{autoAlpha:0,x:${flip ? -14 : 14},duration:.4},2.8)`,
      tall ? `.from(".fl li",{autoAlpha:0,x:-10,stagger:.15,duration:.35},3)` : "",
      `.from("#cta",{autoAlpha:0,y:12,duration:.45,ease:"back.out(2)"},3.3)`,
      legalTl(c, 3.5),
      ...tail(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 2. Kinetic Type — oversized words punch in, colour wipe, masked end */
/* ------------------------------------------------------------------ */
function kinetic({ c, t, key, wide, tall }) {
  const [i1, i2 = ""] = lines(c.intro);
  const [h1, h2 = ""] = lines(c.headline);
  const kfs = (s) => (wide ? fitFont(s, 660, 54, 0.68) : tall ? fitFont(longestWord(s), 132, 46, 0.7) : fitFont(s, 270, 62, 0.68));
  const hfs = wide
    ? fitFont(plain(c.headline), 430, 28, 0.7)
    : tall
      ? fitFont(longestWord(c.headline), 124, 30, 0.78)
      : fitFont(longest(h1, h2), 262, 32, 0.72);

  const sizeCss = {
    "300x250": `#br{left:14px;top:14px}
#kc{left:14px;top:44px;width:272px}
#sub{margin-top:10px}
#of{right:14px;top:12px}
#cta{left:14px;bottom:16px;height:36px;padding:0 20px;font-size:13px}
#legal{right:14px;bottom:8px;max-width:110px;text-align:right}`,
    "728x90": `#br{left:16px;top:11px}
#kc{left:16px;top:25px;width:470px}
.ln{display:inline-block;margin-right:.22em}
#hl{white-space:nowrap}
#sub{margin-top:3px;white-space:nowrap}
#of{left:468px;top:32px;font-size:11px}
#cta{left:576px;top:${c.legal ? 18 : 24}px;width:136px;height:40px;font-size:13px}
#legal{left:566px;top:64px;width:156px;text-align:center}`,
    "160x600": `#br{left:0;top:22px;width:100%;flex-direction:column;gap:8px;font-size:11px}
#br .mk{width:30px;height:30px;border-radius:8px}
#kc{left:14px;top:80px;width:132px;height:380px;display:flex;flex-direction:column;justify-content:center}
#sub{margin-top:14px;font-size:11.5px}
#of{left:14px;bottom:108px}
#cta{left:14px;bottom:48px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}`,
  }[key];

  return {
    css: `.kw{inset:0;z-index:4;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 10px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;line-height:.95;visibility:hidden}
#k1{font-size:${kfs(i1)}px}
#k2{font-size:${kfs(i2)}px;color:${t.accent}}
#fl{inset:0;z-index:6;background:${t.accent};transform:scaleY(0)}
#br{display:flex;align-items:center;gap:6px;font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase}
#br .mk{width:18px;height:18px;border-radius:5px}
#hl{font-size:${hfs}px;font-weight:900;text-transform:uppercase;letter-spacing:-1px;line-height:1}
.ln{display:block;overflow:hidden;padding:1px 0 2px}
.lt{display:inline-block}
.lt2{background:${t.accent};color:${t.onAccent};padding:0 .12em}
#sub{font-size:11px;line-height:1.4}
#of{padding:3px 8px;border:2px solid ${t.accent};border-radius:4px;color:${t.accent};font-size:12px;font-weight:900;letter-spacing:.5px;text-transform:uppercase;transform:rotate(-6deg);white-space:nowrap}
${sizeCss}`,
    body: [
      `<div id="k1" class="kw">${i1}</div>`,
      `<div id="k2" class="kw">${i2}</div>`,
      `<div id="br"><span class="mk">${svgIcon(c.icon)}</span><span>${esc(c.brand)}</span></div>`,
      `<div id="kc"><div id="hl"><span class="ln"><span class="lt">${h1}</span></span>${h2 ? `<span class="ln"><span class="lt lt2">${h2}</span></span>` : ""}</div><p id="sub">${esc(c.sub)}</p></div>`,
      c.offer ? `<div id="of">${esc(c.offer.join(" "))}</div>` : "",
      ctaHtml(c),
      legalHtml(c),
      '<div id="fl"></div>',
    ],
    tl: [
      `.fromTo("#k1",{autoAlpha:0,scale:2.4},{autoAlpha:1,scale:1,duration:.35,ease:"power4.out"},.1)`,
      `.to("#k1",{autoAlpha:0,scale:.7,duration:.2,ease:"power2.in"},.85)`,
      `.fromTo("#k2",{autoAlpha:0,yPercent:60},{autoAlpha:1,yPercent:0,duration:.35,ease:"power4.out"},.95)`,
      `.fromTo("#fl",{scaleY:0,transformOrigin:"50% 100%"},{scaleY:1,duration:.3,ease:"power3.in"},1.6)`,
      `.set("#k2",{autoAlpha:0},1.9)`,
      `.to("#fl",{scaleY:0,transformOrigin:"50% 0%",duration:.35,ease:"power3.out"},1.95)`,
      `.from("#br",{autoAlpha:0,y:-8,duration:.35},2.15)`,
      `.from(".lt",{yPercent:110,duration:.5,stagger:.12,ease:"power4.out"},2.2)`,
      `.from("#sub",{autoAlpha:0,duration:.4},2.75)`,
      c.offer ? `.from("#of",{scale:0,rotation:-40,duration:.5,ease:"back.out(2.5)"},2.9)` : "",
      `.from("#cta",{autoAlpha:0,x:-16,duration:.4,ease:"power3.out"},3.2)`,
      legalTl(c, 3.4),
      ...tail(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 3. Card Stack — feature cards fly in and fan out                    */
/* ------------------------------------------------------------------ */
function cards({ c, t, key, w, wide, tall }) {
  const cardBg = t.dark ? rgba("#FFFFFF", 0.07) : "#FFFFFF";
  const cardBorder = t.dark ? rgba("#FFFFFF", 0.12) : rgba(t.text, 0.08);
  const spec = {
    "300x250": { cards: [[16, 100, -2], [26, 134, 1.5], [18, 168, -1]], cw: 176, ch: 28, fs: 11 },
    "728x90": { cards: [[190, 44, -2], [316, 48, 1.5], [442, 44, -1]], cw: 120, ch: 32, fs: 10 },
    "160x600": { cards: [[14, 172, -2], [20, 216, 1.5], [12, 260, -1]], cw: 132, ch: 36, fs: 10.5 },
  }[key];
  const cardCss = spec.cards
    .map(([l, tp, r], i) => `#cd${i + 1}{left:${l}px;top:${tp}px;width:${spec.cw}px;height:${spec.ch}px;font-size:${spec.fs}px;transform:rotate(${r}deg)}`)
    .join("\n");

  const sizeCss = {
    "300x250": `#logo{left:14px;top:12px}
.mk{width:22px;height:22px;border-radius:6px}
.bn{font-size:12.5px}
#hl{left:16px;top:40px;width:${c.offer ? 206 : 268}px;font-size:19px}
#hero{left:206px;top:112px;width:78px;height:78px}
#cta{left:16px;bottom:12px;height:32px;padding:0 18px;font-size:12.5px}
#legal{right:12px;bottom:8px;max-width:100px;text-align:right}
${badgeCss(c, t, 54, "right:10px;top:8px")}`,
    "728x90": `#logo{left:16px;top:0;height:88px}
.mk{width:34px;height:34px;border-radius:9px}
.bn{font-size:${fitFont(c.brand, 120, 15, 0.58)}px}
#hl{left:190px;top:12px;font-size:17px;white-space:nowrap}
#cta{left:576px;top:${c.legal ? 18 : 24}px;width:136px;height:40px;font-size:13px}
#legal{left:566px;top:64px;width:156px;text-align:center}
${badgeCss(c, t, 40, "left:684px;top:2px")}`,
    "160x600": `#logo{left:0;top:22px;width:100%;flex-direction:column;gap:8px}
.mk{width:36px;height:36px;border-radius:10px}
.bn{font-size:13px;text-align:center}
#hl{left:14px;top:90px;width:132px;font-size:18px}
#hero{left:40px;top:318px;width:80px;height:80px}
#sub{left:14px;top:414px;width:132px;font-size:11px;line-height:1.45;text-align:center}
#cta{left:14px;bottom:48px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}
${badgeCss(c, t, 52, "right:12px;top:306px")}`,
  }[key];

  return {
    css: `#logo{display:flex;align-items:center;gap:8px}
.cd{display:flex;align-items:center;gap:8px;padding:0 10px;border-radius:8px;background:${cardBg};border:1px solid ${cardBorder};box-shadow:0 6px 14px rgba(0,0,0,${t.dark ? 0.35 : 0.08});font-weight:600;line-height:1.15}
.cd i{flex:0 0 18px;display:flex;align-items:center;justify-content:center;width:18px;height:18px;border-radius:50%;background:${t.accent};color:${t.onAccent}}
.cd i svg{width:10px;height:10px}
#hero{display:flex;align-items:center;justify-content:center;border-radius:50%;background:${rgba(t.accent, 0.12)};border:1px solid ${rgba(t.accent, 0.35)};color:${t.accent}}
#hero svg{width:56%;height:56%}
${cardCss}
${sizeCss}`,
    body: [
      logoHtml(c),
      `<div id="hl" class="hd">${hlHtml(c, wide)}</div>`,
      ...c.features.slice(0, 3).map((f, i) => `<div id="cd${i + 1}" class="cd"><i>${CHECK}</i><span>${esc(f)}</span></div>`),
      wide ? "" : `<div id="hero">${svgIcon(c.icon)}</div>`,
      badgeHtml(c),
      tall ? `<p id="sub">${esc(c.sub)}</p>` : "",
      ctaHtml(c),
      legalHtml(c),
    ],
    tl: [
      wide
        ? `.from(".cd",{y:-60,rotation:14,autoAlpha:0,stagger:.35,duration:.55,ease:"back.out(1.5)"},.15)`
        : `.from(".cd",{x:${Math.round(w * 0.9)},rotation:14,autoAlpha:0,stagger:.35,duration:.55,ease:"back.out(1.5)"},.15)`,
      `.from(".cd i",{scale:0,stagger:.35,duration:.3,ease:"back.out(3)"},.5)`,
      `.from("#logo",{autoAlpha:0,y:-8,duration:.35},1.4)`,
      `.from("#hl",{autoAlpha:0,y:14,duration:.45,ease:"power3.out"},1.6)`,
      wide ? "" : `.from("#hero",{scale:0,autoAlpha:0,duration:.5,ease:"back.out(1.8)"},1.9)`,
      c.offer ? `.from(".bdg",{scale:0,rotation:-160,duration:.5,ease:"back.out(2)"},2.2)` : "",
      tall ? `.from("#sub",{autoAlpha:0,duration:.4},2.3)` : "",
      `.to(".cd",{y:"-=3",duration:.3,stagger:.1,yoyo:true,repeat:1,ease:"sine.inOut"},2.6)`,
      `.from("#cta",{autoAlpha:0,scale:.6,duration:.45,ease:"back.out(2)"},2.9)`,
      legalTl(c, 3.1),
      ...tail(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 4. Live Data Chart — chart draws itself while a stat counts up      */
/* ------------------------------------------------------------------ */
function chartSvg(cw, ch, seed, variant, t) {
  const r = rng(seed);
  const val = (i, n) => Math.max(0.12, Math.min(1, 0.22 + 0.72 * (i / (n - 1)) + (r() - 0.5) * 0.18));
  const grid = [0.25, 0.5, 0.75]
    .map((f) => `<path d="M0 ${Math.round(ch * f)}H${cw}" stroke="${rgba(t.text, 0.08)}" stroke-dasharray="3 5"/>`)
    .join("");

  if (variant === "bars") {
    const n = 7;
    const gap = cw * 0.05;
    const bw = (cw - gap * (n + 1)) / n;
    const bars = Array.from({ length: n }, (_, i) => {
      const bh = val(i, n) * (ch - 8);
      const fill = i === n - 1 ? t.accent : rgba(t.accent, 0.38);
      return `<rect class="br" x="${(gap + i * (bw + gap)).toFixed(1)}" y="${(ch - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="${fill}"/>`;
    }).join("");
    return `<svg width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}" aria-hidden="true">${grid}${bars}</svg>`;
  }

  const n = 9;
  const pts = Array.from({ length: n }, (_, i) => [(i * cw) / (n - 1), 8 + (1 - val(i, n)) * (ch - 16)]);
  pts[n - 1][0] -= 6; // keep the end dot inside the canvas
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
  const [ex, ey] = pts[n - 1];
  return `<svg width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}" aria-hidden="true"><defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.accent}" stop-opacity=".35"/><stop offset="1" stop-color="${t.accent}" stop-opacity="0"/></linearGradient></defs>${grid}<path id="ar" d="${d}L${ex.toFixed(1)} ${ch}L0 ${ch}Z" fill="url(#ag)"/><path id="ln" d="${d}" fill="none" stroke="${t.accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/><circle id="dr" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="4" fill="none" stroke="${t.accent}" stroke-width="1.5"/><circle id="dt" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="4" fill="${t.accent}"/></svg>`;
}

function data({ c, t, key, wide, tall }) {
  const bars = c.variant === "bars";
  const m = c.stat[0].match(/^([^\d]*)([\d,]+(?:\.\d+)?)(.*)$/);
  const [pre, numStr, suf] = [m[1], m[2], m[3]];
  const target = parseFloat(numStr.replace(/,/g, ""));
  const dec = (numStr.split(".")[1] || "").length;

  const geo = {
    "300x250": { cw: 300, ch: 100 },
    "728x90": { cw: 390, ch: 70 },
    "160x600": { cw: 160, ch: 120 },
  }[key];

  const sizeCss = {
    "300x250": `#logo{left:14px;top:12px}
.mk{width:22px;height:22px;border-radius:6px}
.bn{font-size:12.5px}
#st{left:16px;top:38px}
#num{font-size:34px}
#ct{left:16px;top:96px;width:268px}
#hl{font-size:18px}
#ch{left:0;bottom:0}
#cta{left:16px;bottom:14px;height:32px;padding:0 18px;font-size:12.5px}
#legal{right:12px;bottom:6px;max-width:130px;text-align:right}`,
    "728x90": `#logo{left:16px;top:0;height:88px}
.mk{width:34px;height:34px;border-radius:9px}
.bn{font-size:${fitFont(c.brand, 120, 15, 0.58)}px}
#st{left:186px;top:0;width:112px;height:88px;display:flex;flex-direction:column;justify-content:center}
#num{font-size:26px}
#st span{font-size:9.5px}
#ch{left:180px;top:14px}
#ct{left:306px;top:0;width:262px;height:88px;display:flex;flex-direction:column;justify-content:center}
#hl{font-size:18px;white-space:nowrap}
#sub{margin-top:4px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cta{left:576px;top:${c.legal ? 18 : 24}px;width:136px;height:40px;font-size:13px}
#legal{left:566px;top:64px;width:156px;text-align:center}`,
    "160x600": `#logo{left:0;top:22px;width:100%;flex-direction:column;gap:8px}
.mk{width:36px;height:36px;border-radius:10px}
.bn{font-size:13px;text-align:center}
#st{left:0;top:100px;width:100%;text-align:center}
#num{font-size:${fitFont(c.stat[0], 140, 38, 0.6)}px}
#ch{left:0;top:170px}
#ct{left:14px;top:312px;width:132px}
#hl{font-size:18px}
#sub{margin-top:8px;font-size:11px;line-height:1.45}
.fl{margin-top:14px}
#cta{left:14px;bottom:48px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}
${flCss(t, 9, 10.5)}`,
  }[key];

  const fmt = `function F(v){return ${JSON.stringify(pre)}+v.toFixed(${dec}).replace(/\\B(?=(\\d{3})+(?!\\d))/g,",")+${JSON.stringify(suf)}}`;

  return {
    css: `#logo{display:flex;align-items:center;gap:8px}
#num{display:block;font-weight:900;letter-spacing:-1px;line-height:1;color:${t.accent};font-variant-numeric:tabular-nums}
#st span{font-size:10.5px;color:${t.muted}}
#ch{width:${geo.cw}px;height:${geo.ch}px}
#ch svg{display:block}
#dr{opacity:0}
${sizeCss}`,
    body: [
      logoHtml(c),
      `<div id="ch">${chartSvg(geo.cw, geo.ch, c.id * 7919, c.variant, t)}</div>`,
      `<div id="st"><b id="num">${esc(c.stat[0])}</b><span>${esc(c.stat[1])}</span></div>`,
      `<div id="ct"><div id="hl" class="hd">${hlHtml(c, wide)}</div>${key === "300x250" ? "" : `<p id="sub">${esc(c.sub)}</p>`}${tall ? featsHtml(c) : ""}</div>`,
      ctaHtml(c),
      legalHtml(c),
    ],
    js: `var N={v:0},E=document.getElementById("num");${fmt}`,
    tl: [
      `.from("#logo",{autoAlpha:0,duration:.4},0)`,
      `.from("#st",{autoAlpha:0,y:10,duration:.35},.2)`,
      `.fromTo(N,{v:0},{v:${target},duration:1.5,ease:"power2.out",onUpdate:function(){E.textContent=F(N.v)}},.2)`,
      ...(bars
        ? [`.from(".br",{scaleY:0,transformOrigin:"50% 100%",stagger:.1,duration:.5,ease:"power3.out"},.3)`]
        : [
            `.fromTo("#ln",{attr:{"stroke-dashoffset":1}},{attr:{"stroke-dashoffset":0},duration:1.5,ease:"power2.inOut"},.3)`,
            `.from("#ar",{autoAlpha:0,duration:.8},1.2)`,
            `.from("#dt",{scale:0,transformOrigin:"50% 50%",duration:.35,ease:"back.out(3)"},1.75)`,
            `.fromTo("#dr",{scale:1,autoAlpha:.9,transformOrigin:"50% 50%"},{scale:3.2,autoAlpha:0,duration:1,repeat:1,immediateRender:false},2)`,
          ]),
      wide ? `.to("#ch",{autoAlpha:.28,duration:.5},2.1)` : "",
      `.from("#hl",{autoAlpha:0,y:12,duration:.45,ease:"power3.out"},2.3)`,
      key === "300x250" ? "" : `.from("#sub",{autoAlpha:0,duration:.4},2.55)`,
      tall ? `.from(".fl li",{autoAlpha:0,x:-10,stagger:.15,duration:.35},2.7)` : "",
      `.from("#cta",{autoAlpha:0,scale:.6,duration:.45,ease:"back.out(2)"},3.2)`,
      legalTl(c, 3.4),
      ...tail(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 5. Spotlight Burst — rotating light rays, bouncing product, sparks  */
/* ------------------------------------------------------------------ */
function spotlight({ c, t, key, wide, tall }) {
  const g = {
    "300x250": { cx: 150, cy: 84, rays: 230, glow: 120, icon: 62, pod: [120, 16, 40] },
    "728x90": { cx: 64, cy: 45, rays: 170, glow: 84, icon: 42, pod: [70, 10, 22] },
    "160x600": { cx: 80, cy: 150, rays: 280, glow: 140, icon: 76, pod: [130, 18, 48] },
  }[key];
  const box = (id, s, dy = 0) => `#${id}{left:${Math.round(g.cx - s / 2)}px;top:${Math.round(g.cy + dy - s / 2)}px;width:${s}px;height:${s}px}`;
  const k = g.icon / 62;
  const sparks = [[-44, 20], [40, 10], [-24, -6], [30, 30], [-8, 34], [52, -10]]
    .map(([dx, dy], i) => `#p${i}{left:${Math.round(g.cx + dx * k)}px;top:${Math.round(g.cy + dy * k)}px}`)
    .join("\n");
  const [i1, i2 = ""] = lines(c.intro);

  const sizeCss = {
    "300x250": `#bn{left:0;top:12px;width:100%;text-align:center;font-size:10.5px}
#it,#ct{left:16px;top:140px;width:268px;text-align:center}
#it{font-size:${fitFont(`${i1} ${i2}`, 268, 22, 0.58)}px}
#hl{font-size:19px}
#cta{left:75px;bottom:${c.legal ? 22 : 16}px;width:150px;height:34px;font-size:13px}
#legal{left:0;bottom:6px;width:100%;text-align:center;font-size:7px}
${badgeCss(c, t, 54, "right:10px;top:10px")}`,
    "728x90": `#bn{left:134px;top:14px;font-size:9.5px}
#it{left:134px;top:0;height:88px;display:flex;align-items:center;font-size:${fitFont(`${i1} ${i2}`, 340, 22, 0.58)}px}
#ct{left:134px;top:28px;width:350px}
#hl{font-size:19px;white-space:nowrap}
#sub{margin-top:4px;font-size:11px;white-space:nowrap}
#cta{left:576px;top:${c.legal ? 18 : 24}px;width:136px;height:40px;font-size:13px}
#legal{left:566px;top:64px;width:156px;text-align:center}
${badgeCss(c, t, 56, "left:500px;top:17px")}`,
    "160x600": `#bn{left:0;top:26px;width:100%;text-align:center;font-size:10px}
#it,#ct{left:14px;top:246px;width:132px;text-align:center}
#it{font-size:${fitFont(longestWord(c.intro), 132, 24, 0.62)}px}
#hl{font-size:19px}
#sub{margin-top:10px;font-size:11px;line-height:1.45}
.fl{margin:16px auto 0;width:max-content;max-width:132px;text-align:left}
#cta{left:14px;bottom:48px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}
${flCss(t, 9, 10.5)}
${badgeCss(c, t, 52, "right:10px;top:74px")}`,
  }[key];

  return {
    css: `#rays{border-radius:50%;background:repeating-conic-gradient(from 0deg,${rgba(t.accent, 0.22)} 0deg 7deg,transparent 7deg 20deg);-webkit-mask-image:radial-gradient(circle,#000 18%,transparent 68%);mask-image:radial-gradient(circle,#000 18%,transparent 68%)}
#glow{border-radius:50%;background:radial-gradient(circle,${rgba(t.accent2, 0.45)},transparent 65%)}
#pod{border-radius:50%;background:radial-gradient(ellipse,${rgba(t.accent, 0.55)},transparent 70%)}
#hero{color:${t.accent};filter:drop-shadow(0 0 8px ${rgba(t.accent, 0.6)})}
#hero svg{width:100%;height:100%}
.pt{width:4px;height:4px;border-radius:50%;background:${t.accent2}}
#bn{font-weight:800;letter-spacing:3px;text-transform:uppercase;color:${t.accent}}
#it{font-family:${t.serif ? SERIF : SANS};font-weight:${t.serif ? 400 : 900};letter-spacing:${t.serif ? 0 : "-.5px"};line-height:1.1;visibility:hidden}
#it em{font-style:${t.serif ? "italic" : "normal"};color:${t.accent}}
${box("rays", g.rays)}
${box("glow", g.glow)}
${box("hero", g.icon)}
#pod{left:${Math.round(g.cx - g.pod[0] / 2)}px;top:${Math.round(g.cy + g.pod[2] - g.pod[1] / 2)}px;width:${g.pod[0]}px;height:${g.pod[1]}px}
${sparks}
${sizeCss}`,
    body: [
      '<div id="rays"></div>',
      '<div id="glow"></div>',
      '<div id="pod"></div>',
      ...Array.from({ length: 6 }, (_, i) => `<i id="p${i}" class="pt"></i>`),
      `<div id="hero">${svgIcon(c.icon)}</div>`,
      `<span id="bn">${esc(c.brand)}</span>`,
      `<div id="it">${i1}${tall ? "<br>" : " "}<em>${i2}</em></div>`,
      `<div id="ct"><div id="hl" class="hd">${hlHtml(c, wide)}</div>${key === "300x250" ? "" : `<p id="sub">${esc(c.sub)}</p>`}${tall && c.features ? featsHtml(c) : ""}</div>`,
      badgeHtml(c),
      ctaHtml(c),
      legalHtml(c),
    ],
    tl: [
      `.from("#glow",{scale:.3,autoAlpha:0,duration:1,ease:"power2.out"},0)`,
      `.from("#rays",{scale:.4,autoAlpha:0,duration:1.2,ease:"power2.out"},0)`,
      `.to("#rays",{rotation:45,duration:${LOOP},ease:"none"},0)`,
      `.from("#hero",{y:-50,scale:.5,autoAlpha:0,duration:.8,ease:"bounce.out"},.2)`,
      `.from("#pod",{scaleX:0,autoAlpha:0,duration:.5},.6)`,
      `.fromTo(".pt",{y:14,autoAlpha:0},{y:-22,autoAlpha:1,duration:.9,stagger:.2,yoyo:true,repeat:1,ease:"sine.out"},.5)`,
      `.from("#bn",{autoAlpha:0,letterSpacing:"10px",duration:.6},.3)`,
      `.fromTo("#it",{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.45},.7)`,
      `.to("#it",{autoAlpha:0,y:-10,duration:.3},2)`,
      `.from("#hl",{autoAlpha:0,y:12,duration:.45,ease:"power3.out"},2.3)`,
      key === "300x250" ? "" : `.from("#sub",{autoAlpha:0,duration:.4},2.55)`,
      tall && c.features ? `.from(".fl li",{autoAlpha:0,x:-10,stagger:.15,duration:.35},2.75)` : "",
      c.offer ? `.from(".bdg",{scale:0,rotation:-160,duration:.5,ease:"back.out(2)"},2.7)` : "",
      `.from("#cta",{autoAlpha:0,scale:.6,duration:.45,ease:"back.out(2)"},3.1)`,
      legalTl(c, 3.3),
      ...tail(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 6. Countdown Ticker — marquee strip, big offer, flipping countdown  */
/* ------------------------------------------------------------------ */
function ticker({ c, t, key, w, wide, tall }) {
  const cd = c.countdown || ["23", "59", "48"];
  const labels = c.cdLabels || ["HRS", "MIN", "SEC"];
  const ticking = labels[2] === "SEC";
  const txt = esc((c.marquee || `${plain(c.headline)} • ${c.offer.join(" ")} •`).toUpperCase());
  const reps = Math.max(2, Math.ceil((w * 1.3) / (txt.length * 6.5)));
  const half = `<span>${Array(reps).fill(txt).join(" ")} </span>`;
  const track = (id) => `<div id="${id}" class="mq">${half}${half}</div>`;
  const boxBg = t.dark ? rgba("#FFFFFF", 0.08) : rgba(t.text, 0.06);
  const cdTitle = esc(`${plain(c.headline)} ends in`);

  const sizeCss = {
    "300x250": `#strip{left:0;top:0;width:100%;height:24px}
#logo{left:14px;top:34px}
.mk{width:20px;height:20px;border-radius:5px}
.bn{font-size:12px}
#big{left:14px;top:58px}
#big b{font-size:${fitFont(c.offer[0], 124, 52, 0.62)}px}
#big span{font-size:11px}
#hl{left:146px;top:62px;width:140px;font-size:16px}
#cdl{left:14px;top:136px}
#cd{left:14px;top:150px;gap:8px}
.bx{width:58px;height:40px}
.bx b{font-size:18px}
#hero{left:218px;top:136px;width:56px;height:56px}
#cta{left:14px;right:14px;bottom:12px;height:34px;font-size:13px}
#legal{right:14px;top:196px;font-size:7px}`,
    "728x90": `#strip{left:0;bottom:0;width:100%;height:18px;font-size:9px}
#logo{left:16px;top:0;height:72px}
.mk{width:30px;height:30px;border-radius:8px}
.bn{font-size:${fitFont(c.brand, 124, 15, 0.58)}px}
#big{left:190px;top:0;height:72px;display:flex;flex-direction:column;justify-content:center}
#big b{font-size:${fitFont(c.offer[0], 104, 34, 0.62)}px}
#big span{font-size:9px}
#cdl{left:312px;top:8px;width:178px;letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cd{left:312px;top:22px;gap:6px}
.bx{width:48px;height:40px}
.bx b{font-size:17px}
#hero{left:496px;top:12px;width:48px;height:48px}
#cta{left:576px;top:${c.legal ? 12 : 16}px;width:136px;height:40px;font-size:13px}
#legal{left:566px;top:56px;width:156px;text-align:center;font-size:7px}`,
    "160x600": `#strip,#strip2{left:0;width:100%}
#strip{top:0;height:26px}
#strip2{bottom:0;height:22px}
#logo{left:0;top:40px;width:100%;flex-direction:column;gap:6px}
.mk{width:32px;height:32px;border-radius:9px}
.bn{font-size:13px;text-align:center}
#big{left:0;top:118px;width:100%;text-align:center}
#big b{font-size:${fitFont(c.offer[0], 140, 64, 0.62)}px}
#big span{font-size:12px}
#hl{left:14px;top:222px;width:132px;font-size:18px;text-align:center}
#cdl{left:0;top:300px;width:100%;text-align:center}
#cd{left:14px;top:316px;gap:6px}
.bx{width:40px;height:46px}
.bx b{font-size:18px}
#sub{left:14px;top:376px;width:132px;text-align:center;font-size:11px;line-height:1.45}
#hero{left:52px;top:430px;width:56px;height:56px}
#cta{left:14px;bottom:56px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:30px;width:140px;text-align:center}`,
  }[key];

  const tickTl = [];
  if (ticking) {
    const s0 = parseInt(cd[2], 10);
    [1.8, 2.8, 3.8, 4.8, 5.8].forEach((at, i) => {
      const v = String((s0 - i - 1 + 60) % 60).padStart(2, "0");
      tickTl.push(`.call(T,["${v}"],${at})`, `.fromTo("#d3",{rotationX:-90},{rotationX:0,duration:.25,ease:"back.out(2)",immediateRender:false},${at})`);
    });
  }

  return {
    css: `#logo{display:flex;align-items:center;gap:8px}
#strip,#strip2{z-index:3;display:flex;align-items:center;overflow:hidden;background:${t.accent};color:${t.onAccent};font-size:10px;font-weight:800;letter-spacing:1.5px}
.mq{display:flex;white-space:nowrap}
.mq span{padding-right:.5em}
#big b{display:block;font-weight:900;letter-spacing:-2px;line-height:.9;color:${t.accent}}
#big span{display:block;margin-top:4px;font-weight:800;letter-spacing:2px}
#cdl{font-size:8.5px;font-weight:800;letter-spacing:1.6px;text-transform:uppercase;color:${t.muted}}
#cd{display:flex;perspective:200px}
.bx{display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;background:${boxBg};border:1px solid ${rgba(t.accent, 0.3)}}
.bx b{display:block;font-weight:900;line-height:1;font-variant-numeric:tabular-nums}
.bx small{margin-top:2px;font-size:6.5px;font-weight:700;letter-spacing:1px;color:${t.muted}}
#hero{display:flex;align-items:center;justify-content:center;border-radius:50%;background:${rgba(t.accent, 0.12)};border:1px solid ${rgba(t.accent, 0.35)};color:${t.accent}}
#hero svg{width:56%;height:56%}
${sizeCss}`,
    body: [
      `<div id="strip">${track("mq")}</div>`,
      tall ? `<div id="strip2">${track("mq2")}</div>` : "",
      logoHtml(c),
      `<div id="big"><b>${esc(c.offer[0])}</b><span>${esc(c.offer[1])}</span></div>`,
      wide ? "" : `<div id="hl" class="hd">${hlHtml(c, false)}</div>`,
      `<p id="cdl">${wide ? cdTitle : "Offer ends in"}</p>`,
      `<div id="cd">${cd.map((v, i) => `<div class="bx"><b id="d${i + 1}">${esc(v)}</b><small>${labels[i]}</small></div>`).join("")}</div>`,
      tall ? `<p id="sub">${esc(c.sub)}</p>` : "",
      `<div id="hero">${svgIcon(c.icon)}</div>`,
      ctaHtml(c),
      legalHtml(c),
    ],
    js: ticking ? `var D3=document.getElementById("d3");function T(v){D3.textContent=v}` : "",
    tl: [
      `.fromTo("#mq",{xPercent:0},{xPercent:-50,duration:${LOOP},ease:"none"},0)`,
      tall ? `.fromTo("#mq2",{xPercent:-50},{xPercent:0,duration:${LOOP},ease:"none"},0)` : "",
      `.from("#strip",{yPercent:${wide ? 100 : -100},duration:.4},0)`,
      `.from("#logo",{autoAlpha:0,duration:.35},.2)`,
      `.from("#big b",{scale:3,autoAlpha:0,duration:.45,ease:"power4.out"},.35)`,
      `.from("#big span",{autoAlpha:0,y:8,duration:.3},.7)`,
      `.to("#big b",{scale:1.08,duration:.12,yoyo:true,repeat:3},.9)`,
      wide ? "" : `.from("#hl",{autoAlpha:0,x:14,duration:.4},1.1)`,
      `.from("#cdl",{autoAlpha:0,duration:.3},1.3)`,
      `.from(".bx",{autoAlpha:0,y:12,stagger:.1,duration:.35,ease:"back.out(2)"},1.35)`,
      ticking ? `.call(T,["${esc(cd[2])}"],0)` : "",
      ...tickTl,
      `.from("#hero",{scale:0,duration:.45,ease:"back.out(2)"},2)`,
      tall ? `.from("#sub",{autoAlpha:0,duration:.4},2.2)` : "",
      `.from("#cta",{autoAlpha:0,scale:.6,duration:.45,ease:"back.out(2)"},2.5)`,
      legalTl(c, 2.7),
      ...tail(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 7. Editorial Serif — magazine layout with a revealed art panel      */
/* ------------------------------------------------------------------ */
function artSvg(aw, ah, variant, t, icon) {
  const bg = t.accent;
  const lite = t.base;
  const a2 = t.accent2;
  const m = Math.min(aw, ah);
  let shapes;
  if (variant === 0) {
    const archW = aw * 0.56;
    const ax = (aw - archW) / 2;
    const r = archW / 2;
    const top = ah * 0.3;
    shapes = `<path d="M${ax.toFixed(1)} ${ah}V${(top + r).toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(ax + archW).toFixed(1)} ${(top + r).toFixed(1)}V${ah}Z" fill="${lite}" opacity=".92"/><circle class="sn" cx="${(aw * 0.72).toFixed(1)}" cy="${(ah * 0.24).toFixed(1)}" r="${(m * 0.13).toFixed(1)}" fill="${a2}"/>`;
  } else if (variant === 1) {
    shapes = `<circle cx="${(aw * 0.36).toFixed(1)}" cy="${(ah * 0.62).toFixed(1)}" r="${(m * 0.36).toFixed(1)}" fill="${a2}" opacity=".9"/><circle cx="${(aw * 0.62).toFixed(1)}" cy="${(ah * 0.42).toFixed(1)}" r="${(m * 0.3).toFixed(1)}" fill="none" stroke="${lite}" stroke-width="1.5"/><circle class="sn" cx="${(aw * 0.62).toFixed(1)}" cy="${(ah * 0.42).toFixed(1)}" r="${(m * 0.06).toFixed(1)}" fill="${lite}"/>`;
  } else {
    const n = 4;
    const bw = aw / (n + 1);
    shapes =
      Array.from({ length: n }, (_, i) => {
        const bh = ah * (0.22 + i * 0.14);
        return `<rect x="${(bw * 0.5 + i * bw).toFixed(1)}" y="${(ah - bh).toFixed(1)}" width="${(bw * 0.9).toFixed(1)}" height="${bh.toFixed(1)}" fill="${lite}" opacity="${(0.95 - i * 0.12).toFixed(2)}"/>`;
      }).join("") + `<circle class="sn" cx="${(aw * 0.28).toFixed(1)}" cy="${(ah * 0.22).toFixed(1)}" r="${(m * 0.12).toFixed(1)}" fill="${a2}"/>`;
  }
  const gl = [0.9, 0.94, 0.98]
    .map((f, i) => `<path class="gl" d="M${(aw * 0.08).toFixed(1)} ${(ah * f - 3).toFixed(1)}H${(aw * (0.5 + i * 0.12)).toFixed(1)}" stroke="${a2}" stroke-width="1"/>`)
    .join("");
  const ic = `<svg x="10" y="10" width="22" height="22" viewBox="0 0 48 48" fill="none" stroke="${lite}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon]}</svg>`;
  return `<svg width="${aw}" height="${ah}" viewBox="0 0 ${aw} ${ah}" aria-hidden="true"><rect width="${aw}" height="${ah}" fill="${bg}"/>${shapes}${gl}${ic}</svg>`;
}

function editorial({ c, t, key, wide, tall }) {
  const art = { "300x250": [128, 250], "728x90": [170, 88], "160x600": [160, 270] }[key];
  const issue = `${esc(c.brand)} · No. ${String(c.id).padStart(2, "0")}`;

  const sizeCss = {
    "300x250": `#art{right:0;top:0}
#no{left:16px;top:16px;width:150px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#ec{left:16px;top:38px;width:150px}
#hl{font-size:20px}
#cta{left:16px;bottom:${c.legal ? 20 : 18}px;height:30px;padding:0 14px}
#legal{left:16px;bottom:5px;font-size:7px;max-width:150px}`,
    "728x90": `#no{left:16px;top:14px}
#ec{left:16px;top:28px;width:350px}
#hl{font-size:22px;white-space:nowrap}
#rule{display:none}
#sub{margin-top:4px;font-size:11px}
#art{left:384px;top:0}
#cta{left:576px;top:${c.legal ? 18 : 24}px;width:136px;height:38px}
#legal{left:566px;top:62px;width:156px;text-align:center}`,
    "160x600": `#art{left:0;top:0}
#vb{left:10px;top:18px;z-index:2;writing-mode:vertical-rl;transform:rotate(180deg);font-size:8.5px;letter-spacing:4px;text-transform:uppercase;color:${t.base};font-weight:700}
#no{left:14px;top:284px;width:132px;line-height:1.5}
#ec{left:14px;top:318px;width:132px}
#hl{font-size:20px}
#sub{font-size:11px}
#cta{left:14px;bottom:48px;width:132px;height:38px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}`,
  }[key];

  const reveal = wide ? ["inset(0% 100% 0% 0%)", "inset(0% 0% 0% 0%)"] : ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"];

  return {
    css: `#art{width:${art[0]}px;height:${art[1]}px;overflow:hidden}
#art>svg{display:block}
#no{font-size:8.5px;letter-spacing:2.5px;font-weight:700;text-transform:uppercase;color:${t.accent}}
#hl{font-family:${SERIF};font-weight:400;letter-spacing:0;line-height:1.12}
#hl em{font-style:italic;color:${t.accent}}
#rule{display:block;width:28px;height:1px;margin:12px 0;background:${t.text}}
#sub{font-size:10.5px;line-height:1.45}
#cta{background:transparent;color:${t.text};border:1px solid ${t.text};box-shadow:none;text-transform:uppercase;letter-spacing:1.6px;font-size:10px}
#shine{background:linear-gradient(90deg,transparent,${rgba(t.accent, 0.35)},transparent)}
${sizeCss}`,
    body: [
      `<div id="art">${artSvg(art[0], art[1], c.id % 3, t, c.icon)}</div>`,
      tall ? `<span id="vb">${esc(c.brand)}</span>` : "",
      `<p id="no">${issue}</p>`,
      `<div id="ec"><div id="hl">${hlHtml(c, wide)}</div><i id="rule"></i><p id="sub">${esc(c.sub)}</p></div>`,
      ctaHtml(c),
      legalHtml(c),
    ],
    tl: [
      `.fromTo("#art",{clipPath:"${reveal[0]}"},{clipPath:"${reveal[1]}",duration:1.1,ease:"power3.inOut"},.1)`,
      `.from("#art .sn",{scale:0,transformOrigin:"50% 50%",duration:.7,ease:"back.out(1.6)"},.9)`,
      `.from("#art .gl",{scaleX:0,transformOrigin:"0% 50%",stagger:.12,duration:.5},1)`,
      `.from("#no",{autoAlpha:0,x:-10,duration:.4},.6)`,
      tall ? `.from("#vb",{autoAlpha:0,duration:.6},1.2)` : "",
      `.from("#hl",{autoAlpha:0,letterSpacing:"6px",duration:.9,ease:"power2.out"},1)`,
      wide ? "" : `.from("#rule",{scaleX:0,transformOrigin:"0% 50%",duration:.5},1.6)`,
      `.from("#sub",{autoAlpha:0,y:8,duration:.4},1.8)`,
      `.from("#cta",{autoAlpha:0,y:10,duration:.45},2.3)`,
      legalTl(c, 2.5),
      `.to("#art>svg",{scale:1.06,transformOrigin:"50% 50%",duration:3.4,ease:"sine.inOut"},2.5)`,
      `.to("#shine",{x:220,duration:.9,ease:"power2.inOut"},4.4)`,
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 8. Neon Glitch — flickering neon frame, RGB-split intro, scanlines  */
/* ------------------------------------------------------------------ */
function neon({ c, t, key, wide, tall }) {
  const a = t.accent;
  const b = t.accent2;
  const glow = (col) => `0 0 3px #fff,0 0 8px ${col},0 0 18px ${col},0 0 30px ${rgba(col, 0.6)}`;
  const [i1, i2 = ""] = lines(c.intro);
  const gfs = wide ? fitFont(`${i1} ${i2}`, 600, 38, 0.66) : tall ? fitFont(longestWord(c.intro), 130, 34, 0.7) : fitFont(longest(i1, i2), 250, 40, 0.66);
  const gtxt = wide ? `${i1} ${i2}` : `${i1}<br>${i2}`;

  const sizeCss = {
    "300x250": `#nf{left:8px;top:8px;right:8px;bottom:8px;border-radius:10px}
#bn{left:0;top:18px;width:100%;text-align:center;font-size:12px}
#hero{left:122px;top:42px;width:56px;height:56px}
#hl{left:16px;top:108px;width:268px;text-align:center;font-size:20px}
#sub{left:16px;top:160px;width:268px;text-align:center;font-size:11px}
#of{right:18px;top:16px}
#cta{left:75px;bottom:${c.legal ? 26 : 22}px;width:150px;height:32px;font-size:12.5px}
#legal{left:0;bottom:12px;width:100%;text-align:center;font-size:7px}`,
    "728x90": `#nf{left:5px;top:5px;right:5px;bottom:5px;border-radius:8px}
#hero{left:22px;top:23px;width:42px;height:42px}
#bn{left:74px;top:0;height:88px;display:flex;align-items:center;letter-spacing:2px;font-size:${fitFont(c.brand.toUpperCase(), 112, 15, 0.86)}px}
#hl{left:204px;top:22px;font-size:19px;white-space:nowrap}
#sub{left:204px;top:52px;font-size:11px;white-space:nowrap}
#of{left:500px;top:32px}
#cta{left:576px;top:${c.legal ? 16 : 24}px;width:130px;height:40px;font-size:13px}
#legal{left:566px;top:62px;width:150px;text-align:center;font-size:7px}`,
    "160x600": `#nf{left:7px;top:7px;right:7px;bottom:7px;border-radius:10px}
#bn{left:0;top:28px;width:100%;text-align:center;font-size:12px}
#hero{left:40px;top:64px;width:80px;height:80px}
#hl{left:14px;top:170px;width:132px;text-align:center;font-size:19px}
#sub{left:14px;top:250px;width:132px;text-align:center;font-size:11px;line-height:1.45}
.fl{left:20px;top:310px;width:124px}
#of{left:30px;top:410px;width:100px;text-align:center}
#cta{left:16px;bottom:52px;width:128px;height:40px;font-size:12px}
#legal{left:10px;bottom:20px;width:140px;text-align:center}
${flCss({ accent: b }, 12, 10.5)}`,
  }[key];

  return {
    css: `#scan{inset:0;z-index:7;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(255,255,255,.035) 0 1px,transparent 1px 3px)}
#sw{left:0;top:0;width:100%;height:25%;z-index:7;pointer-events:none;background:linear-gradient(180deg,transparent,${rgba(a, 0.1)},transparent);transform:translateY(400%)}
#nf{border:1.5px solid ${a};box-shadow:0 0 6px ${a},0 0 14px ${rgba(a, 0.5)},inset 0 0 8px ${rgba(a, 0.45)}}
#g{inset:0;z-index:5;display:grid;place-items:center;visibility:hidden}
.gl{grid-area:1/1;text-align:center;font-size:${gfs}px;font-weight:900;line-height:1;text-transform:uppercase;letter-spacing:1px}
.g0{color:#fff;text-shadow:${glow(a)}}
.g1{color:${b};opacity:.8}
.g2{color:${a};opacity:.8}
#bn{color:#fff;font-weight:800;letter-spacing:3px;text-transform:uppercase;text-shadow:${glow(b)}}
#hero{color:${a};filter:drop-shadow(0 0 4px ${a}) drop-shadow(0 0 10px ${a})}
#hero svg{width:100%;height:100%}
#hl{color:#fff;font-weight:800;line-height:1.1;letter-spacing:-.3px;text-shadow:${glow(a)}}
#hl em{font-style:normal;text-shadow:${glow(b)}}
.fl li{color:#fff}
#of{padding:3px 8px;border:1px solid ${a};border-radius:4px;color:${a};font-size:10px;font-weight:800;letter-spacing:1px;text-shadow:0 0 6px ${a};box-shadow:0 0 8px ${rgba(a, 0.5)}}
#cta{background:transparent;border:1.5px solid ${b};color:#fff;text-shadow:0 0 6px ${b};box-shadow:0 0 10px ${rgba(b, 0.6)},inset 0 0 10px ${rgba(b, 0.4)}}
#legal{z-index:8}
${sizeCss}`,
    body: [
      '<div id="nf"></div>',
      `<div id="hero">${svgIcon(c.icon)}</div>`,
      `<span id="bn">${esc(c.brand)}</span>`,
      `<div id="hl">${hlHtml(c, wide)}</div>`,
      `<p id="sub">${esc(c.sub)}</p>`,
      tall ? featsHtml(c) : "",
      c.offer ? `<div id="of">${esc(c.offer.join(" "))}</div>` : "",
      ctaHtml(c),
      legalHtml(c),
      `<div id="g"><span class="gl g1">${gtxt}</span><span class="gl g2">${gtxt}</span><span class="gl g0">${gtxt}</span></div>`,
      '<div id="sw"></div>',
      '<div id="scan"></div>',
    ],
    tl: [
      `.fromTo("#nf",{autoAlpha:0},{autoAlpha:1,duration:.06,repeat:4,yoyo:true,repeatDelay:.07,ease:"none"},.05)`,
      `.fromTo("#sw",{yPercent:-100},{yPercent:400,duration:2.2,repeat:1,ease:"none"},0)`,
      `.set("#g",{autoAlpha:1},.35)`,
      `.from(".g0",{autoAlpha:0,duration:.05,repeat:4,yoyo:true},.35)`,
      `.to(".g1",{x:4,y:-1,duration:.05,repeat:11,yoyo:true,ease:"none"},.4)`,
      `.to(".g2",{x:-4,y:1,duration:.05,repeat:11,yoyo:true,ease:"none"},.4)`,
      `.to(".g1",{x:-5,duration:.04,repeat:7,yoyo:true,ease:"none"},1.4)`,
      `.to(".g2",{x:5,duration:.04,repeat:7,yoyo:true,ease:"none"},1.4)`,
      `.to("#g",{skewX:30,autoAlpha:0,duration:.15},1.95)`,
      `.fromTo("#hero",{autoAlpha:0},{autoAlpha:1,duration:.05,repeat:4,yoyo:true,repeatDelay:.05},2.1)`,
      `.fromTo("#bn",{autoAlpha:0},{autoAlpha:1,duration:.3},2.2)`,
      `.fromTo("#hl",{autoAlpha:0},{autoAlpha:1,duration:.05,repeat:6,yoyo:true,repeatDelay:.04},2.35)`,
      `.from("#sub",{autoAlpha:0,duration:.4},2.8)`,
      tall ? `.from(".fl li",{autoAlpha:0,x:-10,stagger:.15,duration:.35},3)` : "",
      c.offer ? `.from("#of",{scale:0,duration:.4,ease:"back.out(2)"},3.1)` : "",
      `.fromTo("#cta",{autoAlpha:0},{autoAlpha:1,duration:.05,repeat:4,yoyo:true,repeatDelay:.06},3.3)`,
      legalTl(c, 3.5),
      ...tail(),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* 9. Organic Blobs — morphing blob shapes with floating accents       */
/* ------------------------------------------------------------------ */
function blob({ c, t, key, wide, tall }) {
  const [i1, i2 = ""] = lines(c.intro);
  const sizeCss = {
    "300x250": `#b1{left:172px;top:96px;width:180px;height:180px}
#b2{left:196px;top:18px;width:36px;height:36px}
#b3{left:140px;top:204px;width:22px;height:22px}
#hero{left:200px;top:134px;width:70px;height:70px}
#logo{left:14px;top:14px}
.mk{width:22px;height:22px}
.bn{font-size:12.5px}
#bc,#it{left:16px;top:46px;width:156px}
#hl{font-size:18px}
#it{font-size:${fitFont(longest(i1, i2), 156, 26, 0.6)}px}
#sub{margin-top:8px;font-size:11px;line-height:1.4}
#cta{left:16px;bottom:${c.legal ? 20 : 16}px;height:36px;padding:0 20px;font-size:13px}
#legal{left:16px;bottom:5px;font-size:7px}
${badgeCss(c, t, 54, "left:236px;top:58px")}`,
    "728x90": `#b1{left:462px;top:-46px;width:170px;height:170px}
#b2{left:160px;top:56px;width:34px;height:34px}
#b3{left:176px;top:6px;width:18px;height:18px}
#hero{left:516px;top:20px;width:50px;height:50px}
#logo{left:16px;top:0;height:88px}
.mk{width:36px;height:36px}
.bn{font-size:${fitFont(c.brand, 120, 16, 0.58)}px}
#bc,#it{left:200px;top:0;width:250px;height:88px;display:flex;flex-direction:column;justify-content:center}
#hl{font-size:${fitFont(plain(c.headline), 250, 19, 0.56)}px;white-space:nowrap}
#it{font-size:${fitFont(`${i1} ${i2}`, 250, 24, 0.58)}px}
#sub{margin-top:4px;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#cta{left:590px;top:${c.legal ? 18 : 24}px;width:124px;height:40px;font-size:13px}
#legal{left:580px;top:64px;width:144px;text-align:center}
${badgeCss(c, t, 40, "left:452px;top:2px")}`,
    "160x600": `#b1{left:-24px;top:70px;width:196px;height:196px}
#b2{left:118px;top:64px;width:36px;height:36px}
#b3{left:12px;top:280px;width:22px;height:22px}
#hero{left:40px;top:132px;width:72px;height:72px}
#logo{left:0;top:22px;width:100%;flex-direction:column;gap:6px}
.mk{width:32px;height:32px}
.bn{font-size:13px;text-align:center}
#bc,#it{left:14px;top:306px;width:132px}
#hl{font-size:18px}
#it{font-size:${fitFont(longestWord(c.intro), 132, 26, 0.62)}px}
#sub{margin-top:8px;font-size:11px;line-height:1.45}
.fl{margin-top:12px}
#cta{left:14px;bottom:48px;width:132px;height:40px;font-size:12px}
#legal{left:10px;bottom:16px;width:140px;text-align:center}
${flCss(t, 8, 10.5)}
${badgeCss(c, t, 52, "right:8px;top:100px")}`,
  }[key];

  return {
    css: `.bl{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
#b1{background:linear-gradient(135deg,${t.accent},${t.accent2})}
#b2{background:${rgba(t.accent2, 0.55)}}
#b3{background:${rgba(t.accent, 0.35)}}
#hero{color:${t.onAccent}}
#hero svg{width:100%;height:100%}
#logo{display:flex;align-items:center;gap:8px}
.mk{border-radius:50%}
#cta{border-radius:999px}
#it{font-family:${t.serif ? SERIF : SANS};font-weight:${t.serif ? 400 : 900};line-height:1.05;letter-spacing:${t.serif ? 0 : "-.5px"};visibility:hidden}
#it em{font-style:${t.serif ? "italic" : "normal"};color:${t.accent}}
${sizeCss}
.bdg{border-radius:55% 45% 50% 50%/50% 55% 45% 50%}
.bdg::before{border-radius:inherit}`,
    body: [
      '<div id="b1" class="bl"></div>',
      '<div id="b2" class="bl"></div>',
      '<div id="b3" class="bl"></div>',
      `<div id="hero">${svgIcon(c.icon)}</div>`,
      logoHtml(c),
      `<div id="it">${i1}${wide ? " " : "<br>"}<em>${i2}</em></div>`,
      `<div id="bc"><div id="hl" class="hd">${hlHtml(c, wide)}</div><p id="sub">${esc(c.sub)}</p>${tall ? featsHtml(c) : ""}</div>`,
      badgeHtml(c),
      ctaHtml(c),
      legalHtml(c),
    ],
    tl: [
      `.from("#b1",{scale:0,duration:.9,ease:"elastic.out(1,.6)"},.1)`,
      `.to("#b1",{borderRadius:"35% 65% 60% 40%/45% 55% 45% 55%",rotation:12,duration:2.8,ease:"sine.inOut",yoyo:true,repeat:1},.3)`,
      `.from("#b2",{scale:0,duration:.6,ease:"back.out(2)"},.4)`,
      `.to("#b2",{x:6,y:-8,duration:1.2,yoyo:true,repeat:3,ease:"sine.inOut"},1)`,
      `.from("#b3",{scale:0,duration:.5,ease:"back.out(2)"},.6)`,
      `.to("#b3",{y:8,duration:1.2,yoyo:true,repeat:3,ease:"sine.inOut"},1.1)`,
      `.from("#hero",{scale:0,rotation:-30,duration:.6,ease:"back.out(2)"},.7)`,
      `.from("#logo",{autoAlpha:0,y:-8,duration:.4},.3)`,
      `.fromTo("#it",{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.5,ease:"power3.out"},.5)`,
      `.to("#it",{autoAlpha:0,y:-12,duration:.3},1.9)`,
      `.from("#hl",{autoAlpha:0,y:14,duration:.45,ease:"power3.out"},2.2)`,
      `.from("#sub",{autoAlpha:0,y:8,duration:.4},2.45)`,
      tall ? `.from(".fl li",{autoAlpha:0,x:-10,stagger:.15,duration:.35},2.65)` : "",
      c.offer ? `.from(".bdg",{scale:0,rotation:-120,duration:.55,ease:"back.out(2)"},2.8)` : "",
      `.from("#cta",{autoAlpha:0,scale:.6,duration:.45,ease:"back.out(2)"},3.2)`,
      legalTl(c, 3.4),
      ...tail(),
    ],
  };
}

export const STYLES = { split, kinetic, cards, data, spotlight, ticker, editorial, neon, blob };

export function buildStyled(c, key) {
  const { w, h } = SIZES[key];
  const ctx = { c, t: c.theme, key, w, h, wide: key === "728x90", tall: key === "160x600" };
  return page(c, key, STYLES[c.style](ctx));
}
