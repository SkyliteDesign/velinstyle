import { VelinSearchEngine } from './engine.js';

const engine = new VelinSearchEngine();

self.onmessage = (event) => {
  const { id, type, payload } = event.data || {};
  try {
    if (type === 'setEntries') {
      engine.setEntries(payload.entries || []);
      self.postMessage({ id, ok: true });
    } else if (type === 'query') {
      const result = engine.query(payload.query, payload.options || {});
      self.postMessage({ id, ok: true, result });
    } else {
      self.postMessage({ id, ok: false, error: 'Unknown message type' });
    }
  } catch (err) {
    self.postMessage({ id, ok: false, error: String(err?.message || err) });
  }
};
