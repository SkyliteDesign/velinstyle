import * as React from 'react';
import { splitProps, applyVelinProps, bindVelinListeners, componentNameForTag } from './apply-props.js';

/**
 * Build a React wrapper for a VelinStyle custom element.
 *
 * Scalar props become attributes, booleans become presence attributes, objects
 * and arrays are assigned as element properties, and `onVelin*` props are bound
 * as custom-event listeners.
 *
 * @param {string} tag
 */
export function createVelinComponent(tag) {
  const Component = React.forwardRef(function VelinComponent(props, forwardedRef) {
    const elementRef = React.useRef(null);
    const { children, className, style, attributes, properties, booleans, listeners, reactProps } = splitProps(props);

    const setRef = React.useCallback(
      (node) => {
        elementRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      },
      [forwardedRef],
    );

    React.useLayoutEffect(() => {
      if (elementRef.current) applyVelinProps(elementRef.current, { properties, booleans });
    });

    React.useLayoutEffect(() => {
      if (!elementRef.current) return undefined;
      return bindVelinListeners(elementRef.current, listeners);
    });

    return React.createElement(
      tag,
      { ref: setRef, className, style, ...attributes, ...reactProps },
      children,
    );
  });

  Component.displayName = componentNameForTag(tag);
  Component.tagName = tag;
  return Component;
}
