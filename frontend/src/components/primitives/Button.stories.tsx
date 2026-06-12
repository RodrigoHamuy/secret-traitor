import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from './Button';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  decorators: [withAppWidth],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: 'Deal roles' },
};

export const Secondary: Story = {
  args: { children: 'Skip — use initials', variant: 'secondary' },
};

export const Ghost: Story = {
  args: { children: 'Back', variant: 'ghost' },
};

export const Disabled: Story = {
  args: { children: 'Continue', disabled: true },
};

export const WithEmoji: Story = {
  args: { children: 'Cast vote', emoji: '🗳️' },
};

export const TargetPulse: Story = {
  args: { children: 'Create Game', target: true },
};
