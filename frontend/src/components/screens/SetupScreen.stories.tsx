import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';

import { SetupScreen } from './SetupScreen';

export default { title: 'Screens/SetupScreen' };

// Fully interactive form — fields are driven by the screen's own controls, no leva.
export const Playground: StoryObj = {
  render: () => {
    const [count, setCount] = useState(6);
    const [suspense, setSuspense] = useState(true);
    const [selfie, setSelfie] = useState(false);
    const [token, setToken] = useState('');
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
  },
};
