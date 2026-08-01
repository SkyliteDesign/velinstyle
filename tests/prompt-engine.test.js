import { describe, it, expect } from 'vitest';
import { analyzePrompt, buildPlan, planFromPrompt } from '../cli/prompt-engine.js';
import { scaffoldFromPrompt } from '../cli/scaffold.js';
import { reviewHtml } from '../cli/review.js';

describe('prompt-engine', () => {
  it('maps Steuerberater prompt to lawyer page', () => {
    const analysis = analyzePrompt('Steuerberater Landingpage mit Leistungen und Kontaktformular');
    expect(analysis.pageId).toBe('lawyer');
    expect(analysis.confidence).toBe('high');
  });

  it('builds a section plan before HTML', () => {
    const prompt = 'Steuerberater Landingpage mit Leistungen, FAQ und Kontaktformular';
    const analysis = analyzePrompt(prompt);
    const plan = buildPlan(analysis, prompt);
    const ids = plan.sections.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(['hero', 'services', 'faq', 'contact', 'footer']));
    expect(plan.designConstraints.length).toBeGreaterThan(0);
  });

  it('renders HTML from plan with form summary', () => {
    const r = planFromPrompt('Steuerberater Landingpage mit Kontaktformular und FAQ');
    expect(r.ok).toBe(true);
    expect(r.html).toMatch(/<h1[\s>]/i);
    expect(r.html).toMatch(/velin-form-summary/i);
    expect(r.html).toMatch(/velin-accordion|details/i);
  });

  it('scaffold uses plan mode for Steuerberater', () => {
    const r = scaffoldFromPrompt('Steuerberater Landingpage mit Kontaktformular');
    expect(r.ok).toBe(true);
    expect(r.mode).toBe('plan');
    expect(r.plan).toBeDefined();
    expect(r.review).toBeDefined();
    expect(r.blueprints.length).toBeGreaterThan(4);
  });
});

describe('review-engine', () => {
  it('passes a planned Steuerberater page', () => {
    const r = planFromPrompt('Steuerberater Landingpage mit Leistungen, Testimonials, FAQ und Kontaktformular');
    const report = reviewHtml(r.html, { plan: r.plan, prompt: 'Steuerberater Landingpage mit Kontaktformular' });
    expect(report.scores.design).toBeGreaterThan(0);
    expect(report.gate).not.toBe('fail');
  });

  it('fails missing H1', () => {
    const report = reviewHtml('<html><body><h2>Nope</h2></body></html>');
    expect(report.issues.some((i) => i.code === 'a11y.missing-h1')).toBe(true);
    expect(report.gate).toBe('fail');
  });
});
