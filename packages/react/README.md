# @velinstyle/react

Official React wrappers around the VelinStyle custom elements. Every canonical
`velin-*` element has a wrapper — the list is generated from the framework's
component registry, so the adapter cannot fall behind the elements that ship.

There is no re-implementation: each wrapper renders the real custom element and
forwards refs to it, so accessibility behaviour, keyboard handling and styling
are identical to the plain HTML usage.

```jsx
import { useRef } from 'react';
import { VelinDialog, VelinThemeToggle } from '@velinstyle/react';
import '@birdapi/velinstyle/css';
import '@birdapi/velinstyle/bundle';

export function App() {
  const dialogRef = useRef(null);
  return (
    <>
      <VelinThemeToggle target="html" />
      <VelinDialog ref={dialogRef} />
      <button type="button" onClick={() => dialogRef.current?.confirm('Continue?')}>
        Open dialog
      </button>
    </>
  );
}
```

## How props are mapped

React 18 renders unknown props as string attributes, which turns `open={false}`
into `open="false"` and stringifies objects. The wrappers avoid both:

| Prop value | Applied as |
| --- | --- |
| string, number | attribute |
| boolean | presence attribute (`open` set or removed) |
| object, array, function | element property |
| `onVelin*` function | `addEventListener` for the matching custom event |
| `null` / `undefined` | omitted |
| `onClick` and other React events | passed to React unchanged |

Custom event names are derived from the prop name: `onVelinSearchSelect` binds
`velin-search-select`.

```jsx
<VelinSearch
  entries={entries}                    // element property, not stringified
  open={isOpen}                        // presence attribute
  onVelinSearchSelect={handleSelect}   // custom event listener
  onClick={handleClick}                // regular React handler
/>
```

## Wrapping additional elements

`createVelinComponent` builds a wrapper for any tag, which is useful for custom
elements built on top of VelinStyle:

```jsx
import { createVelinComponent } from '@velinstyle/react';

const MyWidget = createVelinComponent('my-widget');
```

## Build

From the repository root:

```bash
npm run build:react
```

That regenerates the wrappers from the component registry and bundles the
package. `react >= 18` is a peer dependency. Framework CI fails if the generated
wrappers are out of date, which keeps new components from shipping without one.
