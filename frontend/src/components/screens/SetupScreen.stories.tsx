import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';

import { SetupScreen } from './SetupScreen';
import { withPhone } from '../../storybook/decorators';

export default { title: 'Screens/SetupScreen', decorators: [withPhone] };

// A fully interactive form — every field is driven by the screen's own controls
// (stepper, checkboxes, token input), so there's nothing extra to drive via leva.
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
