/**
 * Prop mapping between React and VelinStyle custom elements.
 *
 * React 18 renders every unknown prop as a string attribute, which breaks two
 * things for custom elements: `false` becomes the attribute `"false"` (still
 * truthy to `hasAttribute`), and objects/arrays are stringified. Both are
 * handled imperatively here so the wrappers behave the same on React 18 and 19.
 */

/** Custom-event props use the `onVelin…` prefix; plain React events pass through. */
const VELIN_EVENT_RE = /^onVelin[A-Z]/;

/** @param {string} name */
export function isVelinEventProp(name) {
  return VELIN_EVENT_RE.test(name);
}

/**
 * `onVelinSearchSelect` → `velin-search-select`
 * @param {string} propName
 */
export function velinEventName(propName) {
  return propName
    .slice(2)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Split React props into the buckets each target can handle.
 * @param {Record<string, unknown>} props
 */
export function splitProps(props) {
  /** @type {Record<string, string | number>} */
  const attributes = {};
  /** @type {Record<string, unknown>} */
  const properties = {};
  /** @type {Record<string, boolean>} */
  const booleans = {};
  /** @type {Record<string, EventListener>} */
  const listeners = {};
  /** @type {Record<string, unknown>} */
  const reactProps = {};

  let children;
  let className;
  let style;

  for (const [key, value] of Object.entries(props)) {
    if (key === 'children') {
      children = value;
    } else if (key === 'className') {
      className = /** @type {string} */ (value);
    } else if (key === 'style') {
      style = value;
    } else if (isVelinEventProp(key)) {
      if (typeof value === 'function') listeners[velinEventName(key)] = /** @type {EventListener} */ (value);
    } else if (/^on[A-Z]/.test(key)) {
      reactProps[key] = value;
    } else if (value === null || value === undefined) {
      // Omitted entirely so the attribute is absent rather than "null".
    } else if (typeof value === 'boolean') {
      booleans[key] = value;
    } else if (typeof value === 'object' || typeof value === 'function') {
      properties[key] = value;
    } else {
      attributes[key] = /** @type {string | number} */ (value);
    }
  }

  return { children, className, style, attributes, properties, booleans, listeners, reactProps };
}

/**
 * Apply the buckets React cannot express directly onto the element.
 * @param {Element} el
 * @param {{ properties?: Record<string, unknown>, booleans?: Record<string, boolean> }} parts
 */
export function applyVelinProps(el, { properties = {}, booleans = {} } = {}) {
  for (const [key, value] of Object.entries(properties)) {
    el[key] = value;
  }
  for (const [key, value] of Object.entries(booleans)) {
    if (value) el.setAttribute(key, '');
    else el.removeAttribute(key);
  }
}

/**
 * Attach custom-event listeners and return a cleanup function.
 * @param {Element} el
 * @param {Record<string, EventListener>} listeners
 */
export function bindVelinListeners(el, listeners) {
  const entries = Object.entries(listeners);
  for (const [name, handler] of entries) el.addEventListener(name, handler);
  return () => {
    for (const [name, handler] of entries) el.removeEventListener(name, handler);
  };
}

/**
 * `velin-code-block` → `VelinCodeBlock`
 * @param {string} tag
 */
export function componentNameForTag(tag) {
  return tag
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}
