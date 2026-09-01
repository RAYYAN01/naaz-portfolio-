/**
 * FAQ — answer-engine content, sourced entirely from facts already published
 * elsewhere on the site (about.html, solutions/industries.js, company.js
 * guarantees and Lynq pricing, contact.html's "what happens next" list).
 *
 * This file is the single source of truth for both the visible FAQ page
 * (renderFaq) and its FAQPage structured data (renderFaqSchema) — Google's
 * FAQ rich-result eligibility requires the schema to match visible content
 * word-for-word, so both renderers read the same array rather than risking
 * drift between two hand-written copies.
 *
 * Rule: every answer here must trace back to a real figure or sentence that
 * already exists elsewhere in this codebase. Nothing invented for SEO.
 */

export const faqCategories = [
  {
    id: 'company',
    label: 'About Naaz AI Labs',
    items: [
      {
        q: 'What is Naaz AI Labs?',
        a: 'Naaz AI Labs is an artificial intelligence research and development studio based in JP Nagar, Bengaluru, Karnataka. We design and build websites, CRMs, and automation for businesses that have outgrown the tools they started with.',
      },
      {
        q: 'Where is Naaz AI Labs located?',
        a: 'The studio is based in JP Nagar, Bengaluru, Karnataka, India, serving clients across India. Client data is stored in India, and every WhatsApp deployment runs on the official Meta Business API.',
      },
      {
        q: 'What industries does Naaz AI Labs work with?',
        a: "Real estate, resorts, travel agencies, CRM-heavy businesses, hospitality, finance, event management, and education — the eight industries where we have the deepest pattern library. The delivery tiers translate to almost any business that takes enquiries, manages customers, or sells a service, so if yours isn't listed, tell us about it anyway.",
      },
      {
        q: 'Is Naaz AI Labs a consulting firm, or do you build the systems too?',
        a: 'We build. Most agencies hand you a strategy document or a template website; we deliver a working system — website, CRM, or AI automation — and the same team stays on to support it afterward. Strategy, design, engineering, and the AI layer are the same people, in the same room.',
      },
    ],
  },
  {
    id: 'ai-automation',
    label: 'AI, CRM & WhatsApp automation',
    items: [
      {
        q: 'Does Naaz AI Labs build AI CRM systems?',
        a: 'Yes — CRM Systems is one of our eight core industry verticals: pipelines, lead scoring, and reporting built around how your team actually sells, then automated end to end so leads are captured, scored, and followed up on without being asked.',
      },
      {
        q: 'Does Naaz AI Labs provide WhatsApp automation?',
        a: 'Yes. Lynq, our AI automation platform, puts a full AI workforce on the WhatsApp Business API — answering messages day or night, qualifying leads from your own documents, and booking appointments — live on your own WhatsApp number in as little as 7 days.',
      },
      {
        q: 'What is Lynq, and how much does it cost?',
        a: 'Lynq is our productised AI automation platform for WhatsApp, website chat, and phone. It runs on three flat monthly plans, excluding GST: Receptionist at ₹11,999/month (chat only), Sales Associate at ₹29,999/month (chat and voice, the most popular plan), and Sales Manager at ₹74,999/month (all channels, white-label). Annual billing saves 15%, and there are no API bills.',
      },
      {
        q: 'What languages does the AI support?',
        a: 'English, Hindi, Kannada, Tamil, and more — six Indian languages in total, detected automatically mid-conversation rather than selected from a menu.',
      },
    ],
  },
  {
    id: 'engagement',
    label: 'Pricing, timelines & guarantees',
    items: [
      {
        q: 'How much does a bespoke website or CRM build cost?',
        a: "It depends on scope. As a reference point, a Standard real estate website starts at ₹15,000, and an Intermediate build adding CRM and WhatsApp integration is ₹24,000. Every other industry and tier is scoped individually against your actual requirements — tell us your industry and you'll get a real number within one business day.",
      },
      {
        q: 'How long does it take to go live?',
        a: 'Lynq deployments go live in 7 days from your advance payment — a written guarantee on every proposal. Bespoke website and CRM builds vary by scope, typically 2 to 22 weeks depending on the industry and delivery tier.',
      },
      {
        q: 'Is there a refund if the system does not launch?',
        a: 'Yes — a 100% refund if the system does not go live, stated in writing on every proposal.',
      },
      {
        q: 'Is there a lock-in contract?',
        a: "No. Monthly plans cancel with 15 days' written notice — there is no annual lock-in trap.",
      },
      {
        q: 'What happens after I submit an enquiry?',
        a: 'A person reads it — not an autoresponder. You get a written first take (likely tier, rough timeline, open questions), then a scoping call if it looks like a fit. On approval, a 50% advance starts the build, which can go live in as little as 7 days.',
      },
      {
        q: 'Can I speak to an existing client before deciding?',
        a: "Yes — we'll introduce you to someone running a system we built in your industry, with no sales call in between. Ask them whatever you want.",
      },
    ],
  },
];

/** Flat list, used for the FAQPage schema (order-independent for Google). */
export const faqItems = faqCategories.flatMap((c) => c.items);
