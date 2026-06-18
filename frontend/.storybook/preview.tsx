import type { ReactNode } from 'react';

import type { Preview } from '@storybook/react-vite';
import { LevaPanel, LevaStoreProvider, useCreateStore } from 'leva';

// Self-hosted fonts so they render offline. Latin subset + weights in use only.
import '@fontsource/cinzel/latin-500.css';
import '@fontsource/cinzel/latin-600.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-400-italic.css';

import '../src/styles/global.css';

// Per-story leva store, created at the outermost decorator so the panel renders
// outside component decorators (FlipCard 3D transform, PhoneFrame clip) without
// a portal. Keyed on story id by the caller to reset per story. Stories read it
// back via useStoreContext() and pass it to useControls(schema, { store }) —
// useControls won't pick up the context store on its own.
function LevaStory({ children }: { children: ReactNode }) {
  const store = useCreateStore();
  return (
    <LevaStoreProvider store={store}>
      <LevaPanel store={store} />
      <div className="flex min-h-screen w-full flex-col items-center bg-[#070504] p-6 font-body text-parchment">
        {children}
      </div>
    </LevaStoreProvider>
  );
}

const preview: Preview = {
  decorators: [
    (Story, context) => (
      <LevaStory key={context.id}>
        <Story />
      </LevaStory>
    ),
  ],
};

export default preview;
