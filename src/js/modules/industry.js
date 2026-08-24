import { ScrollTrigger, scrollTo } from '../core/scroll.js';
import { prefersReducedMotion } from '../core/env.js';

/**
 * Industry accordion — the Solutions page's primary interaction.
 *
 * The open/close animation is CSS (grid-template-rows 0fr → 1fr), which means
 * it animates to the panel's natural height without JS ever measuring it. This
 * module owns state, ARIA, and the two behaviours CSS cannot do: closing
 * siblings, and keeping the opened card in view.
 *
 * Accordion semantics: buttons with aria-expanded controlling a region. Not a
 * <details> element, because the panel must animate and <details> cannot
 * without fighting its own open attribute.
 */

export default function industry(root) {
  const items = [...root.querySelectorAll('[data-industry]')];
  if (!items.length) return;

  // Exclusive by default — two open panels push the rest off-screen and the
  // page stops reading as a comparison.
  const exclusive = root.dataset.industryExclusive !== 'false';

  const controls = items.map((item) => {
    const head = item.querySelector('.industry__head');
    const panel = item.querySelector('.industry__panel');
    return { item, head, panel };
  });

  function setOpen({ item, head, panel }, open, { focus = false } = {}) {
    item.classList.toggle('is-open', open);
    head.setAttribute('aria-expanded', String(open));
    panel.toggleAttribute('inert', !open);

    if (open) {
      // The panel grows below the header; without this the header can end up
      // above the fold and the content the user asked for is off-screen.
      const settle = prefersReducedMotion ? 0 : 620;
      window.setTimeout(() => {
        ScrollTrigger.refresh();
        const rect = item.getBoundingClientRect();
        if (rect.top < 80 || rect.bottom > window.innerHeight) {
          scrollTo(item, { offset: -100 });
        }
      }, settle);
    }
    if (focus) head.focus();
  }

  controls.forEach((control) => {
    const { item, head, panel } = control;

    // Establish the closed state in the DOM rather than the markup, so the
    // page is still readable if this module never loads.
    const startOpen = item.hasAttribute('data-industry-open');
    head.setAttribute('aria-expanded', String(startOpen));
    item.classList.toggle('is-open', startOpen);
    panel.toggleAttribute('inert', !startOpen);

    head.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');

      if (willOpen && exclusive) {
        controls.forEach((other) => {
          if (other !== control && other.item.classList.contains('is-open')) {
            setOpen(other, false);
          }
        });
      }

      setOpen(control, willOpen);
    });
  });

  // Roving arrow-key navigation between headers — expected of an accordion.
  root.addEventListener('keydown', (event) => {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;

    const index = controls.findIndex((c) => c.head === document.activeElement);
    if (index === -1) return;

    event.preventDefault();
    const last = controls.length - 1;
    const next =
      event.key === 'ArrowDown' ? Math.min(index + 1, last)
      : event.key === 'ArrowUp' ? Math.max(index - 1, 0)
      : event.key === 'Home' ? 0
      : last;

    controls[next].head.focus();
  });

  // Deep link: /solutions.html#resort opens and scrolls to that industry.
  const hash = window.location.hash.slice(1);
  if (hash) {
    const target = controls.find((c) => c.item.id === hash);
    if (target) {
      setOpen(target, true);
      window.setTimeout(() => scrollTo(target.item, { offset: -100 }), 400);
    }
  }
}
