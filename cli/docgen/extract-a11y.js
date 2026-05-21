import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { banner, heading, table } from './markdown.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..', '..');

/** @type {{ id: string, level: string, name: string, owner: string, status: string, testId: string }[]} */
export const WCAG_AAA_CRITERIA = [
  { id: '1.3.1', level: 'A', name: 'Info and Relationships', owner: 'Author + CSS', status: 'partial', testId: 'scan-a11y' },
  { id: '1.4.3', level: 'AA', name: 'Contrast (Minimum)', owner: 'Tokens', status: 'pass', testId: 'test:contrast' },
  { id: '1.4.6', level: 'AAA', name: 'Contrast (Enhanced)', owner: 'Tokens', status: 'pass', testId: 'test:contrast' },
  { id: '1.4.11', level: 'AA', name: 'Non-text Contrast', owner: 'Tokens + WC', status: 'partial', testId: 'test:a11y' },
  { id: '2.1.1', level: 'A', name: 'Keyboard', owner: 'Web Components', status: 'partial', testId: 'test:a11y' },
  { id: '2.3.3', level: 'AAA', name: 'Animation from Interactions', owner: 'CSS + Motion', status: 'pass', testId: 'reduced-motion' },
  { id: '2.4.1', level: 'A', name: 'Bypass Blocks', owner: 'CSS skip-link', status: 'pass', testId: 'scan-a11y' },
  { id: '2.4.7', level: 'AA', name: 'Focus Visible', owner: 'CSS focus', status: 'pass', testId: 'test:a11y' },
  { id: '2.4.11', level: 'AA', name: 'Focus Not Obscured (Minimum)', owner: 'CSS', status: 'pass', testId: 'focus-not-obscured' },
  { id: '2.4.13', level: 'AAA', name: 'Focus Appearance', owner: 'CSS', status: 'pass', testId: 'focus-appearance' },
  { id: '2.5.7', level: 'AA', name: 'Dragging Movements', owner: 'CSS + Sample', status: 'pass', testId: 'wcag22-dragging' },
  { id: '2.5.8', level: 'AA', name: 'Target Size', owner: 'CSS + WC', status: 'pass', testId: 'target-size' },
  { id: '3.2.6', level: 'A', name: 'Consistent Help', owner: 'CSS', status: 'pass', testId: 'consistent-help' },
  { id: '3.3.2', level: 'A', name: 'Labels or Instructions', owner: 'Forms + WC', status: 'partial', testId: 'scan-a11y' },
  { id: '3.3.7', level: 'A', name: 'Redundant Entry', owner: 'velin-persist + Author', status: 'partial', testId: 'velin-persist' },
  { id: '3.3.8', level: 'AA', name: 'Accessible Authentication', owner: 'CSS + Sample', status: 'pass', testId: 'wcag22-auth' },
  { id: '4.1.2', level: 'A', name: 'Name, Role, Value', owner: 'Web Components', status: 'partial', testId: 'contracts' },
  { id: '4.1.3', level: 'AA', name: 'Status Messages', owner: 'Announcer + WC', status: 'pass', testId: 'live-regions' },
];

export function loadComponentContracts(pkgRoot = PKG_ROOT) {
  const path = join(pkgRoot, 'core', 'a11y', 'component-contracts.json');
  if (!existsSync(path)) return { wcagLevel: 'AAA', components: {} };
  return JSON.parse(readFileSync(path, 'utf-8'));
}

export function renderWcagAaaMatrix(contracts) {
  let md = banner('core/a11y + src/a11y');
  md += heading(1, 'WCAG 2.2 AAA framework matrix');
  md += '\n> **Using VelinStyle does not certify your application.** This matrix tracks what the **framework** provides by default.\n\n';
  md += `Framework target: **WCAG 2.2 Level ${contracts.wcagLevel || 'AAA'}** (token defaults + component contracts).\n\n`;

  md += heading(2, 'Success criteria');
  md += table(
    ['Criterion', 'Level', 'Name', 'Owner', 'Status', 'Test'],
    WCAG_AAA_CRITERIA.map((c) => [
      c.id,
      c.level,
      c.name,
      c.owner,
      c.status,
      `\`${c.testId}\``,
    ]),
  );

  const comps = contracts.components || {};
  const rows = Object.entries(comps).sort(([a], [b]) => a.localeCompare(b));
  md += heading(2, 'Web component contracts');
  md += table(
    ['Element', 'Status', 'Keyboard', 'Live region', 'Required attrs'],
    rows.map(([tag, c]) => [
      `\`<${tag}>\``,
      c.status || '—',
      c.keyboard || '—',
      c.liveRegion || '—',
      (c.requiredAttributes || []).map((a) => `\`${a}\``).join(', ') || '—',
    ]),
  );

  md += '\nRun `npm run test:a11y:coverage` for coverage score.\n';
  return md;
}

export function renderComponentA11ySection(tag, contracts) {
  const c = contracts.components?.[tag];
  if (!c) return '';
  let md = heading(2, 'Accessibility');
  md += `WCAG contract status: **${c.status}** (framework target: ${contracts.wcagLevel}).\n\n`;
  if (c.roles?.length) md += `- **Roles:** ${c.roles.map((r) => `\`${r}\``).join(', ')}\n`;
  if (c.keyboard) md += `- **Keyboard:** ${c.keyboard}\n`;
  if (c.liveRegion) md += `- **Live region:** \`${c.liveRegion}\`\n`;
  if (c.reducedMotion) md += `- **Reduced motion:** honored\n`;
  if (c.requiredAttributes?.length) {
    md += `- **Required attributes:** ${c.requiredAttributes.map((a) => `\`${a}\``).join(', ')}\n`;
  }
  if (c.notes) md += `- **Notes:** ${c.notes}\n`;
  md += '\n';
  return md;
}
