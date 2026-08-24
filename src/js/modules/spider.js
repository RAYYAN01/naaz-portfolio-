import { prefersReducedMotion, isCoarsePointer, clamp, lerp } from '../core/env.js';

/**
 * Chasing spider — a small easter egg beside the "Request a reference" CTA.
 *
 * On a device with a real cursor it follows the pointer around the section,
 * trailing a little behind rather than sitting glued under it — a per-frame
 * lerp toward the cursor position, the same eased-chase technique the hero
 * robot's arm uses elsewhere. Touch devices have no cursor
 * to follow, so it wanders to random points instead; on desktop, wandering
 * is also the fallback once the pointer has sat still for a moment.
 *
 * Purely decorative and purely bonus either way: the real link sits right
 * next to it and reaches the same page on its own, so this is aria-hidden
 * and pulled out of tab order rather than becoming a second, harder-to-
 * discover way to get there.
 */

const EASE = 0.09;
const FOLLOW_OFFSET_X = -16; // trails just behind/below the cursor, never under it
const FOLLOW_OFFSET_Y = 22;
const MARGIN = 20;
const IDLE_MS = 1400; // pointer this quiet inside the section → resume wandering
const WANDER_MIN_MS = 1600;
const WANDER_MAX_MS = 3200;

export default function spider(el) {
  const section = el.closest('.section');
  const href = el.dataset.spiderLink;
  if (!section || !href) return;

  if (prefersReducedMotion) {
    // A chasing/wandering creature is exactly the motion this preference
    // opts out of — leave it out entirely rather than showing it inert.
    el.remove();
    return;
  }

  const canFollow = !isCoarsePointer;

  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let facing = 1;
  let fleeing = false;
  let raf = null;
  let wanderAt = 0;
  let pointerAt = -Infinity;
  let pointerX = 0;
  let pointerY = 0;

  const bounds = () => {
    const rect = section.getBoundingClientRect();
    const size = el.offsetWidth || 34;
    return {
      minX: MARGIN,
      maxX: Math.max(MARGIN, rect.width - size - MARGIN),
      minY: MARGIN,
      maxY: Math.max(MARGIN, rect.height - size - MARGIN),
      rect,
    };
  };

  function pickWander(now, b) {
    targetX = b.minX + Math.random() * (b.maxX - b.minX);
    targetY = b.minY + Math.random() * (b.maxY - b.minY);
    wanderAt = now + WANDER_MIN_MS + Math.random() * (WANDER_MAX_MS - WANDER_MIN_MS);
  }

  function frame(now) {
    if (fleeing) return;

    const b = bounds();
    const following = canFollow && now - pointerAt < IDLE_MS;
    if (following) {
      targetX = clamp(pointerX - b.rect.left + FOLLOW_OFFSET_X, b.minX, b.maxX);
      targetY = clamp(pointerY - b.rect.top + FOLLOW_OFFSET_Y, b.minY, b.maxY);
    } else if (now > wanderAt) {
      pickWander(now, b);
    }

    const dx = targetX - x;
    if (Math.abs(dx) > 0.5) facing = dx < 0 ? -1 : 1;
    x = lerp(x, targetX, EASE);
    y = lerp(y, targetY, EASE);
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scaleX(${facing})`;

    raf = requestAnimationFrame(frame);
  }

  function onPointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    pointerAt = performance.now();
  }

  function flee(event) {
    event.preventDefault();
    if (fleeing) return;
    fleeing = true;
    if (raf) cancelAnimationFrame(raf);

    // Bolt toward whichever corner it's already closer to — reads as
    // startled, not as sliding off in some fixed direction every time.
    const b = bounds();
    const cornerX = x < (b.minX + b.maxX) / 2 ? b.minX - 60 : b.maxX + 60;
    const cornerY = y < (b.minY + b.maxY) / 2 ? b.minY - 40 : b.maxY + 40;
    facing = cornerX < x ? -1 : 1;
    // The class switches on the one CSS transition this element ever uses —
    // during normal follow/wander the position is driven per-frame above,
    // and a transition on the same property would fight that loop.
    el.classList.add('is-fleeing');
    el.style.transform = `translate3d(${cornerX}px, ${cornerY}px, 0) scaleX(${facing})`;

    window.setTimeout(() => {
      window.location.href = href;
    }, 500);
  }

  el.addEventListener('click', flee);
  if (canFollow) {
    section.addEventListener('pointermove', onPointerMove, { passive: true });
  }

  const b = bounds();
  x = b.minX + Math.random() * (b.maxX - b.minX) * 0.4;
  y = b.minY + Math.random() * (b.maxY - b.minY);
  pickWander(0, b);
  el.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(1)`;
  raf = requestAnimationFrame(frame);
}
