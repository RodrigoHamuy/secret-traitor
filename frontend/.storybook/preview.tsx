import type { Preview } from '@storybook/react-vite';

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
