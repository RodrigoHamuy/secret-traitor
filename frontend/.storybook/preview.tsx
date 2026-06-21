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

function StoryCanvas({ children }: { children: ReactNode }) {
  const store = useCreateStore();
  return (
    <LevaStoreProvider store={store}>
      <LevaPanel store={store} />
      <div className="flex h-dvh flex-col items-center justify-center bg-[#070504] font-body text-parchment">
        {children}
      </div>
    </LevaStoreProvider>
  );
}

const preview: Preview = {
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story, context) => (
      <StoryCanvas key={context.id}>
        <Story />
      </StoryCanvas>
    ),
  ],
};

export default preview;
