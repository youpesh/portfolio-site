// Custom behavior for the mirrored Framer site.
//
// This site is hydrated by Framer's runtime JS, which may overwrite edits you
// make directly in the SSR HTML. To keep "light edits" stable, we re-apply
// certain text replacements after hydration and on subsequent DOM mutations.

(function () {
  const REPLACEMENTS = [
    { from: "Landon Aguirre", to: "Yousuf Bukhari" },
  ];

  function removeFramerBadge() {
    const badge = document.getElementById("__framer-badge-container");
    if (badge) badge.remove();
  }

  function removeTemplatePromoStrip() {
    // Top promo strip: "A minimal portfolio template · View all templates"
    const links = document.querySelectorAll('a[href^="https://www.framer.com/@bryn-taylor"]');
    links.forEach((a) => {
      const text = (a.textContent || "").trim();
      if (!text) return;
      if (text.includes("A minimal portfolio template") || text.includes("View all templates")) {
        // Remove the wrapper that provides the spacing/animation if present.
        const wrapper = a.closest("[data-framer-appear-id]") || a;
        wrapper.remove();
      }
    });
  }

  function applyReplacements(root = document.body) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        // Skip scripts/styles
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    let node;
    while ((node = walker.nextNode())) {
      let text = node.nodeValue;
      let next = text;
      for (const { from, to } of REPLACEMENTS) {
        if (next.includes(from)) next = next.split(from).join(to);
      }
      if (next !== text) node.nodeValue = next;
    }
  }

  function applyMeta() {
    // Some browsers may show cached file:// titles; keep title consistent anyway.
    for (const { from, to } of REPLACEMENTS) {
      if (document.title.includes(from)) {
        document.title = document.title.split(from).join(to);
      }
      const metas = document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]');
      metas.forEach((m) => {
        const content = m.getAttribute("content");
        if (content && content.includes(from)) {
          m.setAttribute("content", content.split(from).join(to));
        }
      });
    }
  }

  function run() {
    removeFramerBadge();
    removeTemplatePromoStrip();
    applyReplacements(document.body);
    applyMeta();
  }

  // Initial run (after HTML parses)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  // Re-apply after Framer hydration or any subsequent re-render
  const observer = new MutationObserver(() => run());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();



