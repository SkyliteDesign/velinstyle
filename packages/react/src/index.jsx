import * as React from 'react';

/** Pass-through to native <velin-dialog> — load velinstyle web components bundle once. */
export const VelinDialog = React.forwardRef(function VelinDialog(props, ref) {
  return React.createElement('velin-dialog', { ...props, ref }, props.children);
});

export const VelinThemeToggle = React.forwardRef(function VelinThemeToggle(props, ref) {
  return React.createElement('velin-theme-toggle', { ...props, ref });
});
