import type { StoryObj } from '@storybook/react-vite';

import { Divider } from './Divider';

// Divider takes no props — nothing to drive from leva.
export default { title: 'Primitives/Divider' };

export const Default: StoryObj = {
  render: () => <Divider />,
};
