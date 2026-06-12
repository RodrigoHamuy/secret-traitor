import type { Meta, StoryObj } from '@storybook/react-vite';

import { StepButton } from './StepButton';

const meta = {
  title: 'Primitives/StepButton',
  component: StepButton,
} satisfies Meta<typeof StepButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { children: '+' },
};

export const Disabled: Story = {
  args: { children: '−', disabled: true },
};
