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
      <div className="flex h-dvh bg-[#070504]">
        <div className="relative mx-auto flex w-full max-w-[400px] flex-col overflow-hidden rounded-[26px] border border-[#3a2c17] bg-[radial-gradient(120%_80%_at_50%_-10%,rgba(201,162,74,.16),transparent_60%),linear-gradient(180deg,var(--color-chamber-from),var(--color-chamber-to))] font-body text-parchment shadow-phone">
          <div aria-hidden className="pointer-events-none absolute inset-0 z-0 animate-flicker bg-[radial-gradient(60%_45%_at_50%_8%,rgba(232,200,115,.12),transparent_70%)]" />
          <div className="relative z-[1] flex min-h-0 flex-1 flex-col items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </LevaStoreProvider>
  );
}

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
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
