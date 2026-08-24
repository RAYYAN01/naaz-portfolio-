import { isCoarsePointer, prefersReducedMotion, lerp, clamp } from '../core/env.js';

/**
 * Autonomous robot.
 *
 * It walks. Locomotion is procedural, not a keyframed loop:
 *
 *   • a steering layer picks a destination — your cursor if you have moved
 *     recently, otherwise a wander point it chooses for itself
 *   • velocity is integrated toward that destination under an acceleration
 *     limit, so it leans into a start and coasts to a stop
 *   • the gait phase advances with DISTANCE TRAVELLED rather than time, which
 *     is what stops the feet skating: step length stays constant at any speed,
 *     and the legs halt the instant the body does
 *   • each foot is placed from that phase and the knee solved with the same
 *     two-bone IK the arm uses
 *
 * The arm tracks the pointer independently of the legs, so it can walk toward
 * you and reach for you at the same time.
 *
 * Scoped to the cover only: the stage is an absolutely-positioned child of
 * .hero (not fixed to the viewport), all walking bounds are measured against
 * the hero's own box rather than window.innerWidth, and the loop stops
 * entirely once the hero scrolls out of view — it belongs to the landing
 * section, not to the rest of the site.
 */

/* --- Skeleton, in viewBox units ----------------------------------------- */
const ARM_UPPER = 92;
const ARM_FORE = 84;
const SHOULDER = { x: 280, y: 278 };
const ARM_REST = { x: 302, y: 448 };

const THIGH = 88;
const SHIN = 88;
const HIP_NEAR = { x: 192, y: 468 };
const HIP_FAR = { x: 248, y: 468 };
const GROUND = 644;

/* --- Gait ---------------------------------------------------------------- */
const STRIDE = 34; // half a step
const LIFT = 26; // peak foot clearance
const CYCLE_DISTANCE = 132; // px of travel per full cycle; raise if feet skate

/* --- Locomotion ---------------------------------------------------------- */
const MAX_SPEED = 380; // px/sec
const ACCEL = 900;
const ARRIVE_RADIUS = 90;
const STOP_RADIUS = 26;
const CHASE_WINDOW = 2600; // ms of pointer stillness before it wanders again

const EASE_HAND = 0.09;
const EASE_HEAD = 0.06;
const EASE_LEAN = 0.045;

/** Two-bone IK — the mid joint for a root, a target, and two lengths. */
function solveJoint(rx, ry, tx, ty, l1, l2, bend = 1) {
  const dx = tx - rx;
  const dy = ty - ry;
  // Clamp reach: past full extension the triangle degenerates and acos returns
  // NaN, which would blank the limb for a frame.
  const dist = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + 0.01, l1 + l2 - 0.01);
  const base = Math.atan2(dy, dx);
  const cosA = clamp((dist * dist + l1 * l1 - l2 * l2) / (2 * dist * l1), -1, 1);
  const angle = base - Math.acos(cosA) * bend;
  return { x: rx + Math.cos(angle) * l1, y: ry + Math.sin(angle) * l1 };
}

