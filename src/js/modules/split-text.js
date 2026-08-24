import { prefersReducedMotion } from '../core/env.js';

/**
 * Line/word splitting for display type.
 *
 * Splits on *rendered* lines rather than a fixed word count, so the mask always
 * matches how the browser actually wrapped the text at the current width. Each
 * line gets its own overflow-hidden wrapper and slides up in sequence.
 *
 * Re-splits on resize (debounced) because a fluid type scale rewraps constantly.
 */

export default function splitText(el) {
  // Splitting rebuilds the element from its text, which would silently discard
  // inline markup (an <em>, a <br>, a link). Refuse rather than destroy it —
  // those headlines should use [data-reveal] instead.
  if (el.children.length > 0) {
    console.warn('[naaz] splitText skipped: element contains markup', el);
    el.classList.add('is-revealed');
    return;
  }

  if (prefersReducedMotion) {
    el.classList.add('is-split-done');
    return;
  }

  const original = el.textContent.trim();
  let resizeTimer;
  let lastWidth = 0;

  function split() {
    el.textContent = '';

    // Stage 1: every word in its own inline-block so we can read line boxes.
    const words = original.split(/\s+/).map((word) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      el.append(span, document.createTextNode(' '));
      return span;
    });

    // Stage 2: group words by their offsetTop — that is the real line break.
    const lines = [];
    let currentTop = null;
    for (const word of words) {
      const top = word.offsetTop;
      if (top !== currentTop) {
        currentTop = top;
        lines.push([]);
      }
      lines.at(-1).push(word.textContent);
    }

    // Stage 3: rebuild as masked lines.
    el.textContent = '';
    lines.forEach((words, i) => {
      const mask = document.createElement('span');
      mask.className = 'line-mask';
      const inner = document.createElement('span');
      inner.textContent = words.join(' ');
      inner.style.transitionDelay = `${i * 90}ms`;
      mask.append(inner);
      el.append(mask);
    });

    el.classList.add('is-split');
  }

  function play() {
    el.querySelectorAll('.line-mask > span').forEach((line) => {
      line.style.transition = 'transform var(--dur-cinematic) var(--ease-out-expo)';
      line.style.transform = 'translate3d(0, 0, 0)';
    });
  }

  split();
  lastWidth = window.innerWidth;

  // Play on sight, not on load — a headline below the fold should wait.
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      requestAnimationFrame(play);
    },
    { threshold: 0.15 },
  );
  observer.observe(el);

  window.addEventListener(
    'resize',
    () => {
      // Ignore mobile browser chrome collapsing, which fires resize on scroll.
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        split();
        play();
      }, 220);
    },
    { passive: true },
  );
}
