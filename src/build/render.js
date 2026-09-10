import { industries, icons } from '../data/industries.js';
import { technologies } from '../data/technology.js';
import { processSteps } from '../data/process.js';
import { projects, projectFilters } from '../data/projects.js';
import { company, guarantees, lynqPlans, team } from '../data/company.js';
import { faqCategories, faqItems } from '../data/faq.js';

/**
 * Build-time renderers.
 *
 * These run in Node during dev-server transform and production build, never in
 * the browser. The output is plain static HTML, so the solutions matrix is
 * fully crawlable and costs zero runtime JavaScript — while the source stays a
 * single data file instead of two thousand lines of copy-pasted markup.
 */

const escape = (value) =>
  String(value).replace(/[&<>"']/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

/** A visibly unfinished slot. Never a plausible-looking invention. */
const slot = (label) => `<span class="is-slot">&lt;${escape(label)}&gt;</span>`;

const glyph = (name, extra = '') =>
  `<svg class="${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="24" height="24">${icons[name] ?? ''}</svg>`;

const CHECK =
  '<svg class="tier__check" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="12" height="12"><path d="m2 6.5 2.5 2.5L10 3.5"/></svg>';

const CHEVRON =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="16" height="16"><path d="m4 6 4 4 4-4"/></svg>';

function renderMeter(level, label = 'Complexity') {
  const segments = Array.from({ length: 5 }, (_, i) =>
    `<span class="meter__seg${i < level ? ' is-on' : ''}"></span>`,
  ).join('');

  return `<span class="meter" role="img" aria-label="${label}: ${level} of 5">
      <span class="mono-meta">${escape(label)}</span>
      <span class="meter__track" aria-hidden="true">${segments}</span>
    </span>`;
}

/**
 * Tier card.
 *
 * The three tiers must *escalate* visually, not just differ. Each rank gets a
 * denser surface treatment than the last — flat → raised with an accent rule →
 * inverted navy with registration marks. A buyer scanning the row should feel
 * the step up before reading a single feature.
 */
const TIER_RANK = { Standard: 1, Intermediate: 2, Premium: 3 };
const TIER_CLASS = { 1: 'tier--std', 2: 'tier--int', 3: 'tier--prem' };

function renderTier(tier, index, all) {
  const rank = TIER_RANK[tier.name] ?? index + 1;

  // Cumulative scope: Intermediate genuinely contains Standard, so the count a
  // buyer cares about is everything they end up with, not the delta we wrote.
  const cumulative = all
    .slice(0, index + 1)
    .reduce((total, t) => total + t.features.length, 0);

  const pips = [1, 2, 3]
    .map((i) => `<span class="tier__pip${i <= rank ? ' is-on' : ''}"></span>`)
    .join('');

  const corners =
    rank === 3
      ? `<span class="mark-corner mark-corner--tl" aria-hidden="true"></span>
         <span class="mark-corner mark-corner--br" aria-hidden="true"></span>`
      : '';

  return `<article class="tier ${TIER_CLASS[rank]}${rank === 3 ? ' tier--premium' : ''}" data-rank="${rank}">
      ${corners}
      <header class="tier__head">
        <div class="tier__rank" role="img" aria-label="Band ${rank} of 3">
          <span class="tier__pips" aria-hidden="true">${pips}</span>
          <span class="tier__label">${escape(tier.label)}</span>
        </div>
        <h3 class="tier__name">${escape(tier.name)}</h3>
      </header>

      <div class="tier__spend">
        <p class="tier__spend-label">Investment</p>
        <p class="tier__spend-value">${tier.investment ? escape(tier.investment) : slot('Investment')}</p>
      </div>

      <p class="tier__count">Client receives <strong>${cumulative}</strong> delivered capabilities</p>

      ${tier.inherits ? `<p class="tier__inherits">Everything in ${escape(tier.inherits)}, plus</p>` : ''}
      <ul class="tier__list">
        ${tier.features.map((f) => `<li class="tier__feature">${CHECK}<span>${escape(f)}</span></li>`).join('\n        ')}
      </ul>

      <dl class="tier__facts">
        <div><dt>Build time</dt><dd>${tier.timeline ? escape(tier.timeline) : slot('Timeline')}</dd></div>
        <div><dt>Team</dt><dd>${tier.team ? escape(tier.team) : slot('Team')}</dd></div>
      </dl>
    </article>`;
}

function renderIndustry(industry, index) {
  const number = String(index + 1).padStart(2, '0');

  return `<article class="industry" id="${industry.id}" data-industry data-reveal="up">
      <h2 class="sr-only">${escape(industry.name)}</h2>
      <button class="industry__head" type="button" aria-expanded="false" aria-controls="panel-${industry.id}">
        <img class="industry__bg" src="/img/industries/${industry.id}.jpg" alt="" width="900" height="600" loading="lazy" decoding="async" />
        <span class="industry__icon">${glyph(industry.icon)}</span>
        <span class="industry__titles">
          <span class="industry__name">${escape(industry.name)}</span>
          <span class="industry__blurb">${escape(industry.blurb)}</span>
        </span>
        <span class="industry__meta">
          ${renderMeter(industry.complexity)}
          <span class="mono-meta">${escape(industry.timeline)}</span>
        </span>
        <span class="industry__chev" aria-hidden="true">${CHEVRON}</span>
      </button>

      <div class="industry__panel" id="panel-${industry.id}">
        <div>
          <div class="industry__body">
            <div class="grid12">
              <p class="col-full md:col-7 lede">${escape(industry.outcome)}</p>
              <dl class="col-full md:col-4 md:start-9 industry__facts">
                <div><dt class="mono-meta">Timeline</dt><dd>${escape(industry.timeline)}</dd></div>
                <div><dt class="mono-meta">Team</dt><dd>${escape(industry.team)}</dd></div>
                <div><dt class="mono-meta">Index</dt><dd>${number} / ${String(industries.length).padStart(2, '0')}</dd></div>
              </dl>
            </div>

            <div class="tiers">
              ${industry.tiers.map(renderTier).join('\n              ')}
            </div>

            <div class="industry__foot">
              <ul class="industry__stack">
                ${industry.stack.map((tech) => `<li class="tag">${escape(tech)}</li>`).join('\n                ')}
              </ul>
              <a class="btn btn--ghost" href="/contact.html?industry=${industry.id}">
                Scope a ${escape(industry.name.toLowerCase())} build
                <span class="btn__arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>`;
}

export function renderIndustries() {
  return `<div class="industries" data-module="industry" data-reveal-group>
      ${industries.map(renderIndustry).join('\n      ')}
    </div>`;
}

/** Compact industry grid used on the home page as a routing device. */
export function renderIndustryIndex() {
  return industries
    .map(
      (industry, i) => `<a class="ind-link" href="/industries/${industry.id}.html" data-reveal="up" data-reveal-item>
        <img class="ind-link__img" src="/img/industries/${industry.id}.jpg" alt="" width="900" height="600" loading="lazy" decoding="async" />
        <span class="ind-link__num">${String(i + 1).padStart(2, '0')}</span>
        <span class="ind-link__icon">${glyph(industry.icon)}</span>
        <span class="ind-link__name">${escape(industry.name)}</span>
        <span class="ind-link__blurb">${escape(industry.blurb)}</span>
        <span class="ind-link__go" aria-hidden="true">→</span>
      </a>`,
    )
    .join('\n      ');
}

export function renderIndustryFooterLinks() {
  return industries
    .map(
      (industry) =>
        `<li><a class="footer__link" href="/industries/${industry.id}.html">${escape(industry.name)}</a></li>`,
    )
    .join('\n            ');
}

export function renderTechnology() {
  return technologies
    .map(
      (tech) => `<div class="tech">
        <svg class="tech__glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${tech.glyph}</svg>
        <span class="tech__name">${escape(tech.name)}</span>
        <span class="tech__cat">${escape(tech.category)}</span>
      </div>`,
    )
    .join('\n      ');
}

/** Contractual commitments, rendered as the trust strip. */
export function renderGuarantees() {
  return guarantees
    .map(
      (g) => `<div class="metric" data-reveal="up" data-reveal-item>
        <p class="stat__value">${escape(g.value)}<span class="stat__suffix">${escape(g.unit)}</span></p>
        <p class="stat__label">${escape(g.label)}</p>
        <p class="body-muted" style="font-size:var(--text-sm);margin-block-start:.5rem">${escape(g.detail)}</p>
      </div>`,
    )
    .join('\n      ');
}

/** Lynq subscription plans. */
export function renderLynqPlans() {
  return lynqPlans
    .map((plan, i) => {
      const rank = i + 1;
      // Same escalation vocabulary as the industry tiers, so a client moving
      // between the two pages reads one hierarchy, not two.
      const variant = `${TIER_CLASS[rank]}${plan.enterprise ? ' tier--premium' : ''}`;
      const flag = plan.popular
        ? '<span class="plan__flag">Most popular</span>'
        : plan.enterprise
          ? '<span class="plan__flag plan__flag--alt">Enterprise</span>'
          : '';
      const corners = plan.enterprise
        ? `<span class="mark-corner mark-corner--tl" aria-hidden="true"></span>
           <span class="mark-corner mark-corner--br" aria-hidden="true"></span>`
        : '';
      const pips = [1, 2, 3]
        .map((n) => `<span class="tier__pip${n <= rank ? ' is-on' : ''}"></span>`)
        .join('');

      return `<article class="tier plan ${variant}" data-rank="${rank}" data-reveal="up" data-reveal-item>
        ${flag}
        ${corners}
        <header class="tier__head">
          <div class="tier__rank" role="img" aria-label="Plan ${rank} of 3">
            <span class="tier__pips" aria-hidden="true">${pips}</span>
            <span class="tier__label">${escape(plan.channel)}</span>
          </div>
          <h3 class="tier__name">${escape(plan.name)}</h3>
          <p class="body-muted" style="font-size:var(--text-sm)">${escape(plan.summary)}</p>
        </header>

        <div class="plan__price">
          <span class="plan__amount">${escape(plan.price)}</span>
          <span class="mono-meta">/ month</span>
          <p class="mono-meta" style="margin-block-start:.4rem">${escape(plan.annual)} on annual · save 15%</p>
          <p class="mono-meta">Setup ${escape(plan.setup)}</p>
        </div>

        <ul class="tier__list">
          ${plan.features.map((f) => `<li class="tier__feature">${CHECK}<span>${escape(f)}</span></li>`).join('\n          ')}
        </ul>

        <table class="plan__limits">
          <caption class="sr-only">${escape(plan.name)} monthly limits</caption>
          <tbody>
            ${plan.limits.map(([k, v]) => `<tr><th scope="row">${escape(k)}</th><td>${escape(v)}</td></tr>`).join('\n            ')}
          </tbody>
        </table>
      </article>`;
    })
    .join('\n      ');
}

/** Contact details, so a change never has to be hunted for. */
export function renderContactRows() {
  return `<div class="contact-row">
        <span>Email</span>
        <a class="link" href="mailto:${company.email}">${escape(company.email)}</a>
      </div>
      <div class="contact-row">
        <span>Studio</span>
        <span style="font-size:var(--text-sm)">${escape(company.location)}<br />${escape(company.region)}</span>
      </div>
      <div class="contact-row">
        <span>Hours</span>
        <span style="font-size:var(--text-sm)">${escape(company.hours)}</span>
      </div>
      <div class="contact-row">
        <span>Platform</span>
        <a class="link" href="https://${company.product}" target="_blank" rel="noopener noreferrer">${escape(company.product)}</a>
      </div>`;
}

/** Leadership team, shown below the founder on the About page. */
export function renderTeam() {
  return team
    .map(
      (m) => `<div class="team-member" data-reveal="up" data-reveal-item>
        <span class="quote__avatar" aria-hidden="true">${escape(m.initials)}</span>
        <p class="title-3" style="margin-block-start:1rem">${escape(m.name)}</p>
        <p class="mono-meta">${escape(m.role)}</p>
        <p class="team-member__tag">${escape(m.tagline)}</p>
      </div>`,
    )
    .join('\n      ');
}

export function renderProjectFilters() {
  return projectFilters
    .map(
      (f, i) =>
        `<button class="filter" type="button" data-filter="${f.value}" aria-pressed="${i === 0}">${escape(f.label)}</button>`,
    )
    .join('\n        ');
}

/**
 * Project cards.
 *
 * The default "cover" is a generated gradient composition rather than a
 * screenshot — placeholder imagery of work that does not exist yet would be a
 * fabrication, and a stock photo would undercut the studio's own claim to
 * craft. Where a real capture of the live site exists (`screenshot: true`,
 * see the doc comment in src/data/projects.js), that image is used instead.
 *
 * `status: 'ongoing'` marks a project still in build — the studio isn't
 * ready to send visitors to a live client site that's mid-work, so the "Visit"
 * link is withheld (the summary text stays fully visible either way; nothing
 * here is gated behind a click) and a stamp sits over the cover instead.
 *
 * `gallery` lists extra screenshots (filenames under public/img/work/) shown
 * in a lightbox when the card's media is clicked — see gallery.js. Optional;
 * most projects have just the one cover image and no click behaviour at all.
 */
export function renderProjects() {
  return projects
    .map((project, i) => {
      const ongoing = project.status === 'ongoing';
      const gallery = project.gallery ?? [];

      // Client name is a visible placeholder until permission to publish it is
      // given — never a plausible-sounding invention.
      const client = project.client
        ? `<span class="mono-meta">${escape(project.client)}</span>`
        : '<span class="mono-meta is-slot">&lt;Client Name&gt;</span>';

      const media = project.screenshot
        ? `<img src="/img/work/${project.slug}.jpg" alt="${escape(project.title)} website" width="900" height="675" loading="lazy" decoding="async" />`
        : (() => {
            const hue = 210 + (i % 3) * 14;
            const cover = `background:
          radial-gradient(120% 90% at 22% 18%, hsl(${hue} 32% 34% / .95), transparent 62%),
          radial-gradient(90% 80% at 82% 86%, hsl(${hue - 18} 28% 46% / .55), transparent 60%),
          linear-gradient(160deg, #0b1f4d, #050d20)`;
            // The "Ongoing" stamp already explains an empty cover here — stacking
            // the <Project Screenshot> slot underneath it would just be two
            // messages fighting for the same centred spot.
            const slot = ongoing
              ? ''
              : '<span class="project__slot" aria-hidden="true">&lt;Project Screenshot&gt;</span>';
            return `<div class="project__cover" style="${cover}">${slot}</div>`;
          })();

      const statusStamp = ongoing
        ? '<span class="project__status"><span>Ongoing</span></span>'
        : '';

      const galleryCue = gallery.length
        ? `<span class="project__gallery-cue" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><rect x="1.5" y="1.5" width="9" height="9" rx="1.5"/><path d="M5.5 14.5h9v-9"/></svg>
            ${gallery.length + 1} photos
          </span>`
        : '';

      const mediaAttrs = gallery.length
        ? ` data-module="gallery" data-gallery='${escape(
            JSON.stringify([`/img/work/${project.slug}.jpg`, ...gallery.map((g) => `/img/work/${g}`)]),
          )}' data-gallery-title="${escape(project.title)}" role="button" tabindex="0" aria-label="View ${gallery.length + 1} screenshots of ${escape(project.title)}"`
        : '';

      return `<article class="project" data-tags="${escape(project.tags.join(' '))}" data-reveal="up" data-reveal-item>
        <div class="project__media" data-tilt="5"${mediaAttrs}>
          ${media}
          ${statusStamp}
          ${galleryCue}
        </div>
        <div class="project__body">
          <div class="project__row">
            <span class="mono-meta">${escape(project.industry)}</span>
            <span class="mono-meta">${escape(project.year)}</span>
          </div>
          <h2 class="project__title">${escape(project.title)}</h2>
          <p class="body-muted" style="font-size:var(--text-sm)">${project.summary ? escape(project.summary) : slot('Description on delivery')}</p>
          <div class="project__row" style="margin-block-start:.75rem">
            ${client}
            ${project.live && !ongoing ? `<a class="link link--accent" href="${project.live}" target="_blank" rel="noopener noreferrer">Visit&nbsp;<span aria-hidden="true">→</span></a>` : ''}
          </div>
          <ul class="industry__stack" style="margin-block-start:.75rem">
            ${project.stack.map((t) => `<li class="tag">${escape(t)}</li>`).join('')}
          </ul>
        </div>
      </article>`;
    })
    .join('\n      ');
}

export function renderProcess() {
  return processSteps
    .map(
      (step, i) => `<li class="step" data-reveal="up" data-reveal-item>
        <span class="step__dot" aria-hidden="true"></span>
        <p class="step__index">Phase ${String(i + 1).padStart(2, '0')}</p>
        <h2 class="step__title">${escape(step.title)}</h2>
        <p class="step__text">${escape(step.text)}</p>
      </li>`,
    )
    .join('\n      ');
}

/**
 * FAQ accordion. Native <details>/<summary> rather than the industry
 * page's JS-driven pattern — this page's entire job is being read directly
 * by crawlers and AI answer engines, many of which never execute JS, so
 * every question and answer has to be real, expandable HTML with no
 * dependency on a module loading.
 */
export function renderFaq() {
  return faqCategories
    .map(
      (cat) => `<div class="faq__group" data-reveal="up" data-reveal-item>
        <p class="eyebrow" data-reveal="fade">${escape(cat.label)}</p>
        <div class="faq__list">
          ${cat.items
            .map(
              (item) => `<details class="faq__item">
            <summary class="faq__question">
              <span>${escape(item.q)}</span>
              <span class="faq__chev" aria-hidden="true">${CHEVRON}</span>
            </summary>
            <div class="faq__answer"><p>${escape(item.a)}</p></div>
          </details>`,
            )
            .join('\n          ')}
        </div>
      </div>`,
    )
    .join('\n      ');
}

/**
 * FAQPage structured data, generated from the exact same array that powers
 * the visible accordion above. Google's FAQ rich-result eligibility requires
 * the schema to match what a visitor actually sees, so there is deliberately
 * no second, hand-maintained copy of these answers to drift out of sync.
 */
export function renderFaqSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE}/faq.html#faq`,
    url: `${SITE}/faq.html`,
    name: 'Naaz AI Labs — FAQ',
    isPartOf: { '@id': `${SITE}/#website` },
    publisher: { '@id': ORG_ID },
    author: { '@id': FOUNDER_ID },
    inLanguage: 'en-IN',
    dateModified: SITE_UPDATED,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`;
}

/* ==========================================================================
   PER-INDUSTRY LANDING PAGES  (/industries/<id>.html)

   One renderer over the eight real rows in industries.js. These are not
   name-swapped doorway pages: each carries a different problem statement,
   a different three-band scope matrix, a different tech stack, and — where
   they exist — the real client projects delivered in that vertical. Nothing
   on these pages is generated copy; every fact traces to industries.js,
   projects.js, or company.js.
   ========================================================================== */

const SITE = 'https://www.naazailabs.com';
const ORG_ID = `${SITE}/#org`;
const FOUNDER_ID = `${SITE}/#founder`;
// Bumped by hand when page content materially changes — an honest
// dateModified for AI-citation provenance, not an auto-stamp on every deploy.
const SITE_UPDATED = '2026-09-10';

// projects.js uses display-name industry labels that don't all match the
// industries.js `name`. Only the honest overlaps are mapped.
const INDUSTRY_PROJECT_LABELS = {
  'real-estate': ['Real Estate'],
  resort: ['Resort'],
  travel: ['Travel'],
  crm: [],
  hospitality: ['Hospitality'],
  finance: [],
  events: ['Event Management'],
  education: [],
};

const industryBySlug = (slug) => industries.find((i) => i.id === slug);

/** Real client projects delivered in this vertical, most recent first. */
function industryProjects(slug) {
  const labels = INDUSTRY_PROJECT_LABELS[slug] ?? [];
  if (!labels.length) return [];
  return projects.filter((p) => labels.includes(p.industry) && p.status !== 'ongoing');
}

function faqForIndustry(industry) {
  const noun = industry.name.toLowerCase();
  return [
    {
      q: `Do you work with ${noun} clients outside Bangalore?`,
      a: `Yes. The studio is in JP Nagar, Bengaluru, and we deliver for ${noun} clients across Karnataka and the rest of India. Client data is stored in India.`,
    },
    {
      q: `How long does a ${noun} build take?`,
      a: `${industry.timeline} depending on the delivery band — Standard is the fastest, Premium the most involved. A Lynq subscription goes live in 7 days from advance payment.`,
    },
    {
      q: `What does a ${noun} project include?`,
      a: `${industry.tiers[0].name} covers ${industry.tiers[0].features.slice(0, 3).join(', ').toLowerCase()} and more. ${industry.tiers[industry.tiers.length - 1].name} adds AI voice agents, prediction, and document AI. See the full three-band breakdown on this page.`,
    },
  ];
}

/** Head block: title, description, canonical, og:url — one per industry. */
export function renderIndustryLandingHead(slug) {
  const ind = industryBySlug(slug);
  if (!ind) return '';
  const url = `${SITE}/industries/${slug}.html`;
  const title = `${ind.name} AI, CRM &amp; Automation in Bangalore | Naaz AI Labs`;
  const desc = `${ind.blurb} ${ind.name} websites, CRMs, and AI automation built by Naaz AI Labs in Bangalore — serving Karnataka and across India.`;
  return `<title>${title}</title>
    <meta name="description" content="${escape(desc)}" />
    <meta property="og:title" content="${ind.name} AI, CRM &amp; Automation in Bangalore" />
    <meta property="og:description" content="${escape(ind.blurb)}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:url" content="${url}" />`;
}

/** Service + BreadcrumbList + FAQPage structured data for one industry. */
export function renderIndustryLandingSchema(slug) {
  const ind = industryBySlug(slug);
  if (!ind) return '';
  const url = `${SITE}/industries/${slug}.html`;
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: `${ind.name} AI, CRM & Automation in Bangalore`,
      description: ind.blurb,
      isPartOf: { '@id': `${SITE}/#website` },
      about: { '@id': `${url}#service` },
      publisher: { '@id': ORG_ID },
      author: { '@id': FOUNDER_ID },
      inLanguage: 'en-IN',
      datePublished: SITE_UPDATED,
      dateModified: SITE_UPDATED,
      primaryImageOfPage: `${SITE}/img/og-image.jpg`,
    },
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: `${ind.name} — AI, CRM & automation`,
      description: ind.blurb,
      serviceType: ind.name,
      provider: { '@id': ORG_ID },
      areaServed: [
        { '@type': 'AdministrativeArea', name: 'Karnataka' },
        { '@type': 'Country', name: 'India' },
      ],
      url,
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
        { '@type': 'ListItem', position: 2, name: 'Solutions', item: `${SITE}/solutions.html` },
        { '@type': 'ListItem', position: 3, name: ind.name, item: url },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      isPartOf: { '@id': `${url}#webpage` },
      publisher: { '@id': ORG_ID },
      dateModified: SITE_UPDATED,
      mainEntity: faqForIndustry(ind).map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ];
  return `<script type="application/ld+json">\n${JSON.stringify(
    { '@context': 'https://schema.org', '@graph': graph },
    null,
    2,
  )}\n</script>`;
}

