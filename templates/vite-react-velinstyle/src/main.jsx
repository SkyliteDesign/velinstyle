import React from 'react';
import { createRoot } from 'react-dom/client';
import { VelinThemeToggle, VelinSheet } from '@velinstyle/react';
import 'velinstyle/dist/velinstyle.min.css';
import 'velinstyle/dist/velinstyle-components.min.js';
import './main.css';

function App() {
  return (
    <main className="velin-container velin-p-8">
      <header className="velin-flex velin-justify-between velin-items-center velin-mbe-8">
        <h1 className="velin-text-2xl velin-font-bold">VelinStyle + React</h1>
        <VelinThemeToggle />
      </header>
      <p className="velin-text-muted velin-mbe-4">
        Web Components are thin React wrappers; styles come from the VelinStyle CSS bundle.
      </p>
      <VelinSheet id="demo-sheet" label="Demo sheet">
        <p className="velin-p-4">Sheet content from a React child.</p>
      </VelinSheet>
      <button
        type="button"
        className="velin-btn velin-btn--primary"
        onClick={() => document.getElementById('demo-sheet')?.open?.()}
      >
        Open sheet
      </button>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
