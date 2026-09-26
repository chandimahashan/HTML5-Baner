// "Classic Hero" style — the original template used by campaigns 1–20.
import { SIZES, SANS, SERIF, LOOP, PLAYS, GAP, TOTAL, CLICK_URL, GSAP_URL, rgba, esc, lines, CHECK } from "./util.mjs";
import { ICONS } from "./icons.mjs";

const svgIcon = (name, cls) =>
  `<svg class="${cls}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

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
export function classicPage(c, key) {
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
