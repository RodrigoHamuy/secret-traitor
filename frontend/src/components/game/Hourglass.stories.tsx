import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { Hourglass } from './Hourglass';

export default { title: 'Game/Hourglass' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { durationSeconds } = useControls(
      { durationSeconds: { value: 60, min: 1, max: 120, step: 1 } },
      { store },
    );
    // key restarts the drain animation when the duration changes.
    return <Hourglass key={durationSeconds} durationSeconds={durationSeconds} />;
  },
};
