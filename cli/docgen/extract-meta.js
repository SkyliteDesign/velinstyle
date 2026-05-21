import { banner, heading, bulletList } from './markdown.js';
import { VELIN_META_MIME } from '../../core/meta/schema.js';

/**
 * @param {object} bundle
 */
export function renderMetaReadme(bundle) {
  let md = banner('velinstyle meta');
  md += heading(1, 'Velin-Meta (agent context)');
  md += '\n> **Do not edit manually.** Regenerate with `velinstyle meta` or `velinstyle docs generate --scope meta`.\n\n';
  md += heading(2, 'MIME and files');
  md += `\n- MIME: \`${VELIN_META_MIME}\`\n`;
  md += '- Bundle: `dist/velin-agent.json`\n';
  md += '- Index: `dist/llms.txt`\n\n';
  md += heading(2, 'CLI');
  md += '\n```bash\nnpx velinstyle meta\nnpx velinstyle meta --llms --base-url https://velinstyle.info\nnpx velinstyle meta page path/to/page.html\n```\n\n';
  md += heading(2, 'Page embedding');
  md += '\n```html\n<script type="' + VELIN_META_MIME + '" id="velin-meta">\n{\n  "version": "' + bundle.framework.version + '",\n  "page": { "intent": "component-doc" },\n  "allowed": { "classesPrefix": ["velin-"] }\n}\n</script>\n```\n\n';
  md += heading(2, 'Snapshot');
  md += `\n- Framework: ${bundle.framework.name}@${bundle.framework.version}\n`;
  md += `- Components: ${bundle.components.count}\n`;
  md += `- Attributes: ${bundle.attributes.count}\n`;
  md += `- CLI commands: ${bundle.cli.commands.length}\n`;
  md += `- Scanner rules: ${bundle.tooling.scannerRuleCount}\n`;
  if (bundle.searchIndex.entryCount != null) {
    md += `- Search index entries: ${bundle.searchIndex.entryCount}\n`;
  }
  md += '\n' + heading(2, 'Conventions');
  md += '\n' + bulletList(bundle.conventions);
  md += '\n';
  return md;
}
