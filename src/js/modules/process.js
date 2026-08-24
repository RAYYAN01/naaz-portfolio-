import { gsap } from '../core/scroll.js';
import { prefersReducedMotion } from '../core/env.js';

/**
 * Process timeline.
 *
 * The spine fills as the section scrolls (scrubbed), and each station latches
 * on when the spine reaches it. Both read from the same ScrollTrigger progress
 * so the dot can never light before the line arrives.
 */

export default function process(root) {
  const fill = root.querySelector('[data-process-fill]');
  const steps = [...root.querySelectorAll('.step')];
  if (!steps.length) return;

  if (prefersReducedMotion) {
    fill?.style.setProperty('--fill', '1');
    steps.forEach((step) => step.classList.add('is-active'));
    return;
  }

  gsap.to(
    {},
    {
      scrollTrigger: {
        trigger: root,
        start: 'top 65%',
        end: 'bottom 75%',
        scrub: 0.6,
        onUpdate: ({ progress }) => {
          fill?.style.setProperty('--fill', progress.toFixed(4));

          // A step lights once the fill passes its own position on the spine.
          const reached = Math.round(progress * steps.length);
          steps.forEach((step, i) => {
            step.classList.toggle('is-active', i < reached);
          });
        },
      },
    },
  );
}
