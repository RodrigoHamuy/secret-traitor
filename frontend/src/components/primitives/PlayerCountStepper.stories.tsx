import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { PlayerCountStepper } from './PlayerCountStepper';
import { withAppWidth } from '../../storybook/decorators';

const meta = {
  title: 'Primitives/PlayerCountStepper',
  component: PlayerCountStepper,
  decorators: [withAppWidth],
} satisfies Meta<typeof PlayerCountStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveStepper({ initial }: { initial: number }) {
  const [count, setCount] = useState(initial);
  return (
    <PlayerCountStepper
      count={count}
      onDecrement={() => setCount((c) => c - 1)}
      onIncrement={() => setCount((c) => c + 1)}
    />
  );
}

export const Default: Story = {
  args: { count: 6 },
  render: () => <InteractiveStepper initial={6} />,
};

export const AtMin: Story = {
  args: { count: 3 },
};

export const AtMax: Story = {
  args: { count: 12 },
};
