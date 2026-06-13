import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { TimerDisplay } from './TimerDisplay';

export default { title: 'Game/TimerDisplay' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { label, up } = useControls({ label: '0:42', up: false }, { store });
    return <TimerDisplay label={label} up={up} />;
  },
};
