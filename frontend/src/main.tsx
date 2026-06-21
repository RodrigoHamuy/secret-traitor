import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Self-hosted fonts so they render offline. Latin subset + weights in use only.
import '@fontsource/cinzel/latin-500.css';
import '@fontsource/cinzel/latin-600.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-400-italic.css';

import './styles/global.css';
import { App } from './App';

function Chamber() {
  return (
    <div className="flex justify-center bg-[#070504]">
      <div className="relative flex min-h-dvh w-full max-w-[400px] flex-col overflow-hidden border-x border-[#3a2c17] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(201,162,74,.16),transparent_60%),linear-gradient(180deg,var(--color-chamber-from),var(--color-chamber-to))] font-body text-parchment">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 animate-flicker bg-[radial-gradient(60%_45%_at_50%_8%,rgba(232,200,115,.12),transparent_70%)]"
        />
        <div className="relative z-[1] flex min-h-0 flex-1 flex-col">
          <App />
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Chamber />
  </StrictMode>,
);
