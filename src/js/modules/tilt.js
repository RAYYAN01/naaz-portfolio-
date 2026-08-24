import { isCoarsePointer, prefersReducedMotion, lerp } from '../core/env.js';

/**
 * 3D perspective tilt for cards.
 *
 * Each card listens only while the pointer is over it, so the idle cost is a
 * single pointerenter handler per card. The rotation is eased rather than set
 * directly — instant tracking reads as cheap, easing reads as weight.
 */

const MAX_ROTATE = 7;
const EASE = 0.12;

export function initTilt(root = document) {
  if (isCoarsePointer || prefersReducedMotion) return;

  root.querySelectorAll('[data-tilt]').forEach(setupTilt);
}

function setupTilt(el) {
  const max = Number(el.dataset.tilt) || MAX_ROTATE;
  const glare = el.querySelector('[data-tilt-glare]');

  let rx = 0;
  let ry = 0;
  let targetRx = 0;
  let targetRy = 0;
  let px = 50;
  let py = 50;
  let raf = null;
  let rect = null;

  function measure() {
    rect = el.getBoundingClientRect();
  }

  function onEnter() {
    measure();
    el.style.transition = 'none';
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function onMove(event) {
    if (!rect) measure();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    // Invert Y so pushing the top edge away tilts it back, like a real panel.
    targetRy = (nx - 0.5) * 2 * max;
    targetRx = -(ny - 0.5) * 2 * max;
    px = nx * 100;
    py = ny * 100;
  }

  function onLeave() {
    targetRx = 0;
    targetRy = 0;
  }

  function tick() {
    rx = lerp(rx, targetRx, EASE);
    ry = lerp(ry, targetRy, EASE);

    el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`;
    if (glare) {
      glare.style.setProperty('--mx', `${px}%`);
      glare.style.setProperty('--my', `${py}%`);
    }

    const atRest = Math.abs(rx - targetRx) < 0.01 && Math.abs(ry - targetRy) < 0.01;
    if (atRest && targetRx === 0 && targetRy === 0) {
      el.style.transform = '';
      raf = null;
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  el.addEventListener('pointerenter', onEnter);
  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave);
  // A scroll under a hovered card invalidates the cached rect.
  window.addEventListener('scroll', () => { rect = null; }, { passive: true });
}
