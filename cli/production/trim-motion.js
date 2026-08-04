/**
 * Motion trim helpers — decide whether motion CSS files participate + explain removals.
 */
export function shouldIncludeMotion(extracted, { force = null } = {}) {
  if (force === true) return true;
  if (force === false) return false;
  const motion = extracted.motion || new Set();
  const classes = extracted.classes || new Set();
  if (motion.size > 0) return true;
  for (const c of classes) {
    if (/animate|motion|transition|scroll-fade|scroll-reveal/i.test(c)) return true;
  }
  return false;
}

export function motionClassSet(extracted) {
  const set = new Set(extracted.motion || []);
  for (const c of extracted.classes || []) {
    if (/animate|motion|scroll-/i.test(c)) set.add(c);
  }
  return set;
}
