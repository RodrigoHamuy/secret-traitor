import type { Meta, StoryObj } from '@storybook/react-vite';

import { Pill } from './Pill';

const meta = {
  title: 'Primitives/Pill',
  component: Pill,
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: '6 still alive' },
};
