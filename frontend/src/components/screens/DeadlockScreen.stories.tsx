import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { DeadlockScreen } from './DeadlockScreen';

export default { title: 'Screens/DeadlockScreen' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    // Comma-separated tied players.
    const { tiedNames } = useControls({ tiedNames: 'Isabella, Lorenzo' }, { store });
    const names = tiedNames
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return <DeadlockScreen tiedNames={names} />;
  },
};
