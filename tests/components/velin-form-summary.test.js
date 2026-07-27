import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

/** jsdom implements `form.elements` named access but not the `form.name` shorthand. */
function field(form, name) {
  return form.elements.namedItem(name);
}

/** Builds a summary plus form and waits for the deferred binding. */
async function buildForm({ summaryAttrs = {}, nested = false } = {}) {
  const wrapper = document.createElement('div');
  const summary = document.createElement('velin-form-summary');
  for (const [name, value] of Object.entries(summaryAttrs)) summary.setAttribute(name, value);

  const formHtml = `
    <form id="signup">
      <label for="email">Email address</label>
      <input id="email" name="email" type="email" required class="velin-input">

      <label for="name">Full name</label>
      <input id="name" name="name" required class="velin-input" data-error-message="Enter your full name">

      <label for="colour">Colour</label>
      <select id="colour" name="colour" required class="velin-select">
        <option value="">Chooseâ€¦</option>
        <option value="red">Red</option>
      </select>

      <button type="submit">Send</button>
    </form>`;

  if (nested) {
    wrapper.innerHTML = formHtml;
    wrapper.querySelector('form').prepend(summary);
  } else {
    summary.setAttribute('for', 'signup');
    wrapper.appendChild(summary);
    wrapper.insertAdjacentHTML('beforeend', formHtml);
  }

  document.body.appendChild(wrapper);
  await nextFrame();
  return { summary, form: wrapper.querySelector('form') };
}

