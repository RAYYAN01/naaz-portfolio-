/**
 * Portfolio — real systems built by Naaz AI Labs.
 *
 * Every entry below is a project that exists. Stacks were read from each
 * project's own package.json where present.
 *
 * Two fields are deliberately empty until the studio supplies them:
 *   `client`  — the real client name, once permission to publish it is given
 *   `results` — measured outcomes, once the client confirms the numbers
 * They render as visible placeholders rather than invented content.
 *
 * `screenshot: true` means an actual capture of the live site exists at
 * public/img/work/<slug>.jpg (900×675, matching every other project cover's
 * 4:3 crop) — render.js uses it in place of the generated gradient cover.
 *
 * `status: 'ongoing'` marks a project still in build. `live` can still be set
 * (kept for our own record and to reinstate the Visit link the moment the
 * project ships) but render.js withholds it while ongoing, showing an
 * "Ongoing" stamp on the cover instead. A project with no link at all yet
 * (still pre-launch, nothing to screenshot) just omits `live` entirely.
 *
 * `summary` is likewise optional — omit it rather than guess when nothing is
 * known yet beyond a name and industry; render.js shows a visible
 * <Description on delivery> slot instead of inventing plausible copy.
 *
 * DISPLAY ORDER is not the order below — it is fixed by `CATEGORY_ORDER`:
 * the SaaS product first, then Real Estate, Travel, Event Management, then
 * everything else. Within each group the file order is kept (the sort is
 * stable), so a new project can be appended anywhere and still lands in
 * the right block.
 */

const CATEGORY_ORDER = ['Product', 'Real Estate', 'Travel', 'Event Management'];
const categoryRank = (project) => {
  const i = CATEGORY_ORDER.indexOf(project.industry);
  return i === -1 ? CATEGORY_ORDER.length : i;
};

