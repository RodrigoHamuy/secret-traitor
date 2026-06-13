import type { Preview } from '@storybook/react-vite';

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

const preview: Preview = {
  decorators: [
    // Replicates the static app's page <body>: dark backdrop, Garamond body
    // text in warm parchment, content centred at the top.
    (Story) => (
      <div className="flex min-h-screen w-full flex-col items-center bg-[#070504] p-6 font-body text-parchment">
        <Story />
      </div>
    ),
  ],
};

export default preview;
