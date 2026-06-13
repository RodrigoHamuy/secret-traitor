import type { Meta, StoryObj } from '@storybook/react-vite';

import { Divider } from './Divider';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/Divider',
  component: Divider,
  decorators: [withAppWidth],
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
