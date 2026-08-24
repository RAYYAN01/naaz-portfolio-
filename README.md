# Naaz AI Labs — Portfolio

Multi-page static site. Vanilla JavaScript, Tailwind v4, Three.js, GSAP, Lenis, built with Vite.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the production build
```

**A passing `npm run build` does not mean the dev server works.** The two take
different paths through `vite-plugin-content.js`. Always load `npm run dev` in a
browser before assuming a plugin change is good.

---

## Architecture

The site is **client-first**: it is organised around the visitor's industry and the
solution they can buy, not around the studio. A resort owner reaches the Resort
tier list in two clicks from any page.

### Content is data, not markup

The industry matrix (8 industries × 3 tiers), the technology grid, the process
timeline, and the project cards are **rendered to static HTML at build time**
from files in `src/data/`.

`vite-plugin-content.js` resolves two directives inside any page:

```html
<!--@include:nav-->          <!-- inlines src/partials/nav.html -->
<!--@render:industries-->    <!-- inlines renderIndustries() from src/build/render.js -->
```

This keeps a single source of truth without giving up crawlable HTML or paying
runtime JavaScript for content. **To change a tier, a price point, or a feature
list, edit the file in `src/data/` — never the HTML.**

Contact details, guarantees, and Lynq plans live in `src/data/company.js`. Change
a phone number there and it updates the nav, footer, and contact page at once.

> **Note for the renderers:** `vite-plugin-content.js` imports `src/build/render.js`
> **statically**. Vite bundles the config, so a cache-busting dynamic import
> (`import('./render.js?t=' + Date.now())`) fails at runtime with
> *"Module not found in bundle"* — and only in dev, so the production build still
> passes and hides it. The static import is also what makes data files config
> dependencies, so Vite restarts the dev server automatically when they change.

### JavaScript

Every behaviour is a module attached by attribute. Nothing is wired by hand.

```html
<div data-module="industry">          <!-- always mounted -->
<canvas data-module="hero3d" data-lazy> <!-- mounted when it nears the viewport -->
```

`src/js/core/registry.js` dynamically imports each one, so Rollup splits them
into separate chunks — Three.js (~119 kB gzip) is only downloaded by pages that
actually render a 3D hero.

Attribute-driven behaviours (`data-reveal`, `data-tilt`) are initialised
globally from `src/js/main.js`. Buttons are fixed in place by design — no
translate-on-hover, no pointer-following pull — the hover gesture is the
colour wipe and shadow only.

### CSS

`src/styles/` — tokens → base → layout → components, in that load order.

The palette is a strict ratio, enforced by only ever using the semantic tokens:

| Share | Colour | Token | Role |
|---|---|---|---|
| 70% | Ivory `#F8F3E7` | `--color-ivory-*` | default canvas |
| 25% | Deep Navy `#0B1F4D` | `--color-navy-*` | ink, and full-bleed cinematic sections |
| 5% | Steel Blue `#5E79A8` | `--color-steel-*` | accent, glow, focus — never a surface |

Dark sections carry `data-theme="dark"`, which re-points `--color-surface` and
`--color-ink`. There is no global dark-mode toggle; the site alternates by
design.

---

## Before launch

- [ ] **Replace placeholder case studies.** Everything in `src/data/projects.js`
      is marked `draft: true` — client names, quotes, and figures are
      illustrative. Publishing them as real client records would be a
      misrepresentation. Fill in real data and set `draft: false`.
- [ ] Review the statistics on `index.html` and `about.html` (`data-module="counter"`)
      against real numbers.
- [ ] Point the contact form at a real endpoint. It currently falls back to
      `mailto:`, which works but is a poor experience.
- [ ] Add a real Open Graph image (`og:image`) — currently unset.
- [ ] Confirm the LinkedIn and Instagram URLs in `src/partials/footer.html`.

## Accessibility & performance notes

- All motion is gated behind `prefers-reduced-motion`.
- If JavaScript fails to boot, `.js-failed` on `<html>` drops every
  reveal-hidden element back to visible — the page stays readable.
- The WebGL loop stops entirely when off-screen or when the tab is hidden.
- Reveal initial states live in CSS, so there is no flash of unstyled motion
  and no layout shift.
