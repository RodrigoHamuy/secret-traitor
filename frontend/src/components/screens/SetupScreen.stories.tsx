import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import { SetupScreen } from './SetupScreen';
import { withPhone } from '../../storybook/decorators';

const meta = {
  title: 'Screens/SetupScreen',
  component: SetupScreen,
  decorators: [withPhone],
} satisfies Meta<typeof SetupScreen>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveSetup(initial: { count: number; suspense: boolean; selfie: boolean; token: string }) {
  const [count, setCount] = useState(initial.count);
  const [suspense, setSuspense] = useState(initial.suspense);
  const [selfie, setSelfie] = useState(initial.selfie);
  const [token, setToken] = useState(initial.token);
  return (
    <SetupScreen
      count={count}
      suspense={suspense}
      selfie={selfie}
      token={token}
      onDecrement={() => setCount((c) => c - 1)}
      onIncrement={() => setCount((c) => c + 1)}
      onSuspenseChange={setSuspense}
      onSelfieChange={setSelfie}
      onTokenChange={setToken}
    />
  );
}

export const SixPlayers: Story = {
  args: { count: 6, suspense: true, selfie: false, token: '' },
  render: (args) => <InteractiveSetup {...args} />,
};

export const FewPlayersWarning: Story = {
  args: { count: 4, suspense: true, selfie: false, token: '' },
  render: (args) => <InteractiveSetup {...args} />,
};

export const SelfieWithToken: Story = {
  args: { count: 6, suspense: true, selfie: true, token: 'r8_example_token' },
  render: (args) => <InteractiveSetup {...args} />,
};
