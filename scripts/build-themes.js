import { execSync } from 'child_process';
import { mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const themesDir = join(ROOT, 'src', 'themes');
const themes = readdirSync(themesDir)
  .filter(f => f.endsWith('.css'))
  .map(f => f.replace('.css', ''));

mkdirSync(join(ROOT, 'dist', 'themes'), { recursive: true });

for (const theme of themes) {
  const input = join(themesDir, `${theme}.css`);
  const output = join(ROOT, 'dist', 'themes', `${theme}.min.css`);
  execSync(`npx lightningcss --bundle --minify "${input}" -o "${output}"`, { cwd: ROOT, stdio: 'inherit' });
  console.log(`Built theme: ${theme}`);
}
