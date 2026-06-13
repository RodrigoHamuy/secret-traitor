import type { Decorator } from '@storybook/react-vite';

import { PhoneFrame } from '../components/layout/PhoneFrame';

/** Renders a story inside the phone frame at handset size — used by screen stories. */
export const withPhone: Decorator = (Story) => (
  <div className="h-[720px] w-[400px] max-w-full">
    <PhoneFrame>
      <Story />
    </PhoneFrame>
  </div>
);

/** Constrains a loose component story to the app's content width. */
export const withAppWidth: Decorator = (Story) => (
  <div className="w-[360px] max-w-full">
    <Story />
  </div>
);
