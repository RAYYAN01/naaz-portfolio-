/**
 * Click-to-open screenshot lightbox for a project card.
 *
 * Only wired up when a project actually has extra screenshots beyond its
 * cover (see the `gallery` field in src/data/projects.js) — most cards have
 * none of this markup at all and stay exactly as plain as they look.
 *
 * One overlay is built lazily on first open and reused for every gallery on
 * the page, rather than one hidden overlay per card sitting in the DOM from
 * load — there is normally only one, but the mechanism doesn't assume that.
 */

let overlay = null;
let imgEl = null;
let captionEl = null;
let counterEl = null;
let prevBtn = null;
let nextBtn = null;
let images = [];
let index = 0;
let lastFocused = null;

function build() {
  overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Project screenshots');
  overlay.hidden = true;

  overlay.innerHTML = `
    <div class="lightbox__scrim" data-lightbox-close></div>
    <div class="lightbox__stage">
      <img class="lightbox__img" alt="" />
      <p class="lightbox__caption"></p>
      <div class="lightbox__bar">
        <button type="button" class="lightbox__nav" data-lightbox-prev aria-label="Previous screenshot">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="m10 3-5 5 5 5"/></svg>
        </button>
        <span class="lightbox__count mono-meta"></span>
        <button type="button" class="lightbox__nav" data-lightbox-next aria-label="Next screenshot">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="m6 3 5 5-5 5"/></svg>
        </button>
      </div>
      <button type="button" class="lightbox__close" data-lightbox-close aria-label="Close">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M4 4l8 8M12 4l-8 8"/></svg>
      </button>
    </div>
  `;

  document.body.append(overlay);
  imgEl = overlay.querySelector('.lightbox__img');
  captionEl = overlay.querySelector('.lightbox__caption');
  counterEl = overlay.querySelector('.lightbox__count');
  prevBtn = overlay.querySelector('[data-lightbox-prev]');
  nextBtn = overlay.querySelector('[data-lightbox-next]');

  overlay.addEventListener('click', (event) => {
    if (event.target.closest('[data-lightbox-close]')) close();
  });
  prevBtn.addEventListener('click', () => show(index - 1));
  nextBtn.addEventListener('click', () => show(index + 1));
  document.addEventListener('keydown', (event) => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') show(index - 1);
    if (event.key === 'ArrowRight') show(index + 1);
  });
}

function show(i) {
  index = (i + images.length) % images.length;
  imgEl.src = images[index];
  counterEl.textContent = `${index + 1} / ${images.length}`;
  const multi = images.length > 1;
  prevBtn.hidden = !multi;
  nextBtn.hidden = !multi;
  counterEl.hidden = !multi;
}

function open(list, title) {
  if (!overlay) build();
  images = list;
  captionEl.textContent = title;
  lastFocused = document.activeElement;
  overlay.hidden = false;
  document.body.classList.add('lightbox-open');
  show(0);
  overlay.querySelector('[data-lightbox-close]').focus();
}

function close() {
  if (!overlay || overlay.hidden) return;
  overlay.hidden = true;
  document.body.classList.remove('lightbox-open');
  lastFocused?.focus();
}

export default function gallery(el) {
  let list;
  try {
    list = JSON.parse(el.dataset.gallery);
  } catch {
    return;
  }
  if (!Array.isArray(list) || !list.length) return;

  const title = el.dataset.galleryTitle ?? '';
  const activate = () => open(list, title);

  el.addEventListener('click', activate);
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      activate();
    }
  });
}
