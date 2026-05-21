/**
 * PII / secrets detection for velinstyle scan (--only pii).
 */

const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const PLACEHOLDER_EMAILS = new Set([
  'user@example.com',
  'test@example.com',
  'admin@example.com',
  'email@example.com',
  'you@example.com',
  'name@example.com',
  '{{email}}',
  '{{EMAIL}}',
]);

const SECRET_PATTERNS = [
  { re: /\b(?:api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{8,}['"]/i, rule: 'pii/hardcoded-secret', msg: 'Possible API key in source.' },
  { re: /\b(?:secret|password|passwd|pwd)\s*[:=]\s*['"][^'"]{4,}['"]/i, rule: 'pii/hardcoded-secret', msg: 'Possible password/secret in source.' },
  { re: /\bAKIA[0-9A-Z]{16}\b/, rule: 'pii/hardcoded-secret', msg: 'AWS access key pattern detected.' },
  { re: /\bsk_(?:live|test)_[0-9a-zA-Z]{16,}\b/, rule: 'pii/hardcoded-secret', msg: 'Stripe secret key pattern detected.' },
  { re: /\bghp_[0-9a-zA-Z]{36,}\b/, rule: 'pii/hardcoded-secret', msg: 'GitHub token pattern detected.' },
];

export function isPlaceholderEmail(email) {
  const lower = email.toLowerCase();
  if (PLACEHOLDER_EMAILS.has(lower)) return true;
  if (/@example\.(com|org|net)$/i.test(email)) return true;
  if (/@test\.(com|local)$/i.test(email)) return true;
  if (/@localhost$/i.test(email)) return true;
  return false;
}

export function maskEmail(email, placeholder = 'user@example.com') {
  return placeholder;
}

export function fixHardcodedEmailLine(line, placeholder = 'user@example.com') {
  return line.replace(EMAIL_RE, (match) => {
    if (isPlaceholderEmail(match)) return match;
    return placeholder;
  });
}

export function scanPIIHTML(content, file, options = {}) {
  const issues = [];
  const lines = content.split('\n');
  const placeholder = options.fixEmailPlaceholder || 'user@example.com';

  lines.forEach((line, idx) => {
    const ln = idx + 1;
    if (/\/\/|\/\*|\*\/|<!--/.test(line) && !/@/.test(line.replace(/<!--.*-->/, ''))) {
      /* still scan — emails in comments are PII too */
    }

    const emails = [...line.matchAll(EMAIL_RE)].map((m) => m[0]);
    for (const email of emails) {
      if (isPlaceholderEmail(email)) continue;
      issues.push({
        file,
        line: ln,
        severity: 1,
        rule: 'pii/hardcoded-email',
        message: `Hardcoded email "${email}" found. Use env/config or <velin-email>.`,
        fixable: true,
        fix: (currentLine) => fixHardcodedEmailLine(currentLine, placeholder),
      });
    }

    const hasMailto = /mailto:/i.test(line);
    const emailRe = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
    if (hasMailto && emailRe.test(line)) {
      issues.push({
        file,
        line: ln,
        severity: 2,
        rule: 'pii/mailto-in-source',
        message: 'mailto: link exposes email in HTML. Consider <velin-email> for obfuscation.',
        fixable: false,
      });
    }
  });

  return issues;
}

export function scanPIIJS(content, file) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const ln = idx + 1;

    for (const { re, rule, msg } of SECRET_PATTERNS) {
      if (re.test(line)) {
        issues.push({
          file,
          line: ln,
          severity: 0,
          rule,
          message: msg,
          fixable: false,
        });
      }
    }

    const emails = [...line.matchAll(EMAIL_RE)].map((m) => m[0]);
    for (const email of emails) {
      if (isPlaceholderEmail(email)) continue;
      issues.push({
        file,
        line: ln,
        severity: 1,
        rule: 'pii/hardcoded-email',
        message: `Hardcoded email "${email}" in JavaScript.`,
        fixable: true,
        fix: (currentLine) => fixHardcodedEmailLine(currentLine),
      });
    }

    if (/localStorage\.setItem\s*\([^)]*@/.test(line) || /sessionStorage\.setItem\s*\([^)]*@/.test(line)) {
      issues.push({
        file,
        line: ln,
        severity: 1,
        rule: 'pii/localstorage-pii',
        message: 'Storing email-like data in Web Storage may violate privacy policies.',
        fixable: false,
      });
    }
  });

  return issues;
}
