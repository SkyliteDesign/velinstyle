/**
 * Watch content files and re-run production pipeline (debounced, Windows-safe).
 */
import { watch as fsWatch } from 'fs';
import { resolve } from 'path';

export function watchProduction(rootPath, onChange, { debounceMs = 300, ignoreNames = ['node_modules', 'dist', '.git'] } = {}) {
  const abs = resolve(rootPath);
  let timer = null;
  let closed = false;

  const kick = (event, filename) => {
    if (closed) return;
    if (filename && ignoreNames.some((n) => String(filename).includes(n))) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      Promise.resolve()
        .then(() => onChange({ event, filename }))
        .catch((err) => console.error('[velinstyle production --watch]', err));
    }, debounceMs);
  };

  let watcher;
  try {
    watcher = fsWatch(abs, { recursive: true }, kick);
  } catch {
    // recursive watch unsupported — watch root only
    watcher = fsWatch(abs, kick);
  }

  return {
    close() {
      closed = true;
      clearTimeout(timer);
      try { watcher.close(); } catch { /* ignore */ }
    },
  };
}
