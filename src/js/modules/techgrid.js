import { isCoarsePointer, rafThrottle } from '../core/env.js';

/**
 * Technology grid spotlight.
 *
 * One delegated pointermove on the grid writes --mx/--my to the hovered cell,
 * which its ::after gradient reads. Delegation matters here: the grid has ~23
 * cells and per-cell listeners would be 23 handlers firing layout reads.
 */

export default function techgrid(root) {
  if (isCoarsePointer) return;

  const onMove = rafThrottle((event) => {
    const cell = event.target.closest('.tech');
    if (!cell || !root.contains(cell)) return;

    const rect = cell.getBoundingClientRect();
    cell.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    cell.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  });

  root.addEventListener('pointermove', onMove, { passive: true });
}
