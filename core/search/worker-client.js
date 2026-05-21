let _nextId = 0;

/**
 * @param {string} [workerUrl]
 */
export function createSearchWorker(workerUrl) {
  if (typeof Worker === 'undefined') return null;

  const url =
    workerUrl ||
    new URL('./worker.js', import.meta.url).href;

  let worker;
  try {
    worker = new Worker(url, { type: 'module' });
  } catch {
    return null;
  }

  /** @type {Map<number, { resolve: Function, reject: Function }>} */
  const pending = new Map();

  worker.onmessage = (e) => {
    const { id, ok, result, error } = e.data || {};
    const p = pending.get(id);
    if (!p) return;
    pending.delete(id);
    if (ok) p.resolve(result);
    else p.reject(new Error(error || 'Worker error'));
  };

  worker.onerror = () => {
    for (const p of pending.values()) p.reject(new Error('Worker failed'));
    pending.clear();
  };

  function send(type, payload) {
    const id = ++_nextId;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      worker.postMessage({ id, type, payload });
    });
  }

  return {
    setEntries(entries) {
      return send('setEntries', { entries });
    },
    query(query, options) {
      return send('query', { query, options });
    },
    terminate() {
      worker.terminate();
    },
  };
}
