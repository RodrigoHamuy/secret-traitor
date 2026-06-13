import type { StoryObj } from '@storybook/react-vite';

import { Divider } from './Divider';
import { withAppWidth } from '../../storybook/decorators';

// Divider takes no props — nothing to drive from leva.
export default { title: 'Primitives/Divider', decorators: [withAppWidth] };

export const Default: StoryObj = {
  render: () => <Divider />,
};
