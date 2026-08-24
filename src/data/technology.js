/**
 * Technology stack.
 *
 * Glyphs are hand-drawn 24×24 abstractions rather than official brand marks —
 * redrawing a company's logo without licence is a legal problem, and a
 * consistent geometric set reads better in a grid than 23 mismatched logos.
 */

const G = {
  markup: '<path d="M9 4 5 12l4 8M15 4l4 8-4 8"/>',
  style: '<path d="M4 5h16l-1.5 14L12 21l-6.5-2z"/><path d="M16 9H8l.4 4H15l-.4 3.5-2.6.8-2.6-.8"/>',
  utility: '<path d="M3 12c1.5-4 4-6 6-4s2 6 6 6 4.5-2 6-6"/><path d="M3 18c1.5-4 4-6 6-4"/>',
  script: '<path d="M4 4h16v16H4z"/><path d="M9 10v5.5a1.5 1.5 0 0 1-3 0M13 15.5c.6.6 1.4 1 2.3 1 1.3 0 2.2-.7 2.2-1.7 0-2.2-4.2-1.4-4.2-3.6 0-1 .9-1.7 2.1-1.7.8 0 1.5.3 2 .8"/>',
  typed: '<path d="M4 4h16v16H4z"/><path d="M7 9h6M10 9v8M14.5 16c.6.6 1.5.9 2.4.9 1.3 0 2.1-.6 2.1-1.6 0-2-4-1.3-4-3.3 0-.9.8-1.6 2-1.6.7 0 1.4.2 1.9.7"/>',
  three: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m12 12 8-4.5M12 12v9M12 12 4 7.5"/>',
  motion: '<path d="M4 16c3 0 3-8 6-8s3 8 6 8 3-4 4-4"/>',
  anime: '<circle cx="7" cy="12" r="3"/><circle cx="17" cy="12" r="3" opacity=".55"/>',
  scroll: '<path d="M12 4v16M8 8l4-4 4 4M8 16l4 4 4-4"/>',
  spline: '<path d="M4 18c4 0 4-12 8-12s4 12 8 12"/><circle cx="4" cy="18" r="1.6"/><circle cx="20" cy="18" r="1.6"/>',
  node: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="M9 15V9.5l6 5V9"/>',
  react: '<circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>',
  next: '<circle cx="12" cy="12" r="9"/><path d="M9 16V8l7 9"/><path d="M15.5 8v5"/>',
  python: '<path d="M12 3c-3 0-3 2-3 3v2h6M12 21c3 0 3-2 3-3v-2H9"/><path d="M9 8H6a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h3M15 16h3a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-3"/>',
  firebase: '<path d="m5 18 2-13 3 5 3-4 6 12z"/><path d="m5 18 14-6"/>',
  mongo: '<path d="M12 3c3 4 4.5 7 4.5 10S14 20 12 21c-2-1-4.5-5-4.5-8S9 7 12 3z"/><path d="M12 8v13"/>',
  supabase: '<path d="M13 3 5 14h7v7l8-11h-7z"/>',
  openai: '<circle cx="12" cy="12" r="4"/><path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3.5 3.5M14.5 14.5 18 18M18 6l-3.5 3.5M9.5 14.5 6 18"/>',
  gemini: '<path d="M12 3c0 5 4 9 9 9-5 0-9 4-9 9 0-5-4-9-9-9 5 0 9-4 9-9z"/>',
  claude: '<path d="M6 19 11 5h2l5 14"/><path d="M8.5 14h7"/>',
  aws: '<path d="M4 10c2 2 5 3 8 3s6-1 8-3"/><path d="M3 16c3 2.5 6 3.5 9 3.5s6-1 9-3.5"/><path d="M8 6h8"/>',
  docker: '<path d="M4 13h14a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M7 13V9h3v4M12 13V9h3v4M12 9V5h3v4"/>',
  cloud: '<path d="M7 18h10a3.5 3.5 0 0 0 0-7 5 5 0 0 0-9.6-1.4A3.6 3.6 0 0 0 7 18z"/>',
};

export const technologies = [
  { name: 'HTML5', category: 'Structure', glyph: G.markup },
  { name: 'CSS3', category: 'Structure', glyph: G.style },
  { name: 'Tailwind', category: 'Structure', glyph: G.utility },
  { name: 'JavaScript', category: 'Language', glyph: G.script },
  { name: 'TypeScript', category: 'Language', glyph: G.typed },
  { name: 'Python', category: 'Language', glyph: G.python },
  { name: 'Three.js', category: 'Graphics', glyph: G.three },
  { name: 'GSAP', category: 'Motion', glyph: G.motion },
  { name: 'Anime.js', category: 'Motion', glyph: G.anime },
  { name: 'Lenis', category: 'Motion', glyph: G.scroll },
  { name: 'Spline', category: 'Graphics', glyph: G.spline },
  { name: 'React', category: 'Framework', glyph: G.react },
  { name: 'Next.js', category: 'Framework', glyph: G.next },
  { name: 'Node', category: 'Runtime', glyph: G.node },
  { name: 'Firebase', category: 'Platform', glyph: G.firebase },
  { name: 'MongoDB', category: 'Data', glyph: G.mongo },
  { name: 'Supabase', category: 'Data', glyph: G.supabase },
  { name: 'OpenAI', category: 'Intelligence', glyph: G.openai },
  { name: 'Gemini', category: 'Intelligence', glyph: G.gemini },
  { name: 'Claude', category: 'Intelligence', glyph: G.claude },
  { name: 'AWS', category: 'Infrastructure', glyph: G.aws },
  { name: 'Docker', category: 'Infrastructure', glyph: G.docker },
  { name: 'Cloudflare', category: 'Infrastructure', glyph: G.cloud },
];
