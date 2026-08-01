/**
 * Static file server for local previews.
 */
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, resolve, extname, normalize } from 'path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.map': 'application/json',
};

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent((reqPath || '/').split('?')[0]);
  const cleaned = normalize(decoded).replace(/^(\.\.[/\\])+/, '');
  const full = resolve(root, '.' + (cleaned.startsWith('/') || cleaned.startsWith('\\') ? cleaned : `/${cleaned}`));
  if (!full.startsWith(resolve(root))) return null;
  return full;
}

/**
 * @param {{ dir?: string, port?: number, host?: string }} opts
 */
export function serveStatic(opts = {}) {
  const dir = resolve(opts.dir || '.');
  const port = Number(opts.port) || 4173;
  const host = opts.host || '127.0.0.1';

  if (!existsSync(dir) || !statSync(dir).isDirectory()) {
    return { ok: false, error: `Not a directory: ${dir}` };
  }

  const server = createServer((req, res) => {
    let filePath = safeJoin(dir, req.url || '/');
    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, 'index.html');
    }
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }
    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    try {
      const body = readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': type });
      res.end(body);
    } catch {
      res.writeHead(500);
      res.end('Read error');
    }
  });

  return new Promise((resolvePromise) => {
    server.listen(port, host, () => {
      resolvePromise({
        ok: true,
        server,
        url: `http://${host}:${port}/`,
        dir,
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}
