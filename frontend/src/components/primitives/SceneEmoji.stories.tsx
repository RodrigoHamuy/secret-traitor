import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { SceneEmoji } from './SceneEmoji';

export default { title: 'Primitives/SceneEmoji' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children } = useControls({ children: '🗳️' }, { store });
    return <SceneEmoji>{children}</SceneEmoji>;
  },
};
