# @velinstyle/react

Experimental thin wrappers around VelinStyle custom elements.

```jsx
import { VelinDialog, VelinThemeToggle } from '@velinstyle/react';
import 'velinstyle/dist/velinstyle.css';
import 'velinstyle/dist/velinstyle-components.js';

export function App() {
  return (
    <>
      <VelinThemeToggle target="html" />
      <VelinDialog open>…</VelinDialog>
    </>
  );
}
```

Build this package from `packages/react` with `npm install && npm run build` (peer `react` required).