export default function heroRobot(stage) {
  const svg = stage.querySelector('.robot');
  if (!svg) return;

  // The stage must live inside .hero for the "landing page only" contract to
  // hold — it is what makes the figure scroll away with the cover instead of
  // riding fixed over every other section.
  const hero = stage.closest('.hero');
  if (!hero) return;

  const glow = hero.querySelector('.hero__glow');

  const q = (sel) => [...svg.querySelectorAll(sel)];
  const one = (sel) => svg.querySelector(sel);

  const arm = one('[data-arm="right"]');
  const armUpper = q('[data-bone="upper"]');
  const armFore = q('[data-bone="fore"]');
  const armElbow = arm.querySelector('[data-joint="elbow"]');
  const handGroup = arm.querySelector('[data-joint="hand-group"]');
  const hand = one('.robot__hand');
  const head = one('.robot__head');
  const body = one('.robot__body');
  const eyes = one('.robot__eyes');
  const pupils = q('.robot__pupil');
  const faceHit = one('.robot__face-hit');

  const legs = [
    {
      hip: HIP_NEAR,
      phase: 0,
      thigh: q('[data-bone="n-thigh"]'),
      shin: q('[data-bone="n-shin"]'),
      knee: one('[data-joint="n-knee"]'),
      foot: one('[data-joint="n-foot"]'),
    },
    {
      hip: HIP_FAR,
      phase: Math.PI, // opposite leg, half a cycle out
      thigh: q('[data-bone="f-thigh"]'),
      shin: q('[data-bone="f-shin"]'),
      knee: one('[data-joint="f-knee"]'),
      foot: one('[data-joint="f-foot"]'),
    },
  ];

  /* --- Geometry cache: no layout reads inside the loop ------------------- */
  const [, , VB_W, VB_H] = svg.getAttribute('viewBox').split(/\s+/).map(Number);
  let box = svg.getBoundingClientRect();
  let heroBox = hero.getBoundingClientRect();
  let stageW = stage.offsetWidth || 200;
  const measure = () => {
    box = svg.getBoundingClientRect();
    heroBox = hero.getBoundingClientRect();
    stageW = stage.offsetWidth || 200;
  };
  window.addEventListener('resize', measure, { passive: true });
  // Walking bounds are in hero-local units and don't need this, but the
  // pointer→local mapping below (glow, arm target) is in viewport coordinates
  // and does — the hero's on-screen position changes as the page scrolls even
  // though its size does not.
  window.addEventListener('scroll', measure, { passive: true });
  stage.addEventListener('transitionend', measure);

  /* --- State: posX is local to the hero (0 = hero's left edge) ----------- */
  let posX = heroBox.width * 0.7;
  let velX = 0;
  let facing = 1;
  let facingEased = 1;
  let gait = 0;
  let bob = 0;

  let pointerX = null; // raw viewport coords — used for the arm's IK target
  let pointerY = null;
  let pointerLocalX = null; // hero-local — same frame as posX, used for steering
  let lastPointerAt = -Infinity;
  let wanderX = posX;
  let nextWanderAt = 0;

  let handX = ARM_REST.x;
  let handY = ARM_REST.y;
  let armTX = ARM_REST.x;
  let armTY = ARM_REST.y;
  let headRot = 0;
  let headTarget = 0;
  let lean = 0;
  let leanTarget = 0;

  let glowX = 50;
  let glowY = 50;
  let glowTX = 50;
  let glowTY = 50;

  let nextBlink = 1400;
  let blinkUntil = 0;
  let blinkQueue = 0;

  /* --- Face expression + jump -------------------------------------------- */
  const HOLD_TO_JUMP_MS = 2000;
  const JUMP_DURATION_MS = 520;
  const JUMP_HEIGHT = 46;

  let hoverTimer = null;
  let angryTimer = null;
  let jumping = false;
  let jumpStart = 0;
  // True while the pointer is over the face. Holds the body in place so a
  // hover doesn't immediately slide the face out from under the cursor —
  // the walk-to-stand-beside-you steering would otherwise treat a hover as
  // just another cursor position to approach, and "leave" the moment it did.
  let overFace = false;

  function setFace(state) {
    svg.classList.toggle('is-heart', state === 'heart');
    svg.classList.toggle('is-angry', state === 'angry');
  }

  function triggerJump() {
    if (jumping) return;
    jumping = true;
    jumpStart = performance.now();
  }

  const interactive = !isCoarsePointer && !prefersReducedMotion;

  // Only the hero's own pointer events count. A window-level listener would
  // let the robot keep reaching for the cursor while you read the rest of the
  // page below the fold — exactly the "everywhere" behaviour being removed.
  if (interactive) {
    hero.addEventListener(
      'pointermove',
      (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        lastPointerAt = performance.now();
        if (heroBox.width) {
          pointerLocalX = event.clientX - heroBox.left;
          glowTX = (pointerLocalX / heroBox.width) * 100;
          glowTY = ((event.clientY - heroBox.top) / heroBox.height) * 100;
        }
      },
      { passive: true },
    );

    hero.addEventListener('pointerenter', () => hero.classList.add('is-pointer-in'));
    hero.addEventListener('pointerleave', () => {
      hero.classList.remove('is-pointer-in');
      // Forget the cursor the moment it leaves the cover, so the arm relaxes
      // back to idle instead of reaching toward a stale last-known point.
      pointerX = null;
      pointerLocalX = null;
      lastPointerAt = -Infinity;
    });

    if (faceHit) {
      // A light touch (hover) reads as affection; holding it is what earns
      // the jump. A click reads as a prod, so it gets an angry beat instead.
      faceHit.addEventListener('pointerenter', () => {
        overFace = true;
        setFace('heart');
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(triggerJump, HOLD_TO_JUMP_MS);
      });
      faceHit.addEventListener('pointerleave', () => {
        overFace = false;
        clearTimeout(hoverTimer);
        clearTimeout(angryTimer);
        setFace('idle');
      });
      faceHit.addEventListener('pointerdown', () => {
        // The hold-to-jump timer keeps counting through a click — a prod
        // mid-hover shouldn't reset how long the face has been touched.
        setFace('angry');
        clearTimeout(angryTimer);
        angryTimer = setTimeout(() => setFace('heart'), 900);
      });
    }
  }

  // Runs only while the cover is at least partly on screen. This is what
  // confines the whole animation to the landing section — once .hero scrolls
  // away the loop stops rather than shrinking into a docked corner icon.
  let onScreen = true;
  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      onScreen ? play() : stop();
    },
    { threshold: 0 },
  ).observe(hero);

  /* --- Frame ------------------------------------------------------------- */
  let last = performance.now();
  let raf = null;

  function frame(now) {
    // Clamp dt: a backgrounded tab returns a huge delta that would teleport the
    // body across the screen and spike the gait phase.
    const dt = Math.min((now - last) / 1000, 1 / 24);
    last = now;

    /* -- Steer: cursor if recent, otherwise wander ----------------------- */
    // Bounds are the hero's own width, not the viewport's — the figure paces
    // the cover, not the page.
    const half = stageW / 2;
    const minX = half * 0.4;
    const maxX = heroBox.width - half * 0.4;
    const chasing = interactive && pointerLocalX !== null && now - lastPointerAt < CHASE_WINDOW;

    let goalX;
    if (overFace) {
      // Hold still while being pet — otherwise the stand-beside-you steering
      // below immediately walks the face out from under the pointer.
      goalX = posX;
    } else if (chasing) {
      // Stand beside the cursor rather than on it, on the side it approached
      // from — walking through the pointer reads as a bug, not a greeting.
      goalX = pointerLocalX - Math.sign(pointerLocalX - posX || 1) * 70;
    } else {
      if (now > nextWanderAt) {
        wanderX = minX + Math.random() * (maxX - minX);
        nextWanderAt = now + 3200 + Math.random() * 4200;
      }
      goalX = wanderX;
    }
    goalX = clamp(goalX, minX, maxX);

    /* -- Integrate velocity ---------------------------------------------- */
    const dx = goalX - posX;
    const dist = Math.abs(dx);
    // Ease down inside the arrival radius so it settles instead of hunting.
    const desired =
      dist < STOP_RADIUS ? 0 : Math.sign(dx) * MAX_SPEED * clamp(dist / ARRIVE_RADIUS, 0, 1);
    velX += clamp(desired - velX, -ACCEL * dt, ACCEL * dt);
    if (Math.abs(velX) < 4 && dist < STOP_RADIUS) velX = 0;
    posX = clamp(posX + velX * dt, minX, maxX);

    const speed = Math.abs(velX);
    if (speed > 30) facing = Math.sign(velX);
    facingEased = lerp(facingEased, facing, 0.12);

    /* -- Gait: driven by distance, so the feet cannot skate -------------- */
    gait += ((speed * dt) / CYCLE_DISTANCE) * Math.PI * 2;
    const amp = clamp(speed / (MAX_SPEED * 0.55), 0, 1);
    bob = lerp(bob, Math.sin(gait * 2) * 3.2 * amp, 0.3);

    for (const leg of legs) {
      const p = gait + leg.phase;
      const fx = leg.hip.x + Math.sin(p) * STRIDE * amp;
      const fy = GROUND - Math.max(0, Math.cos(p)) * LIFT * amp;

      // bend = -1 keeps the knee folding backward; it can never invert.
      const knee = solveJoint(leg.hip.x, leg.hip.y, fx, fy, THIGH, SHIN, -1);

      for (const b of leg.thigh) {
        b.setAttribute('x2', knee.x.toFixed(2));
        b.setAttribute('y2', knee.y.toFixed(2));
      }
      for (const b of leg.shin) {
        b.setAttribute('x1', knee.x.toFixed(2));
        b.setAttribute('y1', knee.y.toFixed(2));
        b.setAttribute('x2', fx.toFixed(2));
        b.setAttribute('y2', fy.toFixed(2));
      }
      leg.knee.setAttribute('cx', knee.x.toFixed(2));
      leg.knee.setAttribute('cy', knee.y.toFixed(2));
      leg.foot.setAttribute('transform', `translate(${fx.toFixed(2)} ${fy.toFixed(2)})`);
    }

    /* -- Arm reaches for the pointer ------------------------------------- */
    // While being pet, keep the arm at rest — otherwise it reaches straight
    // for the cursor sitting on the face and the hand covers the expression.
    if (chasing && box.width && !overFace) {
      // Mirror into local space when the body is flipped, or the arm reaches
      // away from the cursor every time it walks left.
      let localX = ((pointerX - box.left) / box.width) * VB_W;
      if (facingEased < 0) localX = VB_W - localX;
      armTX = localX;
      armTY = ((pointerY - box.top) / box.height) * VB_H;
      headTarget = clamp((armTX - 220) / 220, -1, 1) * 8;
      leanTarget = clamp((armTX - 220) / 220, -1, 1) * 7;
    } else {
      const t = now / 1000;
      armTX = ARM_REST.x + Math.sin(t * 0.7) * 14;
      armTY = ARM_REST.y + Math.cos(t * 0.9) * 10;
      headTarget = Math.sin(t * 0.45) * 3;
      leanTarget = Math.sin(t * 0.4) * 2;
    }

    handX = lerp(handX, armTX, EASE_HAND);
    handY = lerp(handY, armTY, EASE_HAND);
    headRot = lerp(headRot, headTarget, EASE_HEAD);
    lean = lerp(lean, leanTarget, EASE_LEAN);

    const elbow = solveJoint(SHOULDER.x, SHOULDER.y, handX, handY, ARM_UPPER, ARM_FORE, 1);
    const wrist = Math.atan2(handY - elbow.y, handX - elbow.x);
    const hx = elbow.x + Math.cos(wrist) * ARM_FORE;
    const hy = elbow.y + Math.sin(wrist) * ARM_FORE;

    for (const b of armUpper) {
      b.setAttribute('x2', elbow.x.toFixed(2));
      b.setAttribute('y2', elbow.y.toFixed(2));
    }
    for (const b of armFore) {
      b.setAttribute('x1', elbow.x.toFixed(2));
      b.setAttribute('y1', elbow.y.toFixed(2));
      b.setAttribute('x2', hx.toFixed(2));
      b.setAttribute('y2', hy.toFixed(2));
    }
    armElbow.setAttribute('cx', elbow.x.toFixed(2));
    armElbow.setAttribute('cy', elbow.y.toFixed(2));
    handGroup.setAttribute(
      'transform',
      `translate(${hx.toFixed(2)} ${hy.toFixed(2)}) rotate(${((wrist * 180) / Math.PI).toFixed(2)})`,
    );

    if (hand) {
      const reach = Math.hypot(armTX - hx, armTY - hy);
      hand.setAttribute('transform', `scale(${(1 + clamp(1 - reach / 90, 0, 1) * 0.14).toFixed(3)})`);
    }

    head.setAttribute('transform', `rotate(${headRot.toFixed(2)} 220 190)`);
    body.setAttribute('transform', `translate(${lean.toFixed(2)} ${bob.toFixed(2)})`);

    /* -- Blink ------------------------------------------------------------ */
    if (now > nextBlink && now > blinkUntil) {
      blinkUntil = now + 130;
      if (blinkQueue > 0) {
        blinkQueue -= 1;
        nextBlink = now + 300;
      } else {
        blinkQueue = Math.random() < 0.25 ? 1 : 0;
        nextBlink = now + 2600 + Math.random() * 3800;
      }
    }
    if (eyes) {
      eyes.setAttribute(
        'transform',
        now < blinkUntil ? 'translate(0 169) scale(1 0.08) translate(0 -169)' : '',
      );
    }

    const px = clamp((handX - 220) / 220, -1, 1) * 3.4;
    const py = clamp((handY - 340) / 300, -1, 1) * 2.6;
    for (const pupil of pupils) {
      const base = pupil.dataset.eye === 'l' ? 203 : 239;
      pupil.setAttribute('cx', (base + px).toFixed(2));
      pupil.setAttribute('cy', (169 + py).toFixed(2));
    }

    if (glow) {
      glowX = lerp(glowX, glowTX, 0.12);
      glowY = lerp(glowY, glowTY, 0.12);
      glow.style.setProperty('--gx', `${glowX.toFixed(2)}%`);
      glow.style.setProperty('--gy', `${glowY.toFixed(2)}%`);
    }

    /* -- Jump: a held hover on the face earns a hop, eased with a sine arc so
       it lands as softly as it left ------------------------------------- */
    let jumpY = 0;
    if (jumping) {
      const t = (now - jumpStart) / JUMP_DURATION_MS;
      if (t >= 1) jumping = false;
      else jumpY = -Math.sin(Math.min(t, 1) * Math.PI) * JUMP_HEIGHT;
    }

    // translate3d + scaleX keeps placement on the compositor.
    stage.style.transform =
      `translate3d(${(posX - stageW / 2).toFixed(1)}px, ${jumpY.toFixed(1)}px, 0) scaleX(${facingEased.toFixed(3)})`;

    raf = requestAnimationFrame(frame);
  }

  function play() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  if (prefersReducedMotion) {
    frame(performance.now());
    stop();
    return;
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
  measure();
  play();
}
