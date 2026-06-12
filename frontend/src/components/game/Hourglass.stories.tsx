import type { Meta, StoryObj } from '@storybook/react-vite';

import { Hourglass } from './Hourglass';

const meta = {
  title: 'Game/Hourglass',
  component: Hourglass,
} satisfies Meta<typeof Hourglass>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { durationSeconds: 60 },
};

export const ShortDuration: Story = {
  args: { durationSeconds: 5 },
};