const projectList = [
  {
    slug: 'lynq-platform',
    title: 'Lynq — AI automation platform',
    client: 'Naaz AI Labs (in-house product)',
    tags: ['ai', 'automation', 'crm'],
    industry: 'Product',
    year: '2026',
    stack: ['WhatsApp Business API', 'Google Gemini', 'Node', 'Voice'],
    summary:
      'An AI workforce on WhatsApp, web chat, and phone lines. Answers from client documents, qualifies leads, books appointments, and runs outbound call campaigns.',
    live: 'https://lynq.naazailabs.com',
    screenshot: true,
    // Extra product screenshots beyond the cover — filenames under
    // public/img/work/, shown in a lightbox when the card's media is
    // clicked. See render.js renderProjects() and src/js/modules/gallery.js.
    gallery: ['lynq-platform-2.jpg'],
  },
  {
    slug: 'yogi-tours-and-travels',
    title: 'Yogi Tours & Travels',
    client: 'Yogi Tours & Travels',
    tags: ['web'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Fleet and tour-package site for a Bengaluru vehicle rental and tourism operator — rates, routes, and quote requests for cars, tempo travellers, and coaches across South India.',
    live: 'https://www.yogitourstravels.com/',
    screenshot: true,
  },
  {
    slug: 'renuka-tours-and-travel',
    title: 'Renuka Tours & Travels',
    client: 'Renuka Tours & Travels',
    tags: ['web'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Booking site for a Bengaluru chauffeur-driven rental company — destination search by pickup, date, and passenger count, plus fleet and fare details.',
    live: 'https://www.renukatoursandtravel.com/',
    screenshot: true,
  },
  {
    slug: 'sushi-tours-and-travels',
    title: 'Sushi Tours & Travels',
    client: 'Sushi Tours & Travels',
    tags: ['web'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Fleet and round-trip route site for a Bengaluru group-travel operator — pre-calculated outstation fares and an online booking flow by vehicle type and dates.',
    live: 'https://www.sushitravels.com',
    screenshot: true,
  },
  {
    slug: 'ariston-developers',
    title: 'Ariston Developers',
    client: 'Ariston Developers',
    tags: ['web'],
    industry: 'Real Estate',
    year: '2026',
    stack: [],
    summary:
      'Property discovery site for a Bengaluru luxury real estate developer — listings by type and status, galleries, and consultation requests for high-value buyers.',
    live: 'https://www.aristondevelopers.com/',
    screenshot: true,
  },
  {
    slug: 'av-tec',
    title: 'AV-TEC',
    client: 'AV-TEC',
    tags: ['web'],
    industry: 'Event Management',
    year: '2026',
    stack: [],
    summary:
      'Service and enquiry site for an audio-visual and event technology company — equipment categories, past-production gallery, and quote requests for events.',
    live: 'https://www.avtecindia.com',
    screenshot: true,
  },
  {
    slug: 'murudeshwara',
    title: 'Murudeshwara',
    client: 'Murudeshwara',
    tags: ['web'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Coastal tourism site for a Karnataka beach destination operator — scuba diving, beachfront stays, and bike & cab rental, with a course and crew section for the diving side of the business.',
    live: 'https://www.murudeshwara.com/',
    screenshot: true,
  },
  {
    slug: 'sarakki-homes',
    title: 'Sarakki Homes',
    client: 'Sarakki Homes',
    tags: ['web', 'crm'],
    industry: 'Real Estate',
    year: '2026',
    stack: [],
    summary:
      'Property consultancy site for a Bengaluru real estate firm — bank-auction, resale, and rental listings, backed by an admin dashboard for managing enquiries.',
    live: 'http://sarakki-homes-x191.vercel.app/',
    status: 'ongoing',
    screenshot: true,
  },
  {
    slug: 'zafoor-clinic',
    title: 'Zafoor Clinic',
    client: 'Zafoor Clinic',
    tags: ['web'],
    industry: 'Healthcare',
    year: '2026',
    stack: [],
    summary:
      'Booking site for a doctor-led skin, hair, and diabetes care clinic in Chennai — treatments, results, testimonials, and appointment requests.',
    live: 'https://zafoor-clinic-website.vercel.app/',
    status: 'ongoing',
    screenshot: true,
  },
  {
    slug: 'casa-paradiso',
    title: 'Hotel Casa Paradiso',
    client: 'Hotel Casa Paradiso',
    tags: ['web'],
    industry: 'Hospitality',
    year: '2026',
    stack: [],
    summary:
      'Booking site for an 18-room boutique hotel on Altinho hill, Panaji — room rates, on-site dining, vehicle rentals, and direct reservations.',
    live: 'https://www.panjimhotelcasaparadiso.in/',
    screenshot: true,
  },
  {
    slug: 'trishna-property-management',
    title: 'Trishna Property Management',
    client: 'Trishna Property Management',
    tags: ['web'],
    industry: 'Real Estate',
    year: '2026',
    stack: [],
    summary:
      'Listings site for a Bengaluru property firm — sale, rental, lease, and commercial spaces, with search by location and an admin sign-in for managing listings.',
    live: 'https://www.trishnapropertymanagement.in/',
    screenshot: true,
  },
  {
    slug: 'shan-maintenance-services',
    title: 'Shan Maintenance Services',
    client: 'Shan Maintenance Services',
    tags: ['web'],
    industry: 'Security',
    year: '2026',
    stack: [],
    summary:
      'Enquiry site for a Bengaluru industrial security and facilities firm — security, housekeeping, and training services, with quote requests by form, phone, or WhatsApp.',
    live: 'https://www.shanmaintenanceservices.in/',
    screenshot: true,
  },
  {
    slug: 'thonse-tours-and-travels',
    title: 'Thonse Tours & Travels',
    client: 'Thonse Tours & Travels',
    tags: ['web'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Booking site for an Udupi car rental operator — Swift Dzire and Ertiga rentals with drivers, route search, and airport transfers.',
    live: 'https://www.thonsetoursandtravels.in/',
    screenshot: true,
  },
  {
    slug: 'the-decor-party',
    title: 'The Decor Party',
    client: 'The Decor Party',
    tags: ['web'],
    industry: 'Event Management',
    year: '2026',
    stack: [],
    summary:
      'Event-decor and celebrations site for a styling company — themed decor packages, a gallery, a wishlist, and online booking for weddings, showers, and private events.',
    live: 'https://www.thedecorparty.com/',
    screenshot: true,
  },
  {
    slug: 'cauvery-resort',
    title: 'Cauvery Resort',
    client: 'Cauvery Resort',
    tags: ['web'],
    industry: 'Resort',
    year: '2026',
    stack: [],
    status: 'ongoing',
  },
  {
    slug: 'criador',
    title: 'Criador',
    client: 'Criador',
    tags: ['web'],
    industry: 'Creative Agency',
    year: '2026',
    stack: [],
    summary:
      'Site for a Bengaluru branding and business-growth studio — portfolio, case studies, and consultation booking for its branding, social, SEO, and web services.',
    live: 'https://criador-studio.vercel.app/',
    status: 'ongoing',
    screenshot: true,
  },
  {
    slug: 'darshh-bike-rentals',
    title: 'Darshh Bike Rentals',
    client: 'Darshh Bike Rentals',
    // Has its own admin CRM at crm.selfdrive.bike — not linked or screenshotted
    // publicly (it's a staff login), but the tag records that it exists.
    tags: ['web', 'crm'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Booking site for a self-drive bike, scooter, and car rental operator across Hassan, Sakleshpura, and Chikmagalur — fixed pricing, live fleet search, and booking tracking.',
    live: 'https://selfdrive.bike',
    screenshot: true,
  },
  {
    slug: 'sid-events',
    title: 'Sid Events',
    client: 'Sid Events',
    tags: ['web'],
    industry: 'Event Management',
    year: '2026',
    stack: [],
    summary:
      'Site for a Davanagere event management company — photography, decor, and catering packages, a wedding package builder, and consultation requests.',
    live: 'https://www.sideventsmanagement.com/',
    screenshot: true,
  },
  {
    slug: 'sumpreeth-tours-and-travels',
    title: 'Sumpreeth Tours & Travels',
    client: 'Sumpreeth Tours & Travels',
    // Has a staff admin portal for bookings — recorded by the tag, not linked.
    tags: ['web', 'crm'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Cab and coach rental site for a Bangalore operator — one-way, round-trip, airport, and local trips, plus tempo travellers and buses for outstation tours across Karnataka and South India, with an admin portal for bookings.',
    live: 'https://www.sumpreethtoursandtravels.com/',
    screenshot: true,
  },
  {
    slug: 'manoj-tours-and-travels',
    title: 'Manoj Tours & Travels',
    client: 'Manoj Tours & Travels',
    // Has a staff admin portal for bookings — recorded by the tag, not linked.
    tags: ['web', 'crm'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Taxi booking site for a Bangalore cab service — one-way, round-trip, local, and airport transfers across Karnataka, with an admin portal for managing bookings.',
    live: 'https://www.manojtoursandtravels.in/',
    screenshot: true,
  },
  {
    slug: 'sanju-tours-and-travels',
    title: 'Sanju Tours & Travels',
    client: 'Sanju Tours & Travels',
    tags: ['web'],
    industry: 'Travel',
    year: '2026',
    stack: [],
    summary:
      'Rental and tour site for a Hubli-Dharwad operator — cars, Tempo Travellers, and luxury coaches with per-km pricing, verified drivers, airport transfers, and outstation tours across Karnataka.',
    live: 'https://www.sanjutoursandtravels.in/',
    screenshot: true,
  },
  {
    slug: 'the-property-agent',
    title: 'The Property Agent',
    client: 'The Property Agent',
    // Has a staff admin portal for listings — recorded by the tag, not linked.
    tags: ['web', 'crm'],
    industry: 'Real Estate',
    year: '2026',
    stack: [],
    summary:
      'Listings site for a Bengaluru real estate agent — plots, farmhouse plots, agricultural land, rentals, and commercial property across Karnataka, with an admin portal for managing listings.',
    live: 'https://thepropertyagent.in/',
    screenshot: true,
  },
];

export const projects = projectList
  .slice()
  .sort((a, b) => categoryRank(a) - categoryRank(b));

export const projectFilters = [
  { value: 'all', label: 'All work' },
  { value: 'ai', label: 'Artificial Intelligence' },
  { value: 'crm', label: 'CRM' },
  { value: 'automation', label: 'Automation' },
  { value: 'web', label: 'Web Development' },
];
