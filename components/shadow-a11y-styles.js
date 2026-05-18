/** Shared shadow DOM focus + target-size styles for VelinStyle web components. */
export const SHADOW_A11Y_STYLES = `
  :host { display: block; }
  button, [role="button"] {
    min-inline-size: 2.75rem;
    min-block-size: 2.75rem;
    cursor: pointer;
  }
  button:focus-visible, [role="button"]:focus-visible {
    outline: 3px solid var(--velin-color-focus, #2563eb);
    outline-offset: 2px;
  }
  @media (forced-colors: active) {
    button, [role="button"] {
      border: 1px solid ButtonText;
    }
  }
`;
