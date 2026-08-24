/**
 * Environment probes.
 * Read once at boot — these do not change mid-session, and querying
 * matchMedia inside animation loops is a measurable cost.
 */

export const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch = window.matchMedia('(hover: none)').matches;

export const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

/** Devices that will not hold 60fps under a WebGL hero. */
export const isLowPower =
  navigator.hardwareConcurrency <= 4 || (navigator.deviceMemory ?? 8) <= 4;

/** Clamp a value into a range. */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/** Linear interpolation — the backbone of every easing loop here. */
export const lerp = (a, b, t) => a + (b - a) * t;

/** Map a value from one range to another, clamped. */
export const mapRange = (value, inMin, inMax, outMin, outMax) => {
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
};

/** rAF-throttle: collapses bursts of events into one frame of work. */
export function rafThrottle(fn) {
  let queued = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}
