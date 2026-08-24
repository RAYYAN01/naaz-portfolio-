/**
 * Small page wiring that does not justify a module of its own.
 * Each guard returns early, so a page missing the element pays nothing.
 */

/** Footer copyright year — one less thing to forget every January. */
export function initYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = String(new Date().getFullYear());
}

/**
 * Carry industry context across the site.
 *
 * The Solutions page links to /contact.html?industry=resort. Pre-selecting it
 * means the client does not re-state what they already told us by clicking.
 */
export function initContactPrefill() {
  const select = document.querySelector('[data-industry-select]');
  if (!select) return;

  const industry = new URLSearchParams(window.location.search).get('industry');
  if (!industry) return;

  const match = [...select.options].find((option) => option.value === industry);
  if (!match) return;

  select.value = industry;

  // Tell the visitor why the field is already filled, rather than leaving them
  // to wonder whether they did it.
  const note = document.createElement('p');
  note.className = 'mono-meta';
  note.style.marginBlockStart = '0.4rem';
  note.textContent = `Pre-filled from the ${match.textContent.trim()} page`;
  select.after(note);
}

/**
 * Result of a no-JS contact form submission.
 *
 * api/contact.js redirects a native (non-fetch) POST back here with
 * ?sent=1 or ?error=1 rather than returning JSON — a plain browser is
 * navigating regardless, so the confirmation has to survive a page load.
 * The JS-enhanced path in contact-form.js never triggers this: it
 * intercepts the submit before the browser navigates anywhere.
 */
export function initContactFormResult() {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const sent = params.has('sent');
  const failed = params.has('error');
  if (!sent && !failed) return;

  history.replaceState(null, '', window.location.pathname);

  const status = document.createElement('p');
  status.className = `form-status ${sent ? 'is-success' : 'is-error'}`;
  status.setAttribute('role', 'status');

  if (sent) {
    status.textContent = "Thanks — we'll reply within one business day.";
    form.hidden = true;
    form.after(status);
  } else {
    status.textContent = 'Could not send your message. Please email us directly.';
    form.append(status);
  }
}
