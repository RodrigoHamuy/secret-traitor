import type { ReactNode } from 'react';

import type { Preview } from '@storybook/react-vite';
import { LevaPanel, LevaStoreProvider, useCreateStore } from 'leva';

// Self-hosted fonts (via @fontsource) so they render offline instead of
// falling back to system serifs. Only the latin subset + weights in use.
import '@fontsource/cinzel/latin-500.css';
import '@fontsource/cinzel/latin-600.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-400-italic.css';

import '../src/styles/global.css';

/**
 * Per-story leva wiring. Stories drive props from a leva panel instead of
 * Storybook args (this project is Controls-addon-free). The store is created at
 * the outermost decorator level so the panel renders outside every component
 * decorator (FlipCard 3D transform, PhoneFrame clip) without a portal.
 *
 * `useCreateStore()` only resets on remount, so the consumer keys this wrapper
 * on the story id to force a fresh store per story (otherwise values leak
 * across navigation).
 *
 * Stories read the store back via `useStoreContext()` and pass it to
 * `useControls(schema, { store })` — `useControls` won't pick up the context
 * store on its own.
 */
function LevaStory({ children }: { children: ReactNode }) {
  const store = useCreateStore();
  return (
    <LevaStoreProvider store={store}>
      <LevaPanel store={store} />
      {/* Replicates the static app's page <body> */}
      <div className="flex min-h-screen w-full flex-col items-center bg-[#070504] p-6 font-body text-parchment">
        {children}
      </div>
    </LevaStoreProvider>
  );
}

const preview: Preview = {
  decorators: [
    // key={context.id} remounts the wrapper per story for a fresh store.
    (Story, context) => (
      <LevaStory key={context.id}>
        <Story />
      </LevaStory>
    ),
  ],
};

export default preview;
