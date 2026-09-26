/* AdStudioLab showcase — filtering, live previews, specs modal. Data comes from scripts/data.js. */
(() => {
  "use strict";

  const DATA = window.ADSTUDIO;
  if (!DATA) {
    console.error("AdStudioLab: scripts/data.js is missing. Run `node tools/build-ads.mjs`.");
    return;
  }

  const SIZE_KEYS = ["300x250", "728x90", "160x600"];
  const MAX_PREVIEW_H = { grid: 420, inspector: 600 };
  const PAGE_SIZE = 12; // cards revealed per "Show more" click
  const SANDBOX = "allow-scripts allow-popups allow-popups-to-escape-sandbox";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const pad = (n) => String(n).padStart(2, "0");
  const times = (key) => key.replace("x", "×");

  const ICON = {
    replay: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5"/></svg>',
    specs: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2M8 4h8v3H8zM8 12h8M8 16h5"/></svg>',
    open: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>',
    copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>',
  };

  /* ---------------- State ---------------- */
  const params = new URLSearchParams(location.search);
  const validCats = new Set(["all", ...DATA.categories.map((c) => c.slug)]);
  const state = {
    limit: PAGE_SIZE,
    category: validCats.has(params.get("category")) ? params.get("category") : "all",
    query: params.get("q") || "",
    view: params.get("view") === "inspector" ? "inspector" : "grid",
  };

  // Per-card runtime info: active size, whether the iframe has been loaded, DOM refs
  const cards = new Map();

  /* ---------------- Elements ---------------- */
  const els = {
    tabs: $("[data-tabs]"),
    search: $("[data-search]"),
    gallery: $("[data-gallery]"),
    results: $("[data-results]"),
    empty: $("[data-empty]"),
    modal: $("[data-modal]"),
    modalTitle: $("[data-modal-title]"),
    modalIndustry: $("[data-modal-industry]"),
    modalBody: $("[data-modal-body]"),
    toast: $("[data-toast]"),
    more: $("[data-more]"),
  };

  /* ---------------- Stats ---------------- */
  const allKb = DATA.campaigns.flatMap((c) => SIZE_KEYS.map((k) => c.sizes[k].kb));
  const avgKb = allKb.reduce((a, b) => a + b, 0) / allKb.length;
  const stat = (name, value) => { const el = $(`[data-stat="${name}"]`); if (el) el.textContent = value; };
  stat("campaigns", DATA.campaigns.length);
  stat("creatives", allKb.length);
  stat("avgkb", `${avgKb.toFixed(1)} KB`);
  stat("duration", `${DATA.animation.total}s`);
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------------- Tabs ---------------- */
  const tabDefs = [{ slug: "all", label: "All" }, ...DATA.categories];
  const countFor = (slug) =>
    slug === "all" ? DATA.campaigns.length : DATA.campaigns.filter((c) => c.category === slug).length;

  els.tabs.innerHTML = tabDefs
    .map(
      (t) => `<button type="button" role="tab" class="tab" data-cat="${t.slug}" aria-selected="false" tabindex="-1">
        ${esc(t.label)}<span class="tab__count">${countFor(t.slug)}</span></button>`
    )
    .join("");

  function syncTabs() {
    $$(".tab", els.tabs).forEach((tab) => {
      const on = tab.dataset.cat === state.category;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on);
      tab.tabIndex = on ? 0 : -1;
    });
  }

  els.tabs.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    state.category = tab.dataset.cat;
    update();
  });

  els.tabs.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    const tabs = $$(".tab", els.tabs);
    const i = tabs.findIndex((t) => t.dataset.cat === state.category);
    const next =
      e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    e.preventDefault();
    state.category = tabs[next].dataset.cat;
    update();
    tabs[next].focus();
  });

  /* ---------------- Cards ---------------- */
  function cardHTML(c) {
    const sizeBtns = SIZE_KEYS.map(
      (k, i) => `<button type="button" class="size-btn${i === 0 ? " is-active" : ""}" data-size="${k}" aria-pressed="${i === 0}">${times(k)}</button>`
    ).join("");

    const sizeRows = SIZE_KEYS.map((k) => {
      const s = c.sizes[k];
      return `<tr><td>${times(k)}</td><td>${esc(s.name)}</td><td>${s.kb} KB</td></tr>`;
    }).join("");

    const first = c.sizes[SIZE_KEYS[0]];

    return `
      <article class="card" data-id="${c.id}" style="--card-accent:${c.accent}">
        <div class="card__info">
          <div class="card__head">
            <div class="card__tags">
              <span class="tag">${esc(c.industry)}</span>
              <span class="style-chip" data-style="${esc(c.style)}">${esc(c.styleLabel)}</span>
            </div>
            <span class="card__num">#${pad(c.id)}</span>
          </div>
          <h3 class="card__title">${esc(c.title)}</h3>
          <p class="card__value">${esc(c.value)}</p>
          <div class="sizes" role="group" aria-label="Preview size for ${esc(c.title)}">${sizeBtns}</div>

          <div class="card__inspect">
            <dl class="meta-grid">
              <div><dt>Brand</dt><dd>${esc(c.brand)}</dd></div>
              <div><dt>Creative style</dt><dd>${esc(c.styleLabel)}</dd></div>
              <div><dt>Animation</dt><dd>${DATA.animation.loop}s × ${DATA.animation.plays} · ${DATA.animation.total}s total</dd></div>
              <div><dt>Primary CTA</dt><dd>${esc(c.cta)}</dd></div>
            </dl>
            <table class="size-table">
              <thead><tr><th scope="col">Size</th><th scope="col">Format</th><th scope="col">HTML</th></tr></thead>
              <tbody>${sizeRows}</tbody>
            </table>
            <ul class="keywords" aria-label="Keywords">${c.keywords.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>
          </div>
        </div>

        <div class="card__preview">
          <div class="stage" data-stage>
            <div class="fit" data-fit>
              <iframe data-frame title="${esc(c.title)} ${first.w}x${first.h} banner" width="${first.w}" height="${first.h}"
                      scrolling="no" frameborder="0" sandbox="${SANDBOX}"></iframe>
            </div>
            <span class="stage__label" data-label></span>
          </div>
          <div class="card__toolbar">
            <button type="button" class="tool" data-action="replay">${ICON.replay}<span>Replay Animation</span></button>
            <button type="button" class="tool" data-action="specs">${ICON.specs}<span>View Specs</span></button>
            <a class="tool" data-action="open" href="${first.path}" target="_blank" rel="noopener">${ICON.open}<span>Open in New Tab</span></a>
          </div>
        </div>
      </article>`;
  }

  els.gallery.innerHTML = DATA.campaigns.map(cardHTML).join("");

  DATA.campaigns.forEach((c) => {
    const el = $(`.card[data-id="${c.id}"]`, els.gallery);
    cards.set(c.id, {
      data: c,
      el,
      size: SIZE_KEYS[0],
      loaded: false,
      stage: $("[data-stage]", el),
      fit: $("[data-fit]", el),
      frame: $("[data-frame]", el),
      label: $("[data-label]", el),
      open: $('[data-action="open"]', el),
      haystack: [c.title, c.brand, c.industry, c.categoryLabel, c.styleLabel, c.value, c.cta, ...c.keywords, ...SIZE_KEYS]
        .join(" ")
        .toLowerCase(),
    });
  });

  /* ---------------- Preview scaling ---------------- */
  function fitCard(card) {
    const { w, h } = card.data.sizes[card.size];
    const cs = getComputedStyle(card.stage);
    const availW = card.stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (availW <= 0) return;
    const s = Math.min(1, availW / w, MAX_PREVIEW_H[state.view] / h);
    card.fit.style.width = `${Math.floor(w * s)}px`;
    card.fit.style.height = `${Math.floor(h * s)}px`;
    card.frame.style.transform = s < 1 ? `scale(${s})` : "";
    card.label.textContent = `${w}×${h}${s < 1 ? ` · ${Math.round(s * 100)}%` : " · 100%"}`;
  }
  const fitAll = () => cards.forEach((card) => !card.el.hidden && fitCard(card));

  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const card = cards.get(Number(entry.target.closest(".card").dataset.id));
      if (card) fitCard(card);
    });
  });
  cards.forEach((card) => resizeObserver.observe(card.stage));

  /* ---------------- Lazy loading ---------------- */
  function loadFrame(card, force = false) {
    const src = card.data.sizes[card.size].path;
    // Cache-busting query forces a fresh run so the animation restarts from frame one
    card.frame.src = force ? `${src}?replay=${Date.now()}` : src;
    card.loaded = true;
  }

  const lazyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = cards.get(Number(entry.target.dataset.id));
        if (card && !card.loaded) loadFrame(card);
        lazyObserver.unobserve(entry.target);
      });
    },
    { rootMargin: "300px 0px" }
  );
  cards.forEach((card) => lazyObserver.observe(card.el));

  /* ---------------- Card actions ---------------- */
  function setSize(card, key) {
    if (card.size === key) return;
    const s = card.data.sizes[key];
    card.size = key;
    $$(".size-btn", card.el).forEach((b) => {
      const on = b.dataset.size === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    card.frame.width = s.w;
    card.frame.height = s.h;
    card.frame.title = `${card.data.title} ${s.w}x${s.h} banner`;
    card.open.href = s.path;
    if (card.loaded) loadFrame(card, true);
    fitCard(card);
  }

  els.gallery.addEventListener("click", (e) => {
    const cardEl = e.target.closest(".card");
    if (!cardEl) return;
    const card = cards.get(Number(cardEl.dataset.id));

    const sizeBtn = e.target.closest(".size-btn");
    if (sizeBtn) return setSize(card, sizeBtn.dataset.size);

    const action = e.target.closest("[data-action]")?.dataset.action;
    if (action === "replay") {
      loadFrame(card, true);
      const btn = e.target.closest(".tool");
      btn.classList.remove("is-spinning");
      void btn.offsetWidth; // restart the icon spin
      btn.classList.add("is-spinning");
    } else if (action === "specs") {
      openSpecs(card);
    }
  });

  /* ---------------- Filtering ---------------- */
  function matches(card) {
    const c = card.data;
    if (state.category !== "all" && c.category !== state.category) return false;
    const terms = state.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return terms.every((t) => card.haystack.includes(t));
  }

  function syncURL() {
    const p = new URLSearchParams();
    if (state.category !== "all") p.set("category", state.category);
    if (state.query.trim()) p.set("q", state.query.trim());
    if (state.view !== "grid") p.set("view", state.view);
    const qs = p.toString();
    history.replaceState(null, "", `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`);
  }

  // Filters reset the page size; "Show more" keeps it growing
  function update({ keepLimit = false } = {}) {
    if (!keepLimit) state.limit = PAGE_SIZE;
    let matched = 0;
    let shown = 0;
    cards.forEach((card) => {
      const ok = matches(card);
      if (ok) matched++;
      const visible = ok && matched <= state.limit;
      card.el.hidden = !visible;
      if (visible) shown++;
    });
    syncTabs();
    els.empty.hidden = matched > 0;
    const remaining = matched - shown;
    els.more.hidden = remaining <= 0;
    els.more.textContent = `Show more campaigns (${remaining} more)`;
    const scope = matched === cards.size ? `${matched} campaigns` : `${matched} matching campaigns`;
    els.results.textContent = `Showing ${shown} of ${scope} · ${matched * SIZE_KEYS.length} live creatives`;
    syncURL();
    requestAnimationFrame(fitAll);
  }

  els.more.addEventListener("click", () => {
    const firstNew = [...cards.values()].find((card) => card.el.hidden && matches(card));
    state.limit += PAGE_SIZE;
    update({ keepLimit: true });
    firstNew?.el.querySelector(".size-btn")?.focus({ preventScroll: true });
  });

  let searchTimer;
  els.search.value = state.query;
  els.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = els.search.value;
      update();
    }, 120);
  });

  $("[data-reset]").addEventListener("click", () => {
    state.category = "all";
    state.query = "";
    els.search.value = "";
    update();
    els.search.focus();
  });

  // "/" focuses search (unless already typing somewhere)
  document.addEventListener("keydown", (e) => {
    if (e.key !== "/" || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || document.activeElement?.isContentEditable) return;
    e.preventDefault();
    els.search.focus();
  });

  /* ---------------- Layout switcher ---------------- */
  function setView(view) {
    state.view = view;
    els.gallery.classList.toggle("gallery--inspector", view === "inspector");
    $$("[data-view]").forEach((b) => {
      const on = b.dataset.view === view;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    syncURL();
    requestAnimationFrame(fitAll);
  }
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  /* ---------------- Specs modal ---------------- */
  let modalCard = null;
  let modalSize = SIZE_KEYS[0];

  function snippet(s) {
    return `<meta name="ad.size" content="width=${s.w},height=${s.h}">
<script type="text/javascript">
  var clickTag = "${DATA.clickTag}";
</script>
<script src="${DATA.gsap.url}"></script>

<div id="ad" onclick="window.open(window.clickTag)">
  <!-- creative -->
</div>`;
  }

  function renderSpecs() {
    const c = modalCard.data;
    const s = c.sizes[modalSize];
    const total = s.kb + DATA.gsap.kb.gzip;
    const pct = Math.min(100, (total / 150) * 100);
    const a = DATA.animation;

    els.modalBody.innerHTML = `
      <div class="sizes sizes--modal" role="group" aria-label="Spec size">
        ${SIZE_KEYS.map((k) => `<button type="button" class="size-btn${k === modalSize ? " is-active" : ""}" data-modal-size="${k}" aria-pressed="${k === modalSize}">${times(k)}</button>`).join("")}
      </div>

      <dl class="spec-list">
        <div><dt>Dimensions</dt><dd>${s.w} × ${s.h}px <span class="muted">· ${esc(s.name)}</span></dd></div>
        <div><dt>HTML payload</dt><dd>${s.kb} KB <span class="muted">· self-contained index.html</span></dd></div>
        <div><dt>GSAP (cdnjs)</dt><dd>${DATA.gsap.kb.gzip} KB gzipped <span class="muted">· ${DATA.gsap.kb.min} KB minified</span></dd></div>
        <div><dt>Animation</dt><dd>${a.loop}s loop × ${a.plays} plays + ${a.pause}s pause = ${a.total}s <span class="muted">· static end frame</span></dd></div>
        <div><dt>Creative style</dt><dd>${esc(c.styleLabel)}</dd></div>
        <div><dt>Tech</dt><dd>GSAP ${DATA.gsap.version} + Vanilla JS <span class="muted">· inline SVG &amp; CSS</span></dd></div>
        <div><dt>Boundary</dt><dd>1px solid <code>${esc(c.border)}</code></dd></div>
      </dl>

      <div class="budget">
        <div class="budget__head"><span>Est. total transfer</span><strong>${total.toFixed(1)} KB <span class="muted">/ 150 KB</span></strong></div>
        <div class="budget__bar" role="progressbar" aria-valuemin="0" aria-valuemax="150" aria-valuenow="${total.toFixed(1)}" aria-label="Payload budget used">
          <span style="width:${pct.toFixed(1)}%"></span>
        </div>
      </div>

      <div class="code">
        <div class="code__head">
          <span>ClickTag implementation</span>
          <button type="button" class="tool tool--sm" data-copy-snippet>${ICON.copy}<span>Copy</span></button>
        </div>
        <pre><code>${esc(snippet(s))}</code></pre>
      </div>

      <div class="modal__actions">
        <a class="btn btn--glass" href="${s.path}" target="_blank" rel="noopener">${ICON.open} Open ${times(modalSize)} in New Tab</a>
      </div>`;
  }

  function openSpecs(card) {
    modalCard = card;
    modalSize = card.size;
    els.modalTitle.textContent = card.data.title;
    els.modalIndustry.textContent = `${card.data.industry} · ${card.data.categoryLabel}`;
    renderSpecs();
    els.modal.showModal();
  }

  els.modal.addEventListener("click", (e) => {
    if (e.target === els.modal || e.target.closest("[data-modal-close]")) return els.modal.close();
    const sizeBtn = e.target.closest("[data-modal-size]");
    if (sizeBtn) {
      modalSize = sizeBtn.dataset.modalSize;
      renderSpecs();
      $(`[data-modal-size="${modalSize}"]`, els.modal).focus();
      return;
    }
    if (e.target.closest("[data-copy-snippet]")) {
      copyText(snippet(modalCard.data.sizes[modalSize]), "ClickTag snippet copied");
    }
  });

  /* ---------------- Clipboard + toast ---------------- */
  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
  }

  async function copyText(text, okMsg) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = Object.assign(document.createElement("textarea"), { value: text });
      ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok) return toast("Copy failed. Please copy manually.");
    }
    toast(okMsg);
  }

  $$("[data-copy-link]").forEach((btn) =>
    btn.addEventListener("click", () => copyText(location.href.split(/[?#]/)[0], "Portfolio link copied"))
  );

  /* ---------------- Init ---------------- */
  setView(state.view);
  update();
})();
