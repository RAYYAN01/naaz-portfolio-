import { prefersReducedMotion } from '../core/env.js';

/**
 * Project filtering with FLIP re-ordering.
 *
 * Hiding items makes the survivors jump to new grid positions. FLIP records
 * where each one was, lets the browser lay out the new state, then animates
 * from the old position to the new — so the grid re-flows visibly instead of
 * snapping, and it costs two layout reads rather than a per-item tween.
 */

export default function filter(root) {
  const buttons = [...root.querySelectorAll('[data-filter]')];
  const grid = root.querySelector('[data-filter-grid]');
  if (!buttons.length || !grid) return;

  const items = [...grid.children];
  const liveRegion = root.querySelector('[data-filter-status]');

  function apply(value) {
    // FIRST — where is everything now.
    const first = new Map(items.map((item) => [item, item.getBoundingClientRect()]));

    let shown = 0;
    for (const item of items) {
      const tags = (item.dataset.tags ?? '').split(/\s+/);
      const matches = value === 'all' || tags.includes(value);
      item.hidden = !matches;
      if (matches) shown += 1;
    }

    if (liveRegion) {
      liveRegion.textContent = `${shown} project${shown === 1 ? '' : 's'} shown`;
    }

    if (prefersReducedMotion) return;

    // LAST + INVERT + PLAY.
    for (const item of items) {
      if (item.hidden) continue;
      const before = first.get(item);
      const after = item.getBoundingClientRect();
      const dx = before.left - after.left;
      const dy = before.top - after.top;
      if (!dx && !dy) continue;

      item.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: 520, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
      );
    }
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      apply(button.dataset.filter);
    });
  });
}
