import type { Meta, StoryObj } from '@storybook/react-vite';

import { TimerDisplay } from './TimerDisplay';

const meta = {
  title: 'Game/TimerDisplay',
  component: TimerDisplay,
} satisfies Meta<typeof TimerDisplay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Counting: Story = {
  args: { label: '0:42' },
};

export const TimeUp: Story = {
  args: { label: "Time's up", up: true },
};
