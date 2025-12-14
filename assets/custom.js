// Custom behavior for the mirrored Framer site.
//
// This site is hydrated by Framer's runtime JS, which may overwrite edits you
// make directly in the SSR HTML. To keep "light edits" stable, we re-apply
// certain text replacements after hydration and on subsequent DOM mutations.

(function () {
  const EMAIL = "youssefbukhari4@gmail.com";
  const GITHUB_URL = "https://github.com/youpesh";
  const LINKEDIN_URL = "https://www.linkedin.com/in/yousuf-bukhari/";
  const X_URL = "https://x.com/youssef_bukhari";

  const REPLACEMENTS = [
    { from: "Landon Aguirre", to: "Yousuf Bukhari" },
    { from: "About Landon", to: "About Yousuf" },
    { from: "Independent Visual Designer", to: "AI-focused Software Engineer" },
    { from: "independent visual designer", to: "AI-focused software engineer" },
    { from: "Currently based in Lisbon, Portugal.", to: "Based in Atlanta, GA." },
    { from: "Senior Visual designer", to: "Senior Software Engineer (AI)" },
    { from: "Visual designer", to: "Software Engineer" },
    { from: "Product designer", to: "Machine Learning Engineer" },
    { from: "Interface design", to: "Machine learning" },
    { from: "Visual design", to: "LLM applications" },
    { from: "Design systems", to: "AI Engineering" },
    { from: "Brand identity", to: "AI Engineering" },
    { from: "Design system", to: "AI Engineering" },
    { from: "Product design", to: "AI Engineering" },
    { from: "Dribbble", to: "GitHub" },
    { from: "dribbble.com/bryntaylor", to: "github.com/youpesh" },
    { from: "landonaguirre", to: "youpesh" },
    { from: "hi@email.com", to: EMAIL },
    { from: "linkedin.com/in/bryntaylor", to: "linkedin.com/in/yousuf-bukhari/" },
    { from: "twitter.com/bryntaylor99", to: "x.com/youssef_bukhari" },
    { from: "@twitterhandle", to: "@youssef_bukhari" },
    // Fix LinkedIn display text (appears after GitHub in contact section)
    { from: "LinkedIn", to: "LinkedIn" }, // Keep label, but fix the value below

    // Keep key homepage text stable after Framer hydration.
    {
      from: "I’m an AI-focused software engineer. I build production-ready, human-centered products powered by modern AI. Based in Atlanta, Georgia (US).",
      to: "I’m an AI-focused software engineer in Atlanta, GA. I build LLM-powered features, ML pipelines, and backend systems—from prototype to production.",
    },
    {
      from: "I'm an AI-focused software engineer. For the last 7 years I've been crafting world class digital experiences. Based in Atlanta, GA.",
      to: "I'm an AI-focused software engineer in Atlanta, GA. I build LLM-powered features, ML pipelines, and backend systems—from prototype to production.",
    },

    // Keep titles stable after Framer hydration.
    { from: "Yousuf Bukhari · AI-focused Software Engineer", to: "Yousuf Bukhari | AI Software Engineer in Atlanta, GA" },
    { from: "Yousuf Bukhari · About", to: "About | Yousuf Bukhari" },
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

  function removeFooterCredits() {
    // Footer links we want to remove:
    // - Unlimited Access templates
    // - Made in Framer
    // - Built by Bryn
    const creditLinks = document.querySelectorAll(
      'a[href^="https://www.bryntaylor.co.uk/"], a[href^="https://www.framer.com?via=bryn"]'
    );

    creditLinks.forEach((a) => {
      const text = (a.textContent || "").trim();
      if (
        !text ||
        !(
          text.includes("Unlimited Access templates") ||
          text.includes("Made in Framer") ||
          text.includes("Built by Bryn")
        )
      ) {
        return;
      }

      // Prefer removing the container so we don't leave layout gaps.
      const wrapper =
        a.closest('div[class$="-container"]') ||
        a.closest("[data-framer-appear-id]") ||
        a;
      wrapper.remove();
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

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {
      // ignore; fallback below
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      ta.style.left = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  }

  function showCopiedMarker(el) {
    if (!el) return;
    el.classList.add("is-copied");
    window.clearTimeout(el.__copiedTimeout);
    el.__copiedTimeout = window.setTimeout(() => el.classList.remove("is-copied"), 1200);
  }

  function fixHeroText() {
    // Directly target the hero h1 element
    const heroH1 = document.querySelector('header[data-framer-name="Section / Header"] h1');
    if (heroH1) {
      const currentText = heroH1.textContent.trim();
      const targetText = "I'm an AI-focused software engineer in Atlanta, GA. I build LLM-powered features, ML pipelines, and backend systems—from prototype to production.";
      if (currentText !== targetText && currentText.includes("AI-focused software engineer")) {
        heroH1.textContent = targetText;
      }
    }
  }

  function fixContactLinks() {
    // Fix all contact link hrefs and display text
    
    // Fix Email links
    const emailLinks = document.querySelectorAll('a[href^="mailto:"], a[data-copy-email]');
    emailLinks.forEach(link => {
      link.dataset.copyEmail = EMAIL;
      // Make it non-mailto (copy-only)
      link.setAttribute("href", "#");
      link.removeAttribute("target");

      const textContainer = link.querySelector('h4');
      if (textContainer && textContainer.textContent.trim() !== EMAIL && textContainer.textContent.includes('@')) {
        textContainer.textContent = EMAIL;
      }
    });
    
    // Fix GitHub links - be very aggressive since Framer might change them to Dribbble
    // Check ALL links in the contact section, not just ones with "github" in href
    const allContactLinks = document.querySelectorAll('a[href*="github"], a[href*="dribbble"], a[href*="linkedin"], a[href*="twitter"], a[href*="x.com"], a[href*="mailto"]');
    allContactLinks.forEach(link => {
      const labelElement = link.querySelector('h3');
      const labelText = labelElement?.textContent.trim();
      
      // If it says "GitHub" but links to Dribbble or anything else, fix it immediately
      if (labelText === 'GitHub') {
        // Force the href to GitHub, even if Framer changed it
        if (link.href.includes('dribbble') || !link.href.includes('github.com/youpesh')) {
          link.setAttribute('href', GITHUB_URL);
          link.href = GITHUB_URL; // Set both ways to be sure
        }
        const textContainer = link.querySelector('h4');
        if (textContainer && textContainer.textContent.trim() !== 'youpesh') {
          textContainer.textContent = 'youpesh';
        }
      }
    });
    
    // Also check for any Dribbble links that should be GitHub
    const dribbbleLinks = document.querySelectorAll('a[href*="dribbble"]');
    dribbbleLinks.forEach(link => {
      const labelElement = link.querySelector('h3');
      if (labelElement?.textContent.trim() === 'GitHub') {
        link.setAttribute('href', 'https://github.com/youpesh');
        link.href = 'https://github.com/youpesh';
        const textContainer = link.querySelector('h4');
        if (textContainer) {
          textContainer.textContent = 'youpesh';
        }
      }
    });
    
    // Fix LinkedIn links
    const linkedInLinks = document.querySelectorAll('a[href*="linkedin"]');
    linkedInLinks.forEach(link => {
      if (!link.href.includes('linkedin.com/in/yousuf-bukhari')) {
        link.href = LINKEDIN_URL;
      }
      const textContainer = link.querySelector('h4');
      if (textContainer) {
        const parent = link.closest('div');
        if (parent && parent.querySelector('h3')?.textContent.trim() === 'LinkedIn') {
          if (textContainer.textContent.trim() !== 'yousuf-bukhari') {
            textContainer.textContent = 'yousuf-bukhari';
          }
        }
      }
    });
    
    // Fix Twitter/X links
    const twitterLinks = document.querySelectorAll('a[href*="twitter"], a[href*="x.com"]');
    twitterLinks.forEach(link => {
      if (!link.href.includes('x.com/youssef_bukhari') && !link.href.includes('twitter.com/youssef_bukhari')) {
        link.href = X_URL;
      }
      const textContainer = link.querySelector('h4');
      if (textContainer) {
        const parent = link.closest('div');
        if (parent && parent.querySelector('h3')?.textContent.trim() === 'Twitter') {
          if (textContainer.textContent.trim() !== '@youssef_bukhari') {
            textContainer.textContent = '@youssef_bukhari';
          }
        }
      }
    });
  }

  function run() {
    removeFramerBadge();
    removeTemplatePromoStrip();
    removeFooterCredits();
    applyReplacements(document.body);
    applyMeta();
    fixHeroText();
    fixContactLinks();
  }

  // Initial run (after HTML parses)
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }

  // Re-apply after Framer hydration or any subsequent re-render
  const observer = new MutationObserver(() => {
    run();
    // Also run fixHeroText and fixContactLinks with a small delay to catch late Framer updates
    setTimeout(() => {
      fixHeroText();
      fixContactLinks();
    }, 100);
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  
  // Also run periodically to catch any missed updates
  setInterval(() => {
    fixHeroText();
    fixContactLinks();
  }, 500);
  
  // Intercept clicks on contact links to ensure they go to the right place
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link) {
      // Email: copy to clipboard instead of navigating
      if (link.dataset.copyEmail || (typeof link.getAttribute === "function" && (link.getAttribute("href") || "").startsWith("mailto:"))) {
        e.preventDefault();
        const email = link.dataset.copyEmail || EMAIL;
        copyToClipboard(email).then(() => showCopiedMarker(link));
        return false;
      }

      const labelElement = link.querySelector('h3');
      const labelText = labelElement?.textContent.trim();
      
      // If clicking on GitHub link but it goes to Dribbble, fix it
      if (labelText === 'GitHub' && (link.href.includes('dribbble') || !link.href.includes('github.com/youpesh'))) {
        e.preventDefault();
        link.setAttribute('href', GITHUB_URL);
        window.open(GITHUB_URL, '_blank');
        return false;
      }
    }
  }, true); // Use capture phase to catch before Framer's handlers
})();



