import type { StoryObj } from '@storybook/react-vite';
import { useControls, useStoreContext } from 'leva';

import { WarnText } from './WarnText';

export default { title: 'Primitives/WarnText' };

export const Playground: StoryObj = {
  render: () => {
    const store = useStoreContext();
    const { children } = useControls(
      { children: "⚠ Fewer than 5 players is for quick testing — the game won't be much fun." },
      { store },
    );
    return <WarnText>{children}</WarnText>;
  },
};
