import { prefersReducedMotion } from '../core/env.js';

/**
 * Entrance reveals.
 *
 * Initial states live in CSS ([data-reveal]), so there is no flash of
 * un-styled motion and no JS is needed to hide anything. This only removes the
 * state when the element earns it.
 *
 * `data-reveal-group` on a parent staggers its [data-reveal] children by
 * setting --reveal-delay, which the CSS transition already reads. Staggering in
 * CSS rather than JS means one observer callback per group, not one per child.
 */

const STAGGER_MS = 90;
const MAX_STAGGER_MS = 640;

export function initReveal(root = document) {
  const targets = root.querySelectorAll('[data-reveal]:not(.is-revealed)');
  if (!targets.length) return;

  if (prefersReducedMotion) {
    targets.forEach((el) => el.classList.add('is-revealed'));
    return;
  }

  // Assign stagger delays up front so the observer callback stays trivial.
  root.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const children = group.querySelectorAll(':scope > [data-reveal], :scope [data-reveal-item]');
    children.forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${Math.min(i * STAGGER_MS, MAX_STAGGER_MS)}ms`);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    },
    {
      // Fire slightly before the element is fully on screen so the motion
      // finishes as it settles, rather than starting late.
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.05,
    },
  );

  targets.forEach((el) => observer.observe(el));
}

/**
 * SVG path drawing. Measures each path so the dash length is exact rather
 * than a guessed constant.
 */
export function initPathDraw(root = document) {
  const paths = root.querySelectorAll('[data-draw]');
  if (!paths.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const path = entry.target;
        const length = path.getTotalLength?.() ?? 1000;
        path.style.setProperty('--draw-length', length);
        // Force a style flush so the transition has a start value to move from.
        void path.getBoundingClientRect();
        path.classList.add('is-drawn');
        observer.unobserve(path);
      }
    },
    { threshold: 0.2 },
  );

  paths.forEach((p) => observer.observe(p));
}
