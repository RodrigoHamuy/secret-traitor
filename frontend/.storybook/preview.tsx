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

function LevaStory({ children }: { children: ReactNode }) {
  const store = useCreateStore();
  return (
    <LevaStoreProvider store={store}>
      <LevaPanel store={store} />
      <div className="flex h-screen flex-col overflow-hidden bg-[#070504] font-body text-parchment">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
          {children}
        </div>
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