/** The full page body for one industry landing page. */
export function renderIndustryLanding(slug) {
  const ind = industryBySlug(slug);
  if (!ind) return `<!-- unknown industry: ${escape(slug)} -->`;

  const idx = industries.indexOf(ind);
  const related = [industries[(idx + 1) % industries.length], industries[(idx + 2) % industries.length]];
  const work = industryProjects(slug);

  const workBlock = work.length
    ? `<section class="section section--ruled">
          <div class="shell">
            <div class="grid12" style="margin-block-end:2.5rem">
              <p class="col-full md:col-3 eyebrow" data-reveal="fade">Delivered</p>
              <h2 class="col-full md:col-8 md:start-5 title-1" data-reveal="up">
                ${escape(ind.name)} systems, in production.
              </h2>
            </div>
            <ul class="ind-work" data-reveal-group>
              ${work
                .map(
                  (p) => `<li class="ind-work__item" data-reveal="up" data-reveal-item>
                <span class="ind-work__name">${escape(p.title)}</span>
                <span class="body-muted" style="font-size:var(--text-sm)">${p.summary ? escape(p.summary) : ''}</span>
                ${
                  p.live
                    ? `<a class="link link--accent" href="${p.live}" target="_blank" rel="noopener noreferrer">Visit&nbsp;<span aria-hidden="true">→</span></a>`
                    : ''
                }
              </li>`,
                )
                .join('\n              ')}
            </ul>
            <a class="btn btn--ghost" href="/work.html" style="margin-block-start:2rem">
              See all work
              <span class="btn__arrow" aria-hidden="true">→</span>
            </a>
          </div>
        </section>`
    : `<section class="section section--ruled">
          <div class="shell">
            <p class="lede" data-reveal="up">
              See systems we have shipped across every vertical in
              <a class="link link--accent" href="/work.html">selected work</a>.
            </p>
          </div>
        </section>`;

  const faqs = faqForIndustry(ind);

  return `<header class="page-head page-head--dark grain" data-theme="dark">
      <div class="glow" style="inline-size:38rem;block-size:38rem;inset-block-start:-12rem;inset-inline-end:-8rem;--glow-opacity:.32"></div>
      <div class="gridlines" aria-hidden="true"></div>
      <div class="shell layer-content">
        <nav class="crumbs" aria-label="Breadcrumb">
          <a href="/">Home</a><span aria-hidden="true">/</span><a href="/solutions.html">Solutions</a><span aria-hidden="true">/</span><span aria-current="page">${escape(ind.name)}</span>
        </nav>
        <div class="grid12" style="margin-block-start:1.5rem">
          <div class="col-full md:col-7">
            <p class="page-head__index">Industry · ${escape(ind.name)}</p>
            <h1 class="page-head__title" style="margin-block-start:1.25rem" data-module="splitText">
              AI &amp; automation for ${escape(ind.name)}
            </h1>
          </div>
          <div class="col-full md:col-4 md:start-9" style="align-self:end">
            <p class="lede" data-reveal="up">
              ${escape(ind.outcome)} Delivered from our Bengaluru studio, for clients across Karnataka and India.
            </p>
          </div>
        </div>
        <div class="hero__actions" style="margin-block-start:2rem" data-reveal="up">
          <a class="btn btn--invert btn--lg" href="/contact.html?industry=${ind.id}">
            Scope a ${escape(ind.name.toLowerCase())} build
            <span class="btn__arrow" aria-hidden="true">→</span>
          </a>
          <a class="btn btn--ghost btn--lg" href="/solutions.html#${ind.id}">
            Compare all industries
          </a>
        </div>
      </div>
    </header>

    <section class="section section--tight">
      <div class="shell">
        <dl class="metrics" data-reveal="up">
          <div class="metric">
            <p class="stat__label">Typical timeline</p>
            <p class="title-3">${escape(ind.timeline)}</p>
          </div>
          <div class="metric">
            <p class="stat__label">Delivery team</p>
            <p class="title-3">${escape(ind.team)}</p>
          </div>
          <div class="metric">
            <p class="stat__label">Serving</p>
            <p class="title-3">Bengaluru · Karnataka · India</p>
          </div>
        </dl>
        <ul class="industry__stack" style="margin-block-start:2rem">
          ${ind.stack.map((t) => `<li class="tag">${escape(t)}</li>`).join('\n          ')}
        </ul>
      </div>
    </section>

    <section class="section section--flush-top" aria-label="${escape(ind.name)} delivery bands">
      <div class="shell">
        <div class="grid12" style="margin-block-end:2.5rem">
          <p class="col-full md:col-3 eyebrow" data-reveal="fade">What your investment builds</p>
          <h2 class="col-full md:col-8 md:start-5 title-1" data-reveal="up">
            Three delivery bands for ${escape(ind.name.toLowerCase())}.
          </h2>
        </div>
        <div class="tiers">
          ${ind.tiers.map(renderTier).join('\n          ')}
        </div>
      </div>
    </section>

    ${workBlock}

    <section class="section">
      <div class="shell">
        <div class="grid12" style="margin-block-end:2.5rem">
          <p class="col-full md:col-3 eyebrow" data-reveal="fade">${escape(ind.name)} FAQ</p>
          <h2 class="col-full md:col-8 md:start-5 title-1" data-reveal="up">Questions, answered.</h2>
        </div>
        <div class="faq">
          <div class="faq__list">
            ${faqs
              .map(
                (f) => `<details class="faq__item">
              <summary class="faq__question">
                <span>${escape(f.q)}</span>
                <span class="faq__chev" aria-hidden="true">${CHEVRON}</span>
              </summary>
              <div class="faq__answer"><p>${escape(f.a)}</p></div>
            </details>`,
              )
              .join('\n            ')}
          </div>
        </div>
      </div>
    </section>

    <section class="section section--ruled">
      <div class="shell grid12" style="align-items:center">
        <div class="col-full md:col-6">
          <p class="eyebrow" data-reveal="fade">Related</p>
          <h2 class="title-1" style="margin-block-start:1.25rem" data-reveal="up">Other industries we build for.</h2>
          <p class="lede" style="margin-block-start:1.5rem" data-reveal="up">
            ${related
              .map((r) => `<a class="link link--accent" href="/industries/${r.id}.html">${escape(r.name)}</a>`)
              .join(' · ')}
            · <a class="link link--accent" href="/solutions.html">all eight</a>
          </p>
        </div>
        <div class="col-full md:col-4 md:start-9" data-reveal="up">
          <a class="btn btn--lg" href="/contact.html?industry=${ind.id}">
            Start your project
            <span class="btn__arrow" aria-hidden="true">→</span>
          </a>
          <p class="mono-meta" style="margin-block-start:1rem">Reply within one business day</p>
        </div>
      </div>
    </section>`;
}
