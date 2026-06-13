import { useState } from 'react';

import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { PlayerCountStepper } from './PlayerCountStepper';
import { withAppWidth } from '../../storybook/decorators';

export default { title: 'Primitives/PlayerCountStepper', decorators: [withAppWidth] };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { min, max } = useControls({ min: 3, max: 12 }, { store });
    // Count is click-driven via the +/− buttons; min/max bound the steppers.
    const [count, setCount] = useState(6);
    return (
      <PlayerCountStepper
        count={count}
        min={min}
        max={max}
        onDecrement={() => setCount((c) => c - 1)}
        onIncrement={() => setCount((c) => c + 1)}
      />
    );
  },
};