function submit(form) {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

beforeAll(async () => {
  await import('../../components/velin-form-summary.js');
  await import('../../components/velin-announcer.js');
});

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('velin-form-summary setup', () => {
  it('registers as a custom element', () => {
    expect(customElements.get('velin-form-summary')).toBeDefined();
  });

  it('binds the form referenced by the for attribute', async () => {
    const { summary, form } = await buildForm();
    expect(summary.form).toBe(form);
  });

  it('binds the closest form when nested', async () => {
    const { summary, form } = await buildForm({ nested: true });
    expect(summary.form).toBe(form);
  });

  it('takes over native validation bubbles', async () => {
    const { form } = await buildForm();
    expect(form.noValidate).toBe(true);
  });

  it('keeps native validation when opted out', async () => {
    const { form } = await buildForm({ summaryAttrs: { 'native-validation': '' } });
    expect(form.noValidate).toBe(false);
  });

  it('stays empty until validation runs', async () => {
    const { summary } = await buildForm();
    expect(summary.querySelector('.velin-form-summary__panel')).toBeNull();
    expect(summary.errors).toEqual([]);
  });
});

describe('velin-form-summary validation', () => {
  it('blocks submit and lists every invalid field', async () => {
    const { summary, form } = await buildForm();
    submit(form);

    expect(summary.errors).toHaveLength(3);
    const items = [...summary.querySelectorAll('.velin-form-summary__list a')];
    expect(items).toHaveLength(3);
    expect(items[0].textContent).toContain('Email address');
  });

  it('cancels the submit event when invalid', async () => {
    const { form } = await buildForm();
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('allows submit when every field is valid', async () => {
    const { summary, form } = await buildForm();
    field(form, 'email').value = 'user@example.com';
    field(form, 'name').value = 'Ada Lovelace';
    field(form, 'colour').value = 'red';

    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(summary.errors).toEqual([]);
  });

  it('renders the summary as a focusable alert', async () => {
    const { summary, form } = await buildForm({ summaryAttrs: { heading: 'Fix these fields' } });
    submit(form);

    const panel = summary.querySelector('.velin-form-summary__panel');
    expect(panel.getAttribute('role')).toBe('alert');
    expect(panel.tabIndex).toBe(-1);
    expect(panel.querySelector('.velin-form-summary__heading').textContent).toBe('Fix these fields');
    expect(document.activeElement).toBe(panel);
  });

  it('uses a default heading', async () => {
    const { summary, form } = await buildForm();
    submit(form);
    expect(summary.querySelector('.velin-form-summary__heading').textContent).toBe('There is a problem');
  });

  it('marks invalid fields with aria-invalid', async () => {
    const { form } = await buildForm();
    submit(form);
    expect(field(form, 'email').getAttribute('aria-invalid')).toBe('true');
  });

  it('wires aria-describedby to a generated message', async () => {
    const { form } = await buildForm();
    submit(form);

    const describedBy = field(form, 'email').getAttribute('aria-describedby');
    expect(describedBy).toBe('email-error');
    const message = document.getElementById('email-error');
    expect(message.classList.contains('velin-field-error')).toBe(true);
    expect(message.textContent.length).toBeGreaterThan(0);
  });

  it('preserves an existing aria-describedby hint', async () => {
    const { form } = await buildForm();
    field(form, 'email').setAttribute('aria-describedby', 'email-hint');
    submit(form);
    expect(field(form, 'email').getAttribute('aria-describedby')).toBe('email-hint email-error');
  });

  it('prefers data-error-message over the browser message', async () => {
    const { form } = await buildForm();
    submit(form);
    expect(document.getElementById('name-error').textContent).toBe('Enter your full name');
  });

  it('reuses an author-provided error container', async () => {
    const { form } = await buildForm();
    const holder = document.createElement('span');
    holder.dataset.velinErrorFor = 'email';
    form.appendChild(holder);
    submit(form);

    expect(holder.id).toBe('email-error');
    expect(holder.textContent.length).toBeGreaterThan(0);
  });

  it('skips disabled and opted-out fields', async () => {
    const { summary, form } = await buildForm();
    field(form, 'email').disabled = true;
    field(form, 'name').setAttribute('data-error-ignore', '');
    submit(form);
    expect(summary.errors).toHaveLength(1);
  });

  it('lists a radio group once', async () => {
    const { summary, form } = await buildForm();
    form.insertAdjacentHTML('afterbegin', `
      <input type="radio" id="plan-a" name="plan" value="a" required aria-label="Plan A">
      <input type="radio" id="plan-b" name="plan" value="b" required aria-label="Plan B">`);
    submit(form);
    const planErrors = summary.errors.filter((error) => error.field.name === 'plan');
    expect(planErrors).toHaveLength(1);
  });

  it('emits velin-form-invalid with the error list', async () => {
    const { summary, form } = await buildForm();
    const events = [];
    summary.addEventListener('velin-form-invalid', (e) => events.push(e.detail));
    submit(form);
    expect(events).toHaveLength(1);
    expect(events[0].errors).toHaveLength(3);
    expect(events[0].errors[0]).toHaveProperty('label', 'Email address');
  });
});

describe('velin-form-summary recovery', () => {
  it('clears a field error once the field becomes valid', async () => {
    const { summary, form } = await buildForm();
    submit(form);
    expect(summary.errors).toHaveLength(3);

    field(form, 'email').value = 'user@example.com';
    field(form, 'email').dispatchEvent(new Event('input', { bubbles: true }));

    expect(summary.errors).toHaveLength(2);
    expect(field(form, 'email').hasAttribute('aria-invalid')).toBe(false);
    expect(field(form, 'email').hasAttribute('aria-describedby')).toBe(false);
    expect(document.getElementById('email-error')).toBeNull();
  });

  it('does not flag fields before the first submit', async () => {
    const { summary, form } = await buildForm();
    field(form, 'email').value = 'nope';
    field(form, 'email').dispatchEvent(new Event('input', { bubbles: true }));
    expect(summary.errors).toEqual([]);
    expect(field(form, 'email').hasAttribute('aria-invalid')).toBe(false);
  });

  it('removes the summary once all fields are valid', async () => {
    const { summary, form } = await buildForm();
    submit(form);

    const valid = [
      ['email', 'user@example.com'],
      ['name', 'Ada Lovelace'],
      ['colour', 'red'],
    ];
    for (const [fieldName, value] of valid) {
      field(form, fieldName).value = value;
      field(form, fieldName).dispatchEvent(new Event('input', { bubbles: true }));
    }

    expect(summary.errors).toEqual([]);
    expect(summary.querySelector('.velin-form-summary__panel')).toBeNull();
    expect(summary.hidden).toBe(true);
  });

  it('emits velin-form-valid when the last error clears', async () => {
    const { summary, form } = await buildForm();
    submit(form);
    const events = [];
    summary.addEventListener('velin-form-valid', () => events.push(true));

    field(form, 'email').value = 'user@example.com';
    field(form, 'email').dispatchEvent(new Event('input', { bubbles: true }));
    expect(events).toHaveLength(0);

    field(form, 'name').value = 'Ada';
    field(form, 'name').dispatchEvent(new Event('input', { bubbles: true }));
    field(form, 'colour').value = 'red';
    field(form, 'colour').dispatchEvent(new Event('change', { bubbles: true }));
    expect(events).toHaveLength(1);
  });

  it('moves focus to the field when a summary link is clicked', async () => {
    const { summary, form } = await buildForm();
    submit(form);
    summary.querySelector('.velin-form-summary__list a').click();
    expect(document.activeElement).toBe(field(form, 'email'));
  });

  it('emits velin-form-error-focus on link activation', async () => {
    const { summary, form } = await buildForm();
    submit(form);
    const events = [];
    summary.addEventListener('velin-form-error-focus', (e) => events.push(e.detail));
    summary.querySelector('.velin-form-summary__list a').click();
    expect(events).toEqual([{ name: 'email' }]);
  });

  it('focuses the first error via the public API', async () => {
    const { summary, form } = await buildForm();
    summary.validate();
    summary.focusFirstError();
    expect(document.activeElement).toBe(field(form, 'email'));
  });

  it('clears everything on demand', async () => {
    const { summary, form } = await buildForm();
    submit(form);
    summary.clear();
    expect(summary.errors).toEqual([]);
    expect(field(form, 'email').hasAttribute('aria-invalid')).toBe(false);
    expect(summary.querySelector('.velin-form-summary__panel')).toBeNull();
  });

  it('clears state when the form is reset', async () => {
    const { summary, form } = await buildForm();
    submit(form);
    form.dispatchEvent(new Event('reset', { bubbles: true }));
    await nextFrame();
    expect(summary.errors).toEqual([]);
  });
});
