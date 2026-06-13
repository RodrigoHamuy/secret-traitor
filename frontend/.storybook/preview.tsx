import type { ReactNode } from 'react';

import type { Preview } from '@storybook/react-vite';
import { LevaPanel, LevaStoreProvider, useCreateStore } from 'leva';

// Self-hosted fonts (via @fontsource) so they render in offline/sandbox
// screenshots instead of falling back to system serifs. Only the latin
// subset and the weights the design system actually uses are pulled in:
// Cinzel 500/600/700 (display) and EB Garamond regular + italic (body).
import '@fontsource/cinzel/latin-500.css';
import '@fontsource/cinzel/latin-600.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-400-italic.css';

import '../src/styles/global.css';

/**
 * Per-story leva wiring, done once for every story.
 *
 * Each story drives its props from a leva panel rather than from hardcoded
 * Storybook args (this project is intentionally Controls-addon-free). The store
 * is created here — at the outermost decorator level — so the panel renders
 * outside every component decorator (e.g. the FlipCard 3D transform, the
 * PhoneFrame clip) without needing a portal.
 *
 * `useCreateStore()` is `useMemo(() => new Store(), [])`, so it only resets when
 * this component remounts. A global decorator would otherwise be reused across
 * story navigation and leak control values between stories, so the consumer
 * keys this wrapper on the story id (see `decorators` below) to force a fresh
 * store per story — satisfying "the leva data gets wiped out on unmount".
 *
 * Stories read this store back via leva's `useStoreContext()` and pass it to
 * `useControls(schema, { store })` — leva's `useControls` does not pick up the
 * context store on its own.
 */
function LevaStory({ children }: { children: ReactNode }) {
  const store = useCreateStore();
  return (
    <LevaStoreProvider store={store}>
      <div className="fixed top-3 right-3 z-50 w-70">
        <LevaPanel store={store} fill flat titleBar={{ drag: false }} />
      </div>
      {/* Replicates the static app's page <body>: dark backdrop, Garamond body
          text in warm parchment, content centred at the top. */}
      <div className="flex min-h-screen w-full flex-col items-center bg-[#070504] p-6 font-body text-parchment">
        {children}
      </div>
    </LevaStoreProvider>
  );
}

const preview: Preview = {
  decorators: [
    // key={context.id} remounts the wrapper on every story change, so
    // `useCreateStore` hands back a fresh, isolated store each time.
    (Story, context) => (
      <LevaStory key={context.id}>
        <Story />
      </LevaStory>
    ),
  ],
};

export default preview;
