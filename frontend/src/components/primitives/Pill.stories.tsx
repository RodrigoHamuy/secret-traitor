import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { Pill } from './Pill';

export default { title: 'Primitives/Pill' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children } = useControls({ children: '6 still alive' }, { store });
    return <Pill>{children}</Pill>;
  },
};
