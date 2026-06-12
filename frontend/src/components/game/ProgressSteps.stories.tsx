import type { Meta, StoryObj } from '@storybook/react-vite';

import { ProgressSteps } from './ProgressSteps';

const meta = {
  title: 'Game/ProgressSteps',
  component: ProgressSteps,
} satisfies Meta<typeof ProgressSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VoteActive: Story = {
  args: { steps: ['Vote', 'Assassinate'], active: 0 },
};

export const SpecialActive: Story = {
  args: { steps: ['Vote', 'Protect'], active: 1 },
};
